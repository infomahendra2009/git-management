export const questionInclude = { options: { orderBy: { position: 'asc' } } };

function fields(v) {
  return {
    type: v.type,
    text: v.text,
    imageUrl: v.imageUrl,
    imageAlt: v.imageAlt,
    points: v.points,
    explanation: v.explanation,
    category: v.category,
    difficulty: v.difficulty,
    timeLimit: v.timeLimit,
    shuffleOptions: v.shuffleOptions,
    partialScoring: v.partialScoring,
    caseSensitive: v.caseSensitive,
    matchMode: v.matchMode,
    tfAnswer: v.tfAnswer,
    acceptedAnswers: v.acceptedAnswers,
  };
}

const optionRows = (v) =>
  v.options.map((o, i) => ({ position: i, text: o.text, imageUrl: o.imageUrl, isCorrect: o.isCorrect }));

export function createQuestion(tx, ownerId, v, externalId = null) {
  return tx.question.create({
    data: { ownerId, externalId, ...fields(v), options: { create: optionRows(v) } },
    include: questionInclude,
  });
}

export function updateQuestion(tx, id, v) {
  return tx.question.update({
    where: { id },
    data: { ...fields(v), options: { deleteMany: {}, create: optionRows(v) } },
    include: questionInclude,
  });
}

// Staff-only shape (includes correct answers). Never send this to students.
export function serialize(q) {
  return {
    id: q.id,
    externalId: q.externalId,
    type: q.type,
    text: q.text,
    imageUrl: q.imageUrl,
    imageAlt: q.imageAlt,
    points: q.points,
    explanation: q.explanation,
    category: q.category,
    difficulty: q.difficulty,
    timeLimit: q.timeLimit,
    shuffleOptions: q.shuffleOptions,
    partialScoring: q.partialScoring,
    caseSensitive: q.caseSensitive,
    matchMode: q.matchMode,
    tfAnswer: q.tfAnswer,
    acceptedAnswers: q.acceptedAnswers,
    options: (q.options || []).map((o) => ({ text: o.text, imageUrl: o.imageUrl, isCorrect: o.isCorrect })),
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}
