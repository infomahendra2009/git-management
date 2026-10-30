// Single source of truth for question validation (manual form API and CSV import).
export const TYPES = ['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'TEXT_INPUT', 'ESSAY'];
export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const IMG_RE = /^(https?:\/\/[^\s]+|\/api\/media\/[0-9a-fA-F-]{36})$/;

const str = (x) => (x === undefined || x === null ? '' : String(x).trim());

function checkImage(url, label, errors) {
  if (url && (!IMG_RE.test(url) || url.length > 500)) {
    errors.push(`${label} must be a valid http(s) URL or an uploaded image`);
  }
}

export function validateQuestion(i) {
  const errors = [];
  if (!TYPES.includes(i.type)) return { errors: [`'${i.type ?? ''}' is not a valid question type`] };

  const text = str(i.text);
  const imageUrl = str(i.imageUrl);
  if (!text && !imageUrl) errors.push('Question needs text or an image');
  if (text.length > 5000) errors.push('Question text is too long (max 5000 characters)');
  checkImage(imageUrl, 'Question image', errors);

  const points = Number(i.points);
  if (!Number.isFinite(points) || points <= 0 || points > 1000) errors.push('Points must be a positive number');

  const diffRaw = str(i.difficulty).toUpperCase();
  if (diffRaw && !DIFFICULTIES.includes(diffRaw)) errors.push(`Difficulty must be Easy, Medium or Hard`);

  const tlRaw = str(i.timeLimit);
  const timeLimit = tlRaw === '' ? null : Number(tlRaw);
  if (timeLimit !== null && (!Number.isInteger(timeLimit) || timeLimit < 1 || timeLimit > 86400)) {
    errors.push('Time limit must be a whole number of seconds');
  }

  const mmRaw = str(i.matchMode).toUpperCase();
  if (mmRaw && !['EXACT', 'CONTAINS'].includes(mmRaw)) errors.push('Match mode must be Exact or Contains');

  const category = str(i.category);
  if (category.length > 80) errors.push('Category is too long (max 80 characters)');

  const v = {
    type: i.type,
    text,
    imageUrl: imageUrl || null,
    imageAlt: str(i.imageAlt).slice(0, 255) || null,
    points,
    explanation: str(i.explanation) || null,
    category: category || null,
    difficulty: DIFFICULTIES.includes(diffRaw) ? diffRaw : null,
    timeLimit,
    shuffleOptions: false,
    partialScoring: false,
    caseSensitive: false,
    matchMode: 'EXACT',
    options: [],
    tfAnswer: null,
    acceptedAnswers: [],
  };

  if (i.type === 'MULTIPLE_CHOICE' || i.type === 'MULTIPLE_SELECT') {
    v.shuffleOptions = !!i.shuffleOptions;
    const opts = (Array.isArray(i.options) ? i.options : [])
      .map((o) => ({ text: str(o?.text), imageUrl: str(o?.imageUrl), isCorrect: !!o?.isCorrect }))
      .filter((o) => o.text || o.imageUrl);
    if (opts.length < 2) errors.push('At least 2 options are required');
    if (opts.length > 10) errors.push('At most 10 options are allowed');
    opts.forEach((o, n) => {
      if (o.text.length > 500) errors.push(`Option ${n + 1} text is too long (max 500 characters)`);
      checkImage(o.imageUrl, `Option ${n + 1} image`, errors);
    });
    const correct = opts.filter((o) => o.isCorrect).length;
    if (i.type === 'MULTIPLE_CHOICE' && correct !== 1) errors.push('Multiple choice needs exactly one correct answer');
    if (i.type === 'MULTIPLE_SELECT') {
      if (correct < 1) errors.push('Multiple select needs at least one correct answer');
      v.partialScoring = !!i.partialScoring;
    }
    v.options = opts.map((o) => ({ text: o.text, imageUrl: o.imageUrl || null, isCorrect: o.isCorrect }));
  } else if (i.type === 'TRUE_FALSE') {
    if (typeof i.tfAnswer !== 'boolean') errors.push('True/False answer must be True or False');
    else v.tfAnswer = i.tfAnswer;
  } else if (i.type === 'TEXT_INPUT') {
    v.caseSensitive = !!i.caseSensitive;
    v.matchMode = mmRaw === 'CONTAINS' ? 'CONTAINS' : 'EXACT';
    const accepted = [...new Set((Array.isArray(i.acceptedAnswers) ? i.acceptedAnswers : []).map(str).filter(Boolean))];
    if (accepted.length === 0) errors.push('Text input needs at least one accepted answer');
    if (accepted.some((a) => a.length > 500)) errors.push('Accepted answers are limited to 500 characters');
    v.acceptedAnswers = accepted;
  }
  // ESSAY: no options or answer key. A teacher marks it by hand. The explanation field can hold a model answer.

  return { errors, value: errors.length ? null : v };
}
