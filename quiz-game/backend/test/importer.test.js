import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, analyze, buildTemplate, exportCsv } from '../src/services/importer.js';
import { validateQuestion } from '../src/services/questionSchema.js';

// Sample from the requirements document (section 14)
const SAMPLE = `question_id,question_type,question_text,question_image_url,points,correct_answer,option_1_text,option_1_image_url,option_2_text,option_2_image_url,option_3_text,option_3_image_url,option_4_text,option_4_image_url,explanation,category,difficulty,time_limit,shuffle_options
Q001,multiple_choice,"What is the capital of France?","",1,option_1,"Paris","","London","","Berlin","","Madrid","","Paris is the capital.","Geography","Easy",30,"Yes"
Q002,true_false,"The Earth is flat.","",1,False,"","","","","","","","","Roughly spherical.","Science","Easy",20,"No"
Q003,multiple_select,"Which are prime numbers?","",2,"option_1,option_3","2","","4","","7","","9","","Primes.","Math","Medium",45,"Yes"
Q004,text_input,"What is H2O commonly known as?","",1,"water,Water","","","","","","","","","Water.","Chemistry","Easy",30,"No"
Q005,multiple_choice,"Identify the animal:","https://example.com/elephant.jpg",1,option_2,"Lion","https://example.com/lion.png","Elephant","https://example.com/e.png","Tiger","","Bear","","Elephant.","Animals","Medium",40,"Yes"
`;

const run = (csv, mode = 'create', existing = []) => {
  const p = parseCsv(Buffer.from(csv));
  assert.ok(!p.fatal, p.fatal);
  return analyze({ ...p, mode, existingIds: new Set(existing) });
};

test('sample CSV from requirements imports cleanly', () => {
  const r = run(SAMPLE);
  assert.deepEqual(r.errors, []);
  assert.equal(r.valid.length, 5);
  const q3 = r.valid[2].value;
  assert.equal(q3.type, 'MULTIPLE_SELECT');
  assert.deepEqual(q3.options.map((o) => o.isCorrect), [true, false, true, false]);
  assert.equal(r.valid[1].value.tfAnswer, false);
  assert.deepEqual(r.valid[3].value.acceptedAnswers, ['water', 'Water']);
});

test('reports line-level errors', () => {
  const csv = `question_id,question_type,question_text,points,correct_answer,option_1_text,option_2_text
A1,multi_choice,Hi,1,option_1,a,b
A2,multiple_choice,Pick,1,option_5,a,b
A3,multiple_choice,Pick,0,option_1,a,b
A4,multiple_choice,Pick,1,option_1,only one,
A1,true_false,Dup,1,True,,
`;
  const r = run(csv);
  const msgs = r.errors.map((e) => `${e.line}:${e.message}`).join('\n');
  assert.match(msgs, /2:'multi_choice' is not a valid question type/);
  assert.match(msgs, /3:correct_answer 'option_5' does not exist/);
  assert.match(msgs, /4:Points must be a positive number/);
  assert.match(msgs, /5:At least 2 options are required/);
  assert.match(msgs, /6:question_id 'A1' is repeated/);
  assert.equal(r.valid.length, 0);
});

test('missing required column and existing id handling', () => {
  const p = parseCsv(Buffer.from('question_id,question_type,points,correct_answer\nQ1,true_false,1,True\n'));
  const r = analyze({ ...p, mode: 'create', existingIds: new Set() });
  assert.match(r.errors[0].message, /Column 'question_text' is missing/);

  const dup = run('question_id,question_type,question_text,points,correct_answer\nQ1,true_false,Hi,1,True\n', 'create', ['Q1']);
  assert.match(dup.errors[0].message, /already exists/);
  const up = run('question_id,question_type,question_text,points,correct_answer\nQ1,true_false,Hi,1,True\n', 'upsert', ['Q1']);
  assert.equal(up.valid[0].action, 'update');
});

test('manual validation rules', () => {
  const ok = validateQuestion({ type: 'MULTIPLE_CHOICE', text: 'x', points: 1, options: [{ text: 'a', isCorrect: true }, { text: 'b' }] });
  assert.equal(ok.errors.length, 0);
  assert.ok(validateQuestion({ type: 'MULTIPLE_CHOICE', text: 'x', points: 1, options: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: true }] }).errors.length);
  assert.ok(validateQuestion({ type: 'TEXT_INPUT', text: 'x', points: 1, acceptedAnswers: [] }).errors.length);
  assert.ok(validateQuestion({ type: 'TRUE_FALSE', text: 'x', points: 1 }).errors.length);
  assert.ok(validateQuestion({ type: 'TRUE_FALSE', text: 'x', points: 1, tfAnswer: true, imageUrl: 'javascript:alert(1)' }).errors.length);
});

test('templates parse back through the importer', () => {
  for (const kind of ['multiple_choice', 'multiple_select', 'true_false', 'text_input', 'mixed']) {
    const r = run(buildTemplate(kind));
    assert.deepEqual(r.errors, [], kind);
    assert.ok(r.valid.length >= 1);
  }
});

test('export round-trips', () => {
  const r = run(SAMPLE);
  const qs = r.valid.map((v, i) => ({
    externalId: v.externalId, ...v.value, options: v.value.options.map((o) => ({ ...o })),
  }));
  const again = run(exportCsv(qs), 'upsert', qs.map((q) => q.externalId));
  assert.deepEqual(again.errors, []);
  assert.equal(again.valid.length, 5);
});

import AdmZip from 'adm-zip';
import { loadZip } from '../src/services/importer.js';

test('ZIP images: valid, fake and missing files', () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
  const z = new AdmZip();
  z.addFile('imgs/cat.png', png);
  z.addFile('fake.png', Buffer.from('this is not an image at all'));
  const zipImages = loadZip(z.toBuffer());
  assert.equal(zipImages.get('cat.png').ok, true);
  assert.equal(zipImages.get('fake.png').ok, false);

  const csv = `question_id,question_type,question_text,question_image_url,points,correct_answer
A,true_false,Cat?,cat.png,1,True
B,true_false,Fake?,fake.png,1,True
C,true_false,Missing?,nope.jpg,1,True
`;
  const p = parseCsv(Buffer.from(csv));
  const r = analyze({ ...p, mode: 'create', existingIds: new Set(), zipImages, urlFor: (k) => `/api/media/${'0'.repeat(36)}` });
  assert.equal(r.valid.length, 1);
  assert.equal(r.valid[0].value.imageUrl, `/api/media/${'0'.repeat(36)}`);
  assert.match(r.errors.map((e) => e.message).join('|'), /fake\.png' is invalid/);
  assert.match(r.errors.map((e) => e.message).join('|'), /nope\.jpg' was not found/);
});
