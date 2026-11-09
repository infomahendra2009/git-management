import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';

const prisma = new PrismaClient();

const vocabularyUrl = new URL('./data/vocabulary.json', import.meta.url);

function vocabularyQuestion(entry, entries) {
  const distractors = entries.filter((item) => item.word !== entry.word).slice(0, 3);
  const options = [
    { text: entry.meaning, isCorrect: true },
    ...distractors.map((item) => ({ text: item.meaning, isCorrect: false })),
  ];
  if (options.length !== 4 || new Set(options.map((option) => option.text)).size !== 4) {
    throw new Error(`Vocabulary entry "${entry.word}" needs three distinct distractor meanings`);
  }
  return {
    type: 'MULTIPLE_CHOICE',
    text: `Choose the English meaning of "${entry.word}".`,
    imageUrl: null,
    imageAlt: null,
    points: 1,
    explanation: `${entry.word}: ${entry.meaning}`,
    category: 'VOCABULARY_PRONUNCIATION',
    difficulty: 'EASY',
    timeLimit: null,
    shuffleOptions: true,
    partialScoring: false,
    caseSensitive: false,
    matchMode: 'EXACT',
    tfAnswer: null,
    acceptedAnswers: [],
    options,
  };
}

async function seedVocabularyQuestions(ownerId, entries) {
  const questions = [];
  for (const entry of entries) {
    const externalId = `vocabulary:${entry.word}`;
    const data = vocabularyQuestion(entry, entries);
    const optionRows = data.options.map((option, position) => ({ ...option, imageUrl: null, position }));
    const question = await prisma.question.upsert({
      where: { ownerId_externalId: { ownerId, externalId } },
      create: {
        ownerId, externalId,
        ...data,
        options: { create: optionRows },
      },
      update: {
        ...data,
        options: { deleteMany: {}, create: optionRows },
      },
      select: { id: true },
    });
    questions.push(question);
  }
  return questions;
}

async function seedVocabulary(ownerId) {
  const vocabulary = JSON.parse(await readFile(vocabularyUrl, 'utf8'));
  if (!Array.isArray(vocabulary.sourceWords) || !Array.isArray(vocabulary.entries) || vocabulary.entries.length < 4) {
    throw new Error('Vocabulary JSON must contain sourceWords and at least four entries');
  }
  const sourceWords = new Set(vocabulary.sourceWords);
  const seen = new Set();
  for (const entry of vocabulary.entries) {
    if (!entry || typeof entry.word !== 'string' || typeof entry.meaning !== 'string'
      || !sourceWords.has(entry.word) || !entry.meaning.trim() || seen.has(entry.word)) {
      throw new Error(`Invalid or duplicate vocabulary entry: ${entry?.word || '(missing word)'}`);
    }
    seen.add(entry.word);
  }

  const classes = await prisma.class.findMany({ select: { id: true, name: true, ownerId: true } });
  const targets = classes.length ? classes : [{ id: null, name: null, ownerId }];
  let totalQuestions = 0;
  for (const classRow of targets) {
    const quizOwnerId = classRow.ownerId;
    const questions = await seedVocabularyQuestions(quizOwnerId, vocabulary.entries);
    totalQuestions = questions.length;
    const title = classRow.id ? `Vocabulary Practice - ${classRow.name}` : 'Vocabulary Practice (assign to a class)';
    const existing = classRow.id
      ? await prisma.quiz.findFirst({
        where: { ownerId: quizOwnerId, title: { startsWith: 'Vocabulary Practice -' }, assignments: { some: { classId: classRow.id } } },
      })
      : await prisma.quiz.findFirst({ where: { ownerId: quizOwnerId, title } });
    const quizData = {
      ownerId: quizOwnerId,
      title,
      description: 'Choose each word’s English meaning and optionally practise saying the word aloud.',
      status: classRow.id ? 'PUBLISHED' : 'DRAFT',
      passPercent: 50,
      attemptsAllowed: 3,
      questionOrder: 'RANDOM',
      oneAtATime: true,
      showProgress: true,
      allowReview: true,
      releaseMode: 'IMMEDIATE',
      showCorrectAnswers: true,
      showExplanations: true,
    };
    const quiz = existing
      ? await prisma.quiz.update({ where: { id: existing.id }, data: quizData })
      : await prisma.quiz.create({ data: quizData });

    await prisma.$transaction([
      prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } }),
      prisma.quizQuestion.createMany({
        data: questions.map((question, position) => ({ quizId: quiz.id, questionId: question.id, position })),
      }),
    ]);

    if (classRow.id) {
      await prisma.quizAssignment.upsert({
        where: { quizId_classId: { quizId: quiz.id, classId: classRow.id } },
        create: { quizId: quiz.id, classId: classRow.id },
        update: {},
      });
    }
  }
  console.log(`Seeded ${totalQuestions} vocabulary questions for ${classes.length || 0} classes.`);
}

try {
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const e = process.env;
    admin = await prisma.user.create({
      data: {
        userCode: 'ADMIN001',
        name: e.SEED_ADMIN_NAME || 'Admin',
        email: (e.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
        phone: e.SEED_ADMIN_PHONE || '+919999999999',
        passwordHash: await bcrypt.hash(e.SEED_ADMIN_PASSWORD || 'ChangeMe@123', 10),
        role: 'ADMIN',
        mustChangePassword: true,
      },
    });
    console.log('Seeded first admin. Change the password after first login.');
  } else {
    console.log('Admin already exists, seed skipped.');
  }
  await seedVocabulary(admin.id);
} finally {
  await prisma.$disconnect();
}
