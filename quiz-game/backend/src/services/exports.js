import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Stop spreadsheet formula injection: text that starts with = + - @ is shown as plain text.
export const safe = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};
const when = (d) => (d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '');
const mins = (s) => (s === null || s === undefined ? '' : Math.round((s / 60) * 10) / 10);
const result = (p) => (p === true ? 'Pass' : p === false ? 'Fail' : '');
const cellCsv = (v) => {
  const s = String(safe(v));
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ----- report -> generic {title, subtitle, sections:[{heading, headers, rows}] } -----
export function quizExport(r) {
  const s = r.summary;
  return {
    title: `Quiz report: ${r.quiz.title}`,
    subtitle: `Attempts counted: ${r.basis} per student · pass mark ${r.quiz.passPercent}%`,
    sections: [
      { heading: 'Summary', headers: ['Metric', 'Value'], rows: [
        ['Students assigned', s.assigned], ['Students attempted', s.attemptedStudents], ['Completion rate %', s.completionRate],
        ['Attempts counted', s.count], ['Average %', s.avgPercent], ['Median %', s.medianPercent], ['Highest %', s.highest], ['Lowest %', s.lowest],
        ['Pass rate %', s.passRate], ['Average time (min)', mins(s.avgTimeSeconds)],
      ] },
      { heading: 'Results', headers: ['Student', 'User ID', 'Attempt', 'Score', 'Max', 'Percent', 'Result', 'Time (min)', 'Submitted', 'Auto-submitted'],
        rows: r.results.map((x) => [x.student, x.userCode, x.attemptNo, x.score, x.maxScore, x.percent, result(x.passed), mins(x.timeTakenSeconds), when(x.submittedAt), x.autoSubmitted ? 'Yes' : 'No']) },
      { heading: 'Question analysis', headers: ['#', 'Question', 'Type', 'Category', 'Difficulty', 'Attempts', 'Answered', '% correct', 'Avg time (s)', 'Most common wrong answer'],
        rows: r.questions.map((q, i) => [i + 1, q.text.slice(0, 200), q.type, q.category || '', q.difficulty || '', q.attempts, q.answered, q.percentCorrect, q.avgTimeSeconds, q.topWrong[0] ? `${q.topWrong[0].answer} (${q.topWrong[0].count})` : '']) },
      { heading: 'Categories', headers: ['Category', 'Earned', 'Max', 'Percent'], rows: r.categories.map((c) => [c.name, c.earned, c.max, c.percent]) },
    ],
  };
}

export function studentExport(r) {
  const s = r.summary;
  return {
    title: `Student report: ${r.student.name} (${r.student.userCode})`,
    subtitle: `${s.attempts} attempts · average ${s.avgPercent ?? '-'}%`,
    sections: [
      { heading: 'Summary', headers: ['Metric', 'Value'], rows: [['Attempts', s.attempts], ['Quizzes', s.quizzes], ['Average %', s.avgPercent], ['Best %', s.best], ['Latest %', s.latest], ['Passed', s.passedCount]] },
      { heading: 'Attempts', headers: ['Quiz', 'Attempt', 'Submitted', 'Score', 'Max', 'Percent', 'Result', 'Time (min)'],
        rows: r.attempts.map((a) => [a.quizTitle, a.attemptNo, when(a.submittedAt), a.score, a.maxScore, a.percent, result(a.passed), mins(a.timeTakenSeconds)]) },
      { heading: 'Categories', headers: ['Category', 'Earned', 'Max', 'Percent'], rows: r.categories.map((c) => [c.name, c.earned, c.max, c.percent]) },
      { heading: 'Difficulty', headers: ['Difficulty', 'Earned', 'Max', 'Percent'], rows: r.difficulty.map((c) => [c.name, c.earned, c.max, c.percent]) },
    ],
  };
}

export function classExport(r) {
  return {
    title: `Class report: ${r.class.name}`,
    subtitle: 'Best attempt per student per quiz (percent)',
    sections: [
      { heading: 'Results', headers: ['Student', 'User ID', ...r.quizzes.map((q) => q.title), 'Average %', 'Quizzes done'],
        rows: r.students.map((st) => [st.name, st.userCode, ...r.quizzes.map((q) => (st.cells[q.id] ? st.cells[q.id].percent : '')), st.avgPercent, st.completed]) },
      { heading: 'Quiz statistics', headers: ['Quiz', 'Assigned', 'Attempted', 'Average %', 'Pass rate %'],
        rows: r.quizStats.map((q) => [q.title, q.assigned, q.attempted, q.avgPercent, q.passRate]) },
    ],
  };
}

// ----- renderers -----
export function renderCsv(rep) {
  const lines = [[rep.title], [rep.subtitle], []];
  for (const sec of rep.sections) lines.push([sec.heading], sec.headers, ...sec.rows, []);
  return '\ufeff' + lines.map((l) => l.map(cellCsv).join(',')).join('\r\n') + '\r\n';
}

export async function renderXlsx(rep) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Quiz Platform';
  const used = new Set();
  for (const sec of rep.sections) {
    let name = sec.heading.replace(/[\[\]:*?/\\]/g, ' ').slice(0, 31) || 'Sheet';
    while (used.has(name.toLowerCase())) name = `${name.slice(0, 28)}_${used.size}`;
    used.add(name.toLowerCase());
    const ws = wb.addWorksheet(name);
    ws.addRow(sec.headers.map(safe));
    sec.rows.forEach((r) => ws.addRow(r.map(safe)));
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.columns.forEach((col, i) => {
      const lens = [String(sec.headers[i] ?? '').length, ...sec.rows.slice(0, 200).map((r) => String(r[i] ?? '').length)];
      col.width = Math.min(60, Math.max(8, ...lens) + 2);
    });
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

// The built-in PDF font only covers Latin text; other scripts appear as "?". Use Excel/CSV for those.
const pdfText = (v) => String(v ?? '').replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, '?');

export function renderPdf(rep) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 36;
    const usable = doc.page.width - 72;
    const bottom = doc.page.height - 40;
    const rowH = 16;

    doc.font('Helvetica-Bold').fontSize(16).text(pdfText(rep.title), left, 36, { width: usable });
    doc.font('Helvetica').fontSize(9).fillColor('#555').text(pdfText(rep.subtitle), { width: usable });
    doc.fillColor('#000');
    let y = doc.y + 14;

    for (const sec of rep.sections) {
      if (y + 60 > bottom) { doc.addPage(); y = 36; }
      doc.font('Helvetica-Bold').fontSize(12).text(pdfText(sec.heading), left, y, { width: usable });
      y += 18;
      const lens = sec.headers.map((h, i) => Math.min(45, Math.max(5, String(h).length, ...sec.rows.slice(0, 60).map((r) => String(r[i] ?? '').length))));
      const total = lens.reduce((a, b) => a + b, 0);
      const widths = lens.map((l) => (l / total) * usable);

      const drawRow = (cells, header) => {
        if (y + rowH > bottom) { doc.addPage(); y = 36; if (!header) drawRow(sec.headers, true); }
        if (header) doc.rect(left, y, usable, rowH).fill('#e8eaf0').fillColor('#000');
        let x = left;
        doc.font(header ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
        cells.forEach((c, i) => {
          doc.text(pdfText(c), x + 3, y + 4, { width: widths[i] - 6, height: rowH - 4, ellipsis: true, lineBreak: false });
          x += widths[i];
        });
        y += rowH;
        if (!header) doc.moveTo(left, y).lineTo(left + usable, y).lineWidth(0.25).strokeColor('#ccc').stroke().strokeColor('#000');
      };
      drawRow(sec.headers, true);
      if (sec.rows.length === 0) { doc.font('Helvetica-Oblique').fontSize(8).text('No data', left + 3, y + 4); y += rowH; }
      sec.rows.forEach((r) => drawRow(r, false));
      y += 14;
    }
    doc.end();
  });
}

export const FORMATS = {
  csv: { ext: 'csv', type: 'text/csv; charset=utf-8', render: async (rep) => Buffer.from(renderCsv(rep), 'utf8') },
  xlsx: { ext: 'xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', render: renderXlsx },
  pdf: { ext: 'pdf', type: 'application/pdf', render: renderPdf },
};
