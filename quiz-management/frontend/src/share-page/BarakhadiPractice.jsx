import { useMemo, useRef, useState } from 'react';

export const pageTitle = 'Barakhadi Practice';
export const pageDescription = 'Fill in the Hindi barakhadi grid and check whether each typed value is correct.';

const VOWEL_FORMS = [
  { symbol: 'अ', matra: '', label: 'a' },
  { symbol: 'आ', matra: 'ा', label: 'aa' },
  { symbol: 'इ', matra: 'ि', label: 'i' },
  { symbol: 'ई', matra: 'ी', label: 'ee' },
  { symbol: 'उ', matra: 'ु', label: 'u' },
  { symbol: 'ऊ', matra: 'ू', label: 'oo' },
  { symbol: 'ए', matra: 'े', label: 'e' },
  { symbol: 'ऐ', matra: 'ै', label: 'ai' },
  { symbol: 'ओ', matra: 'ो', label: 'o' },
  { symbol: 'औ', matra: 'ौ', label: 'au' },
  { symbol: 'अं', matra: 'ं', label: 'an' },
  { symbol: 'अः', matra: 'ः', label: 'ah' },
];

const CONSONANTS = [
  ['क', 'k'], ['ख', 'kh'], ['ग', 'g'], ['घ', 'gh'], ['ङ', 'ng'],
  ['च', 'ch'], ['छ', 'chh'], ['ज', 'j'], ['झ', 'jh'], ['ञ', 'ny'],
  ['ट', 'T'], ['ठ', 'Th'], ['ड', 'D'], ['ढ', 'Dh'], ['ण', 'N'],
  ['त', 't'], ['थ', 'th'], ['द', 'd'], ['ध', 'dh'], ['न', 'n'],
  ['प', 'p'], ['फ', 'ph'], ['ब', 'b'], ['भ', 'bh'], ['म', 'm'],
  ['य', 'y'], ['र', 'r'], ['ल', 'l'], ['व', 'v'],
  ['श', 'sh'], ['ष', 'Sh'], ['स', 's'], ['ह', 'h'],
  ['क्ष', 'ksh'], ['त्र', 'tr'], ['ज्ञ', 'gy'],
];

const normalize = (value = '') => value.trim().replace(/\s+/g, '').replace(/\u200c/g, '');
const matchesAnswer = (value, expected, romanAliases = []) => {
  const typed = normalize(value);
  return typed === expected || romanAliases.some((alias) => typed.toLocaleLowerCase() === alias.toLocaleLowerCase());
};

const generateRows = () =>
  CONSONANTS.map(([consonant, roman]) => ({
    consonant,
    values: VOWEL_FORMS.map((vowel) => consonant + vowel.matra),
    romanValues: VOWEL_FORMS.map((vowel) => [`${roman}${vowel.label}`]),
  }));

export default function BarakhadiPractice() {
  const rows = useMemo(() => generateRows(), []);
  const [answers, setAnswers] = useState({});
  const [headerAnswers, setHeaderAnswers] = useState({});
  const [headerChecked, setHeaderChecked] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [visibleRowIndex, setVisibleRowIndex] = useState(null);
  const gridInputRefs = useRef(new Map());
  const visibleRows = visibleRowIndex === null
    ? rows.map((row, rowIndex) => ({ row, rowIndex }))
    : [{ row: rows[visibleRowIndex], rowIndex: visibleRowIndex }];

  const getKey = (rowIndex, colIndex) => `${rowIndex}-${colIndex}`;

  const navigateGrid = (event, rowIndex, colIndex) => {
    const directions = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    };
    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    const nextRow = Math.max(0, Math.min(visibleRows.length, rowIndex + direction[0]));
    const nextColumn = Math.max(0, Math.min(VOWEL_FORMS.length - 1, colIndex + direction[1]));
    const inputRowIndex = nextRow === 0 ? 0 : visibleRows[nextRow - 1].rowIndex + 1;
    gridInputRefs.current.get(getKey(inputRowIndex, nextColumn))?.focus();
  };

  const handleChange = (rowIndex, colIndex, value) => {
    const updatedAnswers = { ...answers, [getKey(rowIndex, colIndex)]: value };
    const rowComplete = rows[rowIndex].values.every((_, index) =>
      normalize(updatedAnswers[getKey(rowIndex, index)] || '') !== ''
    );
    setAnswers(updatedAnswers);
    setCheckedRows((current) => {
      if (rowComplete) return { ...current, [rowIndex]: true };
      if (!current[rowIndex]) return current;
      const next = { ...current };
      delete next[rowIndex];
      return next;
    });
  };

  const handleHeaderChange = (colIndex, value) => {
    const updatedAnswers = { ...headerAnswers, [colIndex]: value };
    const rowComplete = VOWEL_FORMS.every((_, index) =>
      normalize(updatedAnswers[index] || '') !== ''
    );
    setHeaderAnswers(updatedAnswers);
    setHeaderChecked(rowComplete);
  };

  const stats = useMemo(() => {
    let correct = 0;
    let total = VOWEL_FORMS.length;

    VOWEL_FORMS.forEach((vowel, index) => {
      if (matchesAnswer(headerAnswers[index] || '', vowel.symbol, [vowel.label])) correct += 1;
    });

    rows.forEach((row, rowIndex) => {
      row.values.forEach((expected, colIndex) => {
        const key = getKey(rowIndex, colIndex);
        total += 1;
        if (matchesAnswer(answers[key] || '', expected, row.romanValues[colIndex])) correct += 1;
      });
    });

    return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
  }, [answers, headerAnswers, rows]);

  const allRowsChecked = headerChecked && rows.every((_, rowIndex) => checkedRows[rowIndex]);
  const allCorrect = allRowsChecked && stats.correct === stats.total && stats.total > 0;
  const hasCheckedRows = headerChecked || Object.keys(checkedRows).length > 0;
  const headerCorrectCount = VOWEL_FORMS.filter((vowel, index) =>
    matchesAnswer(headerAnswers[index] || '', vowel.symbol, [vowel.label])
  ).length;
  const headerCheckClass = !headerChecked
    ? ''
    : headerCorrectCount === 0
      ? 'checked-empty'
      : headerCorrectCount === VOWEL_FORMS.length
        ? 'checked'
        : 'checked-partial';

  const revealAnswers = () => {
    setShowAnswers((current) => !current);
  };

  const resetBoard = () => {
    setAnswers({});
    setHeaderAnswers({});
    setHeaderChecked(false);
    setCheckedRows({});
    setShowAnswers(false);
  };

  const checkAll = () => {
    setHeaderChecked(true);
    setCheckedRows(Object.fromEntries(rows.map((_, rowIndex) => [rowIndex, true])));
  };

  const checkRow = (rowIndex) => {
    setCheckedRows((current) => ({ ...current, [rowIndex]: true }));
  };

  const showRandomRow = () => {
    const nextIndex = Math.floor(Math.random() * rows.length);
    setVisibleRowIndex((current) =>
      rows.length > 1 && nextIndex === current ? (nextIndex + 1) % rows.length : nextIndex
    );
  };

  return (
    <div className="barakhadi-practice">
      <style>{CSS}</style>
      <main className="practice-shell">
        <header className="practice-header">
          <div>
            <p className="eyebrow">Practice Sheet</p>
            <h1>Barakhadi answer check</h1>
            <p className="practice-instruction">हर खाने में सही हिंदी अक्षर लिखें। उदाहरण: क + आ = का</p>
          </div>
          <div className="header-actions">
            <button type="button" className="tool-button" onClick={showRandomRow}>Random row</button>
            {visibleRowIndex !== null && (
              <button type="button" className="tool-button alt" onClick={() => setVisibleRowIndex(null)}>
                Show all rows
              </button>
            )}
            <button type="button" className="tool-button" onClick={checkAll}>Check all</button>
            <button type="button" className="tool-button alt" onClick={revealAnswers}>
              {showAnswers ? 'Hide answers' : 'Show answers'}
            </button>
            <button type="button" className="tool-button alt" onClick={resetBoard}>Reset</button>
          </div>
        </header>
        {visibleRowIndex !== null && (
          <p className="practice-instruction">Showing one full row: {rows[visibleRowIndex].consonant}</p>
        )}

        <div className="summary-bar" role="status" aria-live="polite">
          <div>
            <span>Correct</span>
            <strong>{stats.correct} / {stats.total}</strong>
          </div>
          <div>
            <span>Accuracy</span>
            <strong>{stats.percent}%</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className={allCorrect ? 'success' : 'warning'}>
              {allCorrect ? 'All correct' : hasCheckedRows ? 'Need revision' : 'In progress'}
            </strong>
          </div>
        </div>

        <div className="sheet-wrap">
          <table className="barakhadi-table">
            <colgroup>
              <col className="consonant-column" />
              {VOWEL_FORMS.map((vowel) => <col key={vowel.label} className="vowel-column" />)}
              <col className="check-column" />
            </colgroup>
            <thead>
              <tr>
                <th className="corner-head">व्यंजन</th>
                {VOWEL_FORMS.map((vowel, colIndex) => {
                  const typed = headerAnswers[colIndex] || '';
                  const hasTyped = normalize(typed) !== '';
                  const isCorrect = matchesAnswer(typed, vowel.symbol, [vowel.label]);

                  return (
                    <th key={vowel.label} scope="col" className="vowel-head">
                      <span className="vowel-symbol">{vowel.symbol}</span>
                      {/* <span className="vowel-pronunciation">{vowel.label}</span> */}
                      <input
                        ref={(element) => {
                          const key = getKey(0, colIndex);
                          if (element) gridInputRefs.current.set(key, element);
                          else gridInputRefs.current.delete(key);
                        }}
                        type="text"
                        value={showAnswers ? vowel.symbol : typed}
                        placeholder={vowel.symbol}
                        onKeyDown={(event) => navigateGrid(event, 0, colIndex)}
                        onChange={(event) => {
                          setShowAnswers(false);
                          handleHeaderChange(colIndex, event.target.value);
                        }}
                        className={[
                          'cell-input',
                          showAnswers ? 'show-answer' : '',
                          hasTyped && !isCorrect ? 'wrong' : '',
                          hasTyped && isCorrect ? 'right' : '',
                        ].filter(Boolean).join(' ')}
                        aria-label={`Vowel answer for ${vowel.symbol}`}
                        aria-invalid={hasTyped && !isCorrect}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                    </th>
                  );
                })}
                <th className="row-check-head" scope="col">
                  <span className="check-label">Check</span>
                  <button
                    type="button"
                    className={`row-check-button ${headerCheckClass}`}
                    onClick={() => setHeaderChecked(true)}
                    aria-label="Check vowel row"
                  >
                    {headerChecked
                      ? `${headerCorrectCount}/${VOWEL_FORMS.length}`
                      : 'Check'}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ row, rowIndex }, displayIndex) => (
                <tr key={row.consonant}>
                  <th scope="row" className="row-label">{row.consonant}</th>
                  {row.values.map((expected, colIndex) => {
                    const key = getKey(rowIndex, colIndex);
                    const typed = answers[key] || '';
                    const normalized = normalize(typed);
                    const hasTyped = normalized !== '';
                    const isCorrect = matchesAnswer(typed, expected, row.romanValues[colIndex]);
                    const shouldHighlight = hasTyped && !isCorrect;
                    const displayValue = showAnswers ? expected : typed;

                    return (
                      <td key={key}>
                        <input
                          ref={(element) => {
                            const key = getKey(rowIndex + 1, colIndex);
                            if (element) gridInputRefs.current.set(key, element);
                            else gridInputRefs.current.delete(key);
                          }}
                          type="text"
                          value={displayValue}
                          placeholder={expected}
                          onKeyDown={(event) => navigateGrid(event, displayIndex + 1, colIndex)}
                          onChange={(event) => handleChange(rowIndex, colIndex, event.target.value)}
                          className={[
                            'cell-input',
                            showAnswers ? 'show-answer' : '',
                            shouldHighlight ? 'wrong' : '',
                            hasTyped && isCorrect ? 'right' : '',
                          ].filter(Boolean).join(' ')}
                          aria-label={`${row.consonant} with ${VOWEL_FORMS[colIndex].symbol}`}
                          aria-invalid={shouldHighlight}
                          spellCheck={false}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                        />
                      </td>
                    );
                  })}
                  <td className="row-check-cell">
                    {(() => {
                      const rowCorrectCount = row.values.filter((expected, colIndex) =>
                        matchesAnswer(answers[getKey(rowIndex, colIndex)] || '', expected, row.romanValues[colIndex])
                      ).length;
                      const rowChecked = !!checkedRows[rowIndex];
                      const checkClass = !rowChecked
                        ? ''
                        : rowCorrectCount === 0
                          ? 'checked-empty'
                          : rowCorrectCount === row.values.length
                            ? 'checked'
                            : 'checked-partial';

                      return (
                        <button
                          type="button"
                          className={`row-check-button ${checkClass}`}
                          onClick={() => checkRow(rowIndex)}
                          aria-label={`Check ${row.consonant} row`}
                        >
                          {rowChecked ? `${rowCorrectCount}/${row.values.length}` : 'Check'}
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="legend">
          <span><i className="dot green" /> Correct</span>
          <span><i className="dot red" /> Wrong</span>
          <span><i className="dot blue" /> Editable</span>
        </div>
      </main>
    </div>
  );
}

const CSS = `
.barakhadi-practice {
  --bg: #f4f7fb;
  --card: #ffffff;
  --ink: #1a2436;
  --muted: #5c6c82;
  --line: #dfe7f6;
  --accent: #2456d6;
  --accent-soft: #e9f0ff;
  --good: #1b8f5e;
  --good-soft: rgba(27, 143, 94, 0.12);
  --bad: #d94a4a;
  --bad-soft: rgba(217, 74, 74, 0.08);
  --warning: #ca8d2a;
  font-family: "Atkinson Hyperlegible", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
}

.barakhadi-practice * { box-sizing: border-box; }

.practice-shell {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 20px 12px 32px;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--accent);
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.practice-header h1 {
  margin: 0;
  font-size: clamp(1.7rem, 2vw, 2.2rem);
}

.practice-instruction {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tool-button {
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font: inherit;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  min-height: 40px;
}

.tool-button.alt {
  background: var(--accent-soft);
  border-color: #cfe0ff;
}

.summary-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.summary-bar > div {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-bar span {
  color: var(--muted);
  font-size: 0.82rem;
}

.summary-bar strong {
  font-size: 1.1rem;
}

.success { color: var(--good); }
.warning { color: var(--warning); }

.sheet-wrap {
  width: 100%;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: auto;
  box-shadow: 0 12px 28px rgba(26, 36, 54, 0.04);
}

.barakhadi-table {
  width: 100%;
  min-width: 960px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

.barakhadi-table .consonant-column,
.barakhadi-table .check-column {
  width: 8%;
}

.barakhadi-table .vowel-column {
  width: 7%;
}

.barakhadi-table th,
.barakhadi-table td {
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 0;
  background: #fff;
  text-align: center;
}

.barakhadi-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #edf3ff;
  min-width: 52px;
  padding: 7px 3px;
  font-size: 1rem;
}

.barakhadi-table .corner-head {
  left: 0;
  z-index: 2;
  min-width: 0;
}

.barakhadi-table .row-label {
  position: sticky;
  left: 0;
  z-index: 1;
  background: #edf3ff;
  min-width: 0;
  padding: 7px 6px;
  font-size: 1.15rem;
}

.barakhadi-table .row-check-head {
  min-width: 0;
}

.barakhadi-table .vowel-head {
  padding: 5px 3px;
}

.vowel-symbol,
.vowel-pronunciation {
  display: block;
  line-height: 1.2;
}

.vowel-pronunciation {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 400;
}

.vowel-head .cell-input {
  min-height: 34px;
  padding: 4px 1px;
  font-size: 0.95rem;
}

.check-label {
  display: block;
}

.row-check-head .row-check-button {
  display: block;
  margin-top: 4px;
}

.row-check-cell {
  min-width: 0;
  padding: 4px !important;
}

.row-check-button {
  width: 100%;
  min-height: 34px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--card);
  color: var(--accent);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.row-check-button.checked {
  background: var(--good-soft);
  border-color: var(--good);
  color: var(--good);
  font-weight: 700;
}

.row-check-button.checked-empty {
  background: #f1f3f5;
  border-color: #b7c0ca;
  color: #64707d;
  font-weight: 700;
}

.row-check-button.checked-partial {
  background: var(--bad-soft);
  border-color: var(--bad);
  color: var(--bad);
  font-weight: 700;
}

.cell-input {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 1rem;
  text-align: center;
  padding: 6px 2px;
}

.cell-input:focus {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  background: var(--accent-soft);
}

.cell-input.right {
  background: var(--good-soft);
  color: var(--good);
}

.cell-input.wrong {
  background: var(--bad-soft);
  color: var(--bad);
}

.cell-input.show-answer {
  background: rgba(36, 86, 214, 0.06);
}

.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 18px;
  color: var(--muted);
  font-size: 0.9rem;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.green { background: var(--good); }
.dot.red { background: var(--bad); }
.dot.blue { background: var(--accent); }

@media (max-width: 700px) {
  .summary-bar {
    grid-template-columns: 1fr;
  }
}
`;
