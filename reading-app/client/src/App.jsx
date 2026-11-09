import { useEffect, useRef, useState } from "react";

/* ---------- helpers ---------- */
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const splitClean = (s) => s.split(/\s+/).map(norm).filter(Boolean);

function lev(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}
const sim = (a, b) => (a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));

// Align lesson words with what the student said/typed.
// status: ok | near (pronunciation or spelling issue) | bad (wrong word) | miss (skipped)
function check(lessonText, studentText) {
  const target = lessonText.split(/\s+/).filter(Boolean);
  const a = target.map(norm);
  const b = splitClean(studentText);
  const n = a.length, m = b.length;
  const D = Array.from({ length: n + 1 }, (_, i) => [i, ...Array(m).fill(0)]);
  for (let j = 1; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (1 - sim(a[i - 1], b[j - 1])));

  const out = Array(n);
  let i = n, j = m;
  while (i > 0) {
    if (j > 0 && Math.abs(D[i][j] - (D[i - 1][j - 1] + 1 - sim(a[i - 1], b[j - 1]))) < 1e-9) {
      out[i - 1] = { heard: b[j - 1], s: sim(a[i - 1], b[j - 1]) }; i--; j--;
    } else if (Math.abs(D[i][j] - (D[i - 1][j] + 1)) < 1e-9) {
      out[i - 1] = { heard: null, s: 0 }; i--;
    } else j--;
  }
  return target.map((word, k) => {
    const { heard, s } = out[k];
    const status = heard === null ? "miss" : s === 1 ? "ok" : s >= 0.5 ? "near" : "bad";
    return { word, clean: a[k], heard, status };
  });
}

const speak = (text) => {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB"; u.rate = 0.85;
  window.speechSynthesis.speak(u);
};

/* ---------- app ---------- */
export default function App() {
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(null);
  const [mode, setMode] = useState("speak"); // speak = pronunciation, spell = spelling
  const [student, setStudent] = useState("");
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState(null);
  const recRef = useRef(null);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const loadLessons = () =>
    fetch("/api/lessons").then((r) => r.json()).then(setLessons).catch(() => setError("Cannot reach the server."));
  useEffect(() => { loadLessons(); }, []);

  async function createLesson(e) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/lessons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text }),
    });
    if (!res.ok) return setError((await res.json()).error);
    setTitle(""); setText(""); loadLessons();
  }

  function finish(studentText, kind) {
    if (!studentText.trim() || !current) return;
    const words = check(current.text, studentText);
    const bad = words.filter((w) => w.status !== "ok");
    const score = Math.round(((words.length - bad.length) / words.length) * 100);
    setResult({ words, score, kind });
    fetch(`/api/lessons/${current.id}/results`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student, score, kind,
        wrongWords: bad.map((w) => ({ word: w.word, heard: w.heard, status: w.status })),
      }),
    });
  }

  function startReading() {
    if (!SR) return setError("Speech recognition needs Chrome or Edge.");
    setResult(null); setHeard(""); setError("");
    const rec = new SR();
    rec.lang = "en-GB"; rec.continuous = true; rec.interimResults = true;
    let final = "";
    rec.onresult = (ev) => {
      let interim = "";
      for (let k = ev.resultIndex; k < ev.results.length; k++) {
        const t = ev.results[k][0].transcript;
        if (ev.results[k].isFinal) final += t + " "; else interim += t;
      }
      setHeard(final + interim);
    };
    rec.onend = () => { setListening(false); finish(final, "speak"); };
    rec.onerror = (ev) => setError("Microphone problem: " + ev.error);
    recRef.current = rec; rec.start(); setListening(true);
  }

  const openLesson = (l) => { setCurrent(l); setResult(null); setHeard(""); setTyped(""); setError(""); };
  const issues = result ? result.words.filter((w) => w.status !== "ok") : [];
  const hideText = mode === "spell" && !result;

  // Live marking: words already read turn green or red; words not reached yet stay plain.
  let displayWords;
  if (!current) displayWords = [];
  else if (result) displayWords = result.words;
  else if (mode === "speak" && heard.trim()) {
    const live = check(current.text, heard);
    let last = -1;
    live.forEach((w, i) => { if (w.heard !== null) last = i; });
    displayWords = live.map((w, i) => (i <= last ? w : { ...w, status: "", heard: null }));
  } else displayWords = current.text.split(/\s+/).map((w) => ({ word: w, status: "" }));

  return (
    <main>
      <h1>Read aloud lessons</h1>
      {error && <p role="alert" style={{ color: "var(--bad)" }}>{error}</p>}

      {!current && (
        <>
          <form onSubmit={createLesson}>
            <h2>Create a lesson</h2>
            <input placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea rows={5} placeholder="Type or paste an English paragraph" value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit">Save lesson</button>
          </form>
          <section>
            <h2>Lessons</h2>
            {lessons.length === 0 && <p>No lessons yet. Create one above.</p>}
            {lessons.map((l) => (
              <p key={l.id}><strong>{l.title}</strong>{" "}
                <button className="ghost" onClick={() => openLesson(l)}>Open</button></p>
            ))}
          </section>
        </>
      )}

      {current && (
        <section>
          <h2>{current.title}</h2>
          <input placeholder="Student name" value={student} onChange={(e) => setStudent(e.target.value)} />
          <div className="tabs">
            <button className={mode === "speak" ? "" : "ghost"} onClick={() => { setMode("speak"); setResult(null); }}>Pronunciation check</button>
            <button className={mode === "spell" ? "" : "ghost"} onClick={() => { setMode("spell"); setResult(null); }}>Spelling check</button>
          </div>

          {hideText ? (
            <p>Press “Hear paragraph”, then type what you hear. The text appears after you check.</p>
          ) : (
            <p className="reader" aria-live="polite">
              {displayWords.map((w, i) => (
                <span key={i}
                  className={"w " + w.status}
                  title={w.status && w.status !== "ok" ? (w.heard ? `${result?.kind === "spell" ? "You typed" : "Heard"}: ${w.heard}` : "Skipped") : ""}
                  onClick={() => w.status && w.status !== "ok" && speak(w.word)}>
                  {w.word}{" "}
                </span>
              ))}
            </p>
          )}

          {mode === "speak" && (
            <>
              <p className="heard">{heard && "You said: " + heard}</p>
              <button onClick={startReading} disabled={listening}>{listening ? "Listening…" : "Start reading"}</button>
              <button onClick={() => recRef.current?.stop()} disabled={!listening}>Finish</button>
              <button className="ghost" onClick={() => speak(current.text)}>Hear paragraph</button>
            </>
          )}

          {mode === "spell" && (
            <>
              <textarea rows={5} placeholder="Type the paragraph here" value={typed} onChange={(e) => setTyped(e.target.value)} spellCheck={false} />
              <button className="ghost" onClick={() => speak(current.text)}>Hear paragraph</button>
              <button onClick={() => finish(typed, "spell")}>Check spelling</button>
            </>
          )}
          <button className="ghost" onClick={() => { setCurrent(null); loadLessons(); }}>Back</button>

          {result && (
            <div>
              <p className="score">Score: {result.score}%</p>
              <p className="legend">
                <span className="w ok">correct</span>{" "}
                <span className="w bad">{result.kind === "spell" ? "spelling mistake, wrong or skipped word" : "pronunciation issue, wrong or skipped word"}</span>.
                Tap a red word to hear it.
              </p>
              {issues.length === 0 && <p>No mistakes. Well done!</p>}
              <ul>
                {issues.map((w, i) => (
                  <li key={i}>
                    <strong>{w.clean}</strong>
                    {w.status === "miss" && " — skipped"}
                    {w.status === "bad" && ` — you ${result.kind === "spell" ? "typed" : "said"} “${w.heard}”`}
                    {w.status === "near" && (result.kind === "spell"
                      ? ` — spelling: you typed “${w.heard}”, correct is “${w.clean}”`
                      : ` — pronunciation: it sounded like “${w.heard}”`)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}