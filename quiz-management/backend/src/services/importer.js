import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';
import path from 'path';
import { validateQuestion } from './questionSchema.js';
import { sniffImage, MAX_IMAGE_BYTES } from './images.js';

export const REQUIRED_COLUMNS = ['question_id', 'question_type', 'question_text', 'points', 'correct_answer'];
export const MAX_ROWS = 5000;
const MAX_OPTIONS = 10;

const BASE_COLUMNS = [
  'question_id', 'question_type', 'question_text', 'question_image_url', 'question_image_alt',
  'points', 'correct_answer', 'explanation', 'category', 'difficulty', 'time_limit',
  'shuffle_options', 'case_sensitive', 'partial_scoring', 'match_mode',
];
const columnsFor = (n) => [
  ...BASE_COLUMNS,
  ...Array.from({ length: n }, (_, i) => [`option_${i + 1}_text`, `option_${i + 1}_image_url`]).flat(),
];

const TYPE_MAP = {
  multiple_choice: 'MULTIPLE_CHOICE',
  multiple_select: 'MULTIPLE_SELECT',
  true_false: 'TRUE_FALSE',
  text_input: 'TEXT_INPUT',
  essay: 'ESSAY',
};
const str = (x) => (x === undefined || x === null ? '' : String(x).trim());

// ---------- parsing ----------
export function parseCsv(buf) {
  let items;
  try {
    items = parse(buf, { bom: true, skip_empty_lines: true, trim: true, relax_column_count: true, info: true });
  } catch (e) {
    return { fatal: `CSV could not be read: ${e.message}` };
  }
  if (!items.length) return { fatal: 'CSV file is empty' };
  const headers = items[0].record.map((h) => str(h).toLowerCase());
  const rows = items.slice(1).map(({ record, info }) => {
    const data = {};
    headers.forEach((h, i) => { data[h] = record[i] ?? ''; });
    return { line: info.lines, data };
  });
  return { headers, rows };
}

// Reads a ZIP of images. Returns Map(lowercase filename -> {ok, reason, buf, mime, ext}).
export function loadZip(buf) {
  const zip = new AdmZip(buf);
  const entries = zip.getEntries();
  if (entries.length > 2000) throw new Error('ZIP has too many files');
  const map = new Map();
  for (const e of entries) {
    const base = path.basename(e.entryName);
    if (e.isDirectory || e.entryName.startsWith('__MACOSX') || base.startsWith('.')) continue;
    const key = base.toLowerCase();
    if (e.header.size > MAX_IMAGE_BYTES) { map.set(key, { ok: false, reason: 'larger than 5 MB' }); continue; }
    const data = e.getData();
    const kind = sniffImage(data);
    map.set(key, kind ? { ok: true, buf: data, ...kind } : { ok: false, reason: 'not a valid JPG, PNG, GIF or WebP image' });
  }
  return map;
}

// ---------- analysis / validation ----------
function parseBool(raw, col, errors) {
  const v = str(raw).toLowerCase();
  if (v === '') return false;
  if (['yes', 'y', 'true', '1'].includes(v)) return true;
  if (['no', 'n', 'false', '0'].includes(v)) return false;
  errors.push(`${col} must be Yes or No`);
  return false;
}

export function analyze({ headers, rows, mode, existingIds, zipImages = new Map(), urlFor = () => null }) {
  const errors = [];
  const valid = [];
  const summary = [];
  const used = new Set();
  const seen = new Map();

  for (const c of REQUIRED_COLUMNS) {
    if (!headers.includes(c)) errors.push({ line: 1, message: `Column '${c}' is missing` });
  }
  if (errors.length) return { errors, valid, rows: summary, used };

  for (const { line, data } of rows) {
    const e = [];
    const get = (c) => str(data[c]);

    const id = get('question_id');
    if (!id) e.push('question_id is required');
    else if (id.length > 60) e.push('question_id is too long (max 60 characters)');
    else if (seen.has(id)) e.push(`question_id '${id}' is repeated (first used on line ${seen.get(id)})`);
    else seen.set(id, line);
    if (id && mode === 'create' && existingIds.has(id)) e.push(`question_id '${id}' already exists`);

    const type = TYPE_MAP[get('question_type').toLowerCase()];
    if (!type) e.push(`'${get('question_type')}' is not a valid question type`);

    const img = (ref) => {
      if (!ref) return '';
      if (/^https?:\/\//i.test(ref)) return ref;
      const key = path.basename(ref).toLowerCase();
      const info = zipImages.get(key);
      if (!info) { e.push(`Image '${ref}' was not found in the ZIP file`); return ''; }
      if (!info.ok) { e.push(`Image '${ref}' is invalid: ${info.reason}`); return ''; }
      used.add(key);
      return urlFor(key) || '';
    };

    const options = [];
    const indexMap = new Map();
    for (let n = 1; n <= MAX_OPTIONS; n++) {
      const t = get(`option_${n}_text`);
      const im = img(get(`option_${n}_image_url`));
      if (t || im) { indexMap.set(n, options.length); options.push({ text: t, imageUrl: im, isCorrect: false }); }
    }

    const correctRaw = get('correct_answer');
    let tfAnswer = null;
    let acceptedAnswers = [];
    if (type === 'MULTIPLE_CHOICE' || type === 'MULTIPLE_SELECT') {
      const tokens = correctRaw.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
      if (!tokens.length) e.push('correct_answer is required');
      for (const t of tokens) {
        const m = /^option_(\d+)$/i.exec(t);
        if (!m || !indexMap.has(Number(m[1]))) e.push(`correct_answer '${t}' does not exist`);
        else options[indexMap.get(Number(m[1]))].isCorrect = true;
      }
    } else if (type === 'TRUE_FALSE') {
      const t = correctRaw.toLowerCase();
      if (['true', 't'].includes(t)) tfAnswer = true;
      else if (['false', 'f'].includes(t)) tfAnswer = false;
      else e.push(`correct_answer must be True or False`);
    } else if (type === 'TEXT_INPUT') {
      acceptedAnswers = correctRaw.split(correctRaw.includes('|') ? '|' : ',').map((t) => t.trim()).filter(Boolean);
    }

    const input = {
      type,
      text: get('question_text'),
      imageUrl: img(get('question_image_url')),
      imageAlt: get('question_image_alt'),
      points: get('points'),
      explanation: get('explanation'),
      category: get('category'),
      difficulty: get('difficulty'),
      timeLimit: get('time_limit'),
      shuffleOptions: parseBool(data.shuffle_options, 'shuffle_options', e),
      partialScoring: parseBool(data.partial_scoring, 'partial_scoring', e),
      caseSensitive: parseBool(data.case_sensitive, 'case_sensitive', e),
      matchMode: get('match_mode'),
      options,
      tfAnswer,
      acceptedAnswers,
    };
    if (type) {
      const r = validateQuestion(input);
      e.push(...r.errors);
      if (!e.length) valid.push({ line, externalId: id, value: r.value, action: existingIds.has(id) ? 'update' : 'create' });
    }
    e.forEach((message) => errors.push({ line, message }));
    summary.push({ line, id, type: type || get('question_type'), text: get('question_text').slice(0, 80), ok: e.length === 0 });
  }
  return { errors, valid, rows: summary, used };
}

// ---------- CSV writing (templates + export) ----------
const cell = (v) => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (headers, rows) =>
  '\ufeff' + [headers, ...rows.map((r) => headers.map((h) => r[h]))].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';

const EXAMPLES = {
  multiple_choice: [
    { question_id: 'MC001', question_type: 'multiple_choice', question_text: 'What is the capital of France?', points: 1, correct_answer: 'option_1', option_1_text: 'Paris', option_2_text: 'London', option_3_text: 'Berlin', option_4_text: 'Madrid', explanation: 'Paris is the capital of France.', category: 'Geography', difficulty: 'Easy', time_limit: 30, shuffle_options: 'Yes' },
    { question_id: 'MC002', question_type: 'multiple_choice', question_text: 'Which planet is known as the Red Planet?', points: 1, correct_answer: 'option_2', option_1_text: 'Venus', option_2_text: 'Mars', option_3_text: 'Jupiter', category: 'Science', difficulty: 'Easy', shuffle_options: 'Yes' },
  ],
  multiple_select: [
    { question_id: 'MS001', question_type: 'multiple_select', question_text: 'Which of these are programming languages?', points: 2, correct_answer: 'option_1,option_3', option_1_text: 'Python', option_2_text: 'Apple', option_3_text: 'JavaScript', option_4_text: 'Banana', partial_scoring: 'Yes', category: 'Computers', difficulty: 'Easy', shuffle_options: 'Yes' },
    { question_id: 'MS002', question_type: 'multiple_select', question_text: 'Select all prime numbers.', points: 2, correct_answer: 'option_1,option_3', option_1_text: '2', option_2_text: '4', option_3_text: '7', option_4_text: '9', partial_scoring: 'No', category: 'Math', difficulty: 'Medium' },
  ],
  true_false: [
    { question_id: 'TF001', question_type: 'true_false', question_text: 'The Earth is flat.', points: 1, correct_answer: 'False', explanation: 'The Earth is roughly spherical.', category: 'Science', difficulty: 'Easy' },
    { question_id: 'TF002', question_type: 'true_false', question_text: 'Water boils at 100 C at sea level.', points: 1, correct_answer: 'True', category: 'Science', difficulty: 'Easy' },
  ],
  essay: [
    { question_id: 'ES001', question_type: 'essay', question_text: 'Explain why the sky is blue.', points: 5, explanation: 'Model answer: Rayleigh scattering scatters short (blue) wavelengths more.', category: 'Science', difficulty: 'Medium' },
  ],
  text_input: [
    { question_id: 'TX001', question_type: 'text_input', question_text: 'What is 2 + 2?', points: 1, correct_answer: '4|four', case_sensitive: 'No', match_mode: 'exact', category: 'Math', difficulty: 'Easy' },
    { question_id: 'TX002', question_type: 'text_input', question_text: 'What is H2O commonly known as?', points: 1, correct_answer: 'water', case_sensitive: 'No', match_mode: 'exact', category: 'Chemistry', difficulty: 'Easy' },
  ],
};

export function buildTemplate(kind) {
  if (kind === 'mixed') {
    const rows = Object.values(EXAMPLES).map((r) => r[0]);
    return toCsv(columnsFor(6), rows);
  }
  if (!EXAMPLES[kind]) return null;
  const hasOptions = kind === 'multiple_choice' || kind === 'multiple_select';
  return toCsv(columnsFor(hasOptions ? 6 : 0), EXAMPLES[kind]);
}

export function exportCsv(questions) {
  const maxOpts = Math.max(4, ...questions.map((q) => q.options.length));
  const rows = questions.map((q) => {
    const row = {
      question_id: q.externalId || '', question_type: q.type.toLowerCase(), question_text: q.text,
      question_image_url: q.imageUrl, question_image_alt: q.imageAlt, points: q.points,
      explanation: q.explanation, category: q.category, difficulty: q.difficulty ? q.difficulty[0] + q.difficulty.slice(1).toLowerCase() : '',
      time_limit: q.timeLimit, shuffle_options: q.shuffleOptions ? 'Yes' : 'No',
      case_sensitive: q.caseSensitive ? 'Yes' : 'No', partial_scoring: q.partialScoring ? 'Yes' : 'No',
      match_mode: q.matchMode.toLowerCase(),
    };
    if (q.type === 'TRUE_FALSE') row.correct_answer = q.tfAnswer ? 'True' : 'False';
    else if (q.type === 'TEXT_INPUT') row.correct_answer = (q.acceptedAnswers || []).join('|');
    else {
      row.correct_answer = q.options.map((o, i) => (o.isCorrect ? `option_${i + 1}` : null)).filter(Boolean).join(',');
      q.options.forEach((o, i) => { row[`option_${i + 1}_text`] = o.text; row[`option_${i + 1}_image_url`] = o.imageUrl; });
    }
    return row;
  });
  return toCsv(columnsFor(maxOpts), rows);
}
