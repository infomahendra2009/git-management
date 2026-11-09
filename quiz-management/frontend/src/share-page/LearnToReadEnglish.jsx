import { useState, useRef, useEffect } from "react";

/* ---------- speech helpers ---------- */
const say = (t, r = 0.85) => {
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "en-US";
    u.rate = r;
    speechSynthesis.speak(u);
  } catch (e) {}
};
const sayAsync = (t, r) =>
  new Promise((res) => {
    try {
      if (!window.speechSynthesis) return res();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US";
      u.rate = r;
      u.onend = res;
      u.onerror = res;
      speechSynthesis.speak(u);
    } catch (e) {
      res();
    }
  });
const stopSpeech = () => {
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
};
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- data ---------- */
const EX = { a: "apple", b: "ball", c: "cat", d: "dog", e: "egg", f: "fish", g: "goat", h: "hat", i: "insect", j: "jam", k: "kite", l: "lion", m: "moon", n: "nest", o: "octopus", p: "pig", q: "queen", r: "rain", s: "sun", t: "tree", u: "umbrella", v: "van", w: "water", x: "box", y: "yellow", z: "zebra" };
const VOWELS = [["a", "cat"], ["a", "cake"], ["e", "bed"], ["e", "bee"], ["i", "sit"], ["i", "bike"], ["o", "hot"], ["o", "home"], ["u", "cup"], ["u", "cute"]];
const BLEND = [["c", "a", "t"], ["s", "i", "t"], ["h", "o", "p"], ["b", "u", "g"], ["sh", "i", "p"], ["ch", "i", "n"], ["th", "i", "n"], ["r", "ai", "n"], ["b", "oa", "t"], ["m", "oo", "n"], ["f", "i", "sh"], ["c", "a", "k", "e"]];
const PATTERNS = [
  ["Consonant pairs", "Two letters, one sound.", ["ship", "chin", "thin", "whale"]],
  ["Vowel pairs", "Two vowels team up.", ["feet", "rain", "boat", "cloud"]],
  ["Silent e", "The e at the end makes the vowel say its name.", ["cap → cape", "hop → hope", "kit → kite", "cub → cube"]],
  ["Endings", "Small word parts that change a word.", ["jump → jumping", "walk → walked", "dog → dogs", "nation"]],
];
const SIGHT = ["the", "was", "said", "of", "you", "they", "have", "were", "one", "two", "what", "are", "who", "some", "come", "here"];
const SENTENCES = [
  { t: "The cat sat on the mat.", q: "Where did the cat sit?", o: ["On the mat", "In a box", "On a bed"], a: 0 },
  { t: "Sam has a red bag. Is it big?", q: "What color is the bag?", o: ["Blue", "Red", "Green"], a: 1 },
  { t: "We went to the park, and we played in the rain.", q: "What did they do in the park?", o: ["Slept", "Ate lunch", "Played"], a: 2 },
  { t: "Who is at the door? It is my friend, Mia!", q: "Who is at the door?", o: ["Mia", "Sam", "The cat"], a: 0 },
];
const QUIZ_WORDS = ["cat", "ship", "rain", "boat", "moon", "cake", "fish", "bug", "kite", "hop", "thin", "sit"];
const TABS = ["Letters", "Blend", "Patterns", "Sight words", "Sentences", "Quiz"];

/* ---------- 1. Letters ---------- */
function Letters() {
  const [sel, setSel] = useState("a");
  return (
    <>
      <h2>1. Letters and sounds</h2>
      <p className="hint">Tap a letter to hear it and see a word that starts with it.</p>
      <div className="grid">
        {Object.keys(EX).map((c) => (
          <button key={c} className={"tile" + (sel === c ? " sel" : "")} onClick={() => { setSel(c); say(`${c}. ${EX[c]}`); }}>
            {c.toUpperCase() + c}
          </button>
        ))}
      </div>
      <div className="panel">
        <p className="big">{sel.toUpperCase() + sel}</p>
        <p className="ex">{EX[sel]}</p>
      </div>
      <p className="hint">Vowels (a, e, i, o, u) make more than one sound. Tap to compare.</p>
      <div className="row">
        {VOWELS.map(([v, w]) => (
          <button key={v + w} className="chip" onClick={() => say(w)}>{v} in {w}</button>
        ))}
      </div>
    </>
  );
}

/* ---------- 2. Blend ---------- */
function Blend() {
  const [cur, setCur] = useState(BLEND[0]);
  const [active, setActive] = useState(-1);
  const token = useRef(0);
  const whole = cur.join("");
  const pick = (w) => { token.current++; setActive(-1); setCur(w); say(w.join("")); };
  const sayParts = async () => {
    const t = ++token.current;
    stopSpeech();
    for (let i = 0; i < cur.length; i++) {
      if (token.current !== t) return;
      setActive(i);
      await sayAsync(cur[i], 0.6);
    }
    setActive(-1);
    if (token.current === t) await sayAsync(whole, 0.85);
  };
  return (
    <>
      <h2>2. Blend sounds into words</h2>
      <p className="hint">Pick a word. Listen to each sound, then to the whole word.</p>
      <div className="row">
        {BLEND.map((w) => (
          <button key={w.join("")} className="chip" onClick={() => pick(w)}>{w.join("")}</button>
        ))}
      </div>
      <div className="panel">
        <div className="parts">
          {cur.map((p, i) => <span key={i} className={i === active ? "on" : ""}>{p}</span>)}
        </div>
        <p className="big">{whole}</p>
        <button className="act" onClick={sayParts}>Say the sounds</button>
        <button className="act alt" onClick={() => say(whole)}>Say the word</button>
      </div>
    </>
  );
}

/* ---------- 3. Patterns ---------- */
function Patterns() {
  return (
    <>
      <h2>3. Letter patterns</h2>
      <p className="hint">Common groups of letters make one sound. Tap a word to hear it.</p>
      {PATTERNS.map(([title, desc, words]) => (
        <div key={title} className="grp">
          <h3>{title}</h3>
          <p>{desc}</p>
          <div className="row">
            {words.map((w) => (
              <button key={w} className="chip" onClick={() => say(w.replace("→", ""))}>{w}</button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- 4. Sight words ---------- */
function Sight() {
  const [words] = useState(() => shuffle(SIGHT));
  const [i, setI] = useState(0);
  return (
    <>
      <h2>4. Sight words</h2>
      <p className="hint">These words don’t follow the usual rules. Learn them by sight.</p>
      <div className="panel">
        <p className="big">{words[i]}</p>
        <button className="act" onClick={() => say(words[i])}>Hear it</button>
        <button className="act alt" onClick={() => { const n = (i + 1) % words.length; setI(n); say(words[n]); }}>Next word</button>
        <p className="score">{i + 1} of {words.length}</p>
      </div>
    </>
  );
}

/* ---------- 5. Sentences ---------- */
function Sentences() {
  const [n, setN] = useState(0);
  const [active, setActive] = useState(-1);
  const [pick, setPick] = useState(-1);
  const token = useRef(0);
  const s = SENTENCES[n];
  const words = s.t.split(" ");
  const next = () => { token.current++; stopSpeech(); setActive(-1); setPick(-1); setN((n + 1) % SENTENCES.length); };
  const readAll = async () => {
    const t = ++token.current;
    stopSpeech();
    for (let i = 0; i < words.length; i++) {
      if (token.current !== t) return;
      setActive(i);
      await sayAsync(words[i], 0.8);
    }
    setActive(-1);
  };
  const correct = pick === s.a;
  return (
    <>
      <h2>5. Read sentences</h2>
      <p className="hint">Tap a word to hear it, or press Read to follow along. Notice the punctuation.</p>
      <div className="panel left">
        <div className="sent">
          {words.map((w, i) => (
            <button key={i} className={"w" + (i === active ? " on" : "")} onClick={() => say(w.replace(/[^\w']/g, ""), 0.8)}>{w}</button>
          ))}
        </div>
        <button className="act" onClick={readAll}>Read it to me</button>
        <button className="act alt" onClick={next}>Next sentence</button>
        <p className="hint qline">{s.q}</p>
        <div className="opts">
          {s.o.map((o, i) => (
            <button key={o} className={"opt" + (pick === i ? (i === s.a ? " good" : " no") : "")} onClick={() => setPick(i)}>{o}</button>
          ))}
        </div>
        <div className={"msg" + (pick < 0 ? "" : correct ? " ok" : " bad")}>
          {pick < 0 ? "" : correct ? "Correct!" : "Not quite. Read the sentence again."}
        </div>
      </div>
    </>
  );
}

/* ---------- 6. Quiz ---------- */
function makeQuestion() {
  const answer = QUIZ_WORDS[Math.floor(Math.random() * QUIZ_WORDS.length)];
  const options = shuffle([answer, ...shuffle(QUIZ_WORDS.filter((w) => w !== answer)).slice(0, 2)]);
  return { answer, options };
}
function Quiz() {
  const [q, setQ] = useState(makeQuestion);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState({ ok: 0, tot: 0 });
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const choose = (w) => {
    if (chosen) return;
    setChosen(w);
    setScore((s) => ({ ok: s.ok + (w === q.answer ? 1 : 0), tot: s.tot + 1 }));
    timer.current = setTimeout(() => {
      const nq = makeQuestion();
      setQ(nq);
      setChosen(null);
      say(nq.answer);
    }, 1500);
  };
  const right = chosen === q.answer;
  return (
    <>
      <h2>6. Quiz</h2>
      <p className="hint">Listen, then pick the word you heard.</p>
      <div className="panel">
        <button className="act" onClick={() => say(q.answer)}>Play the word</button>
        <div className="opts">
          {q.options.map((w) => (
            <button
              key={w}
              className={"opt" + (chosen ? (w === q.answer ? " good" : w === chosen ? " no" : "") : "")}
              onClick={() => choose(w)}
            >
              {w}
            </button>
          ))}
        </div>
        <div className={"msg" + (!chosen ? "" : right ? " ok" : " bad")}>
          {!chosen ? "" : right ? "Correct!" : `It was “${q.answer}”.`}
        </div>
        <p className="score">Score: {score.ok} / {score.tot}</p>
      </div>
      <h2 className="gap">Keep growing</h2>
      <p className="hint">Read for 10 to 15 minutes every day. Pick books at your level and write new words in a notebook. Re-read favorites to build speed.</p>
    </>
  );
}

/* ---------- App ---------- */
const VIEWS = [Letters, Blend, Patterns, Sight, Sentences, Quiz];

export default function LearnToReadEnglish() {
  const [tab, setTab] = useState(0);
  const View = VIEWS[tab];
  useEffect(() => { stopSpeech(); }, [tab]);
  return (
    <div className="rtr">
      <style>{CSS}</style>
      <main>
        <h1>Learn to read English</h1>
        <p className="sub">Tap anything to hear it. Go through the tabs in order.</p>
        <nav role="tablist">
          {TABS.map((n, i) => (
            <button key={n} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{i + 1}. {n}</button>
          ))}
        </nav>
        <section key={tab}><View /></section>
        <p className="note">Uses your device’s built-in voice. If you hear nothing, check your volume or try another browser.</p>
      </main>
    </div>
  );
}

const CSS = `
.rtr{--bg:#f4f7fb;--card:#fff;--ink:#16233b;--mute:#5b6b85;--line:#d5deeb;--acc:#2456d6;--acc-ink:#fff;--hi:#ffc83d;--ok:#1d8a4f;--bad:#c93b3b;
background:var(--bg);color:var(--ink);min-height:100vh;font:18px/1.55 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){.rtr{--bg:#0f1729;--card:#18233b;--ink:#e8eefb;--mute:#9aaac6;--line:#2c3b5c;--acc:#6c96ff;--acc-ink:#0b1226;--hi:#e6b229;--ok:#4cc585;--bad:#ff7b7b}}
.rtr *{box-sizing:border-box}
.rtr main{max-width:720px;margin:0 auto;padding:20px 16px 48px}
.rtr h1{font-size:1.7rem;margin:0 0 4px}
.rtr .sub{color:var(--mute);margin:0 0 16px}
.rtr nav{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px}
.rtr nav button{flex:none;border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:8px 14px;border-radius:999px;cursor:pointer}
.rtr nav button[aria-selected="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.rtr button:focus-visible{outline:3px solid var(--hi);outline-offset:2px}
.rtr h2{font-size:1.25rem;margin:0 0 4px}
.rtr h2.gap{margin-top:22px}
.rtr .hint{color:var(--mute);margin:0 0 14px}
.rtr .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px}
.rtr .tile{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:1.3rem;font-weight:700;border-radius:12px;padding:10px 4px;cursor:pointer}
.rtr .tile.sel{border-color:var(--acc);background:var(--hi);color:#16233b}
.rtr .panel{background:var(--card);border:2px solid var(--line);border-radius:16px;padding:18px;margin:14px 0;text-align:center}
.rtr .panel.left{text-align:left}
.rtr .big{font-size:3.2rem;font-weight:700;line-height:1.1;margin:0}
.rtr .ex{margin:6px 0 0;font-size:1.3rem}
.rtr .parts{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:10px 0}
.rtr .parts span{min-width:56px;padding:8px 12px;border-radius:10px;background:var(--hi);color:#16233b;font-size:2rem;font-weight:700}
.rtr .parts span.on{outline:3px solid var(--acc)}
.rtr .act{border:0;background:var(--acc);color:var(--acc-ink);font:inherit;font-weight:700;padding:10px 18px;border-radius:12px;cursor:pointer;margin:4px}
.rtr .act.alt{background:transparent;color:var(--ink);border:2px solid var(--line)}
.rtr .row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.rtr .chip{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:6px 12px;border-radius:10px;cursor:pointer}
.rtr .grp{background:var(--card);border:2px solid var(--line);border-radius:14px;padding:14px;margin:10px 0}
.rtr .grp h3{margin:0 0 2px;font-size:1.05rem}
.rtr .grp p{margin:0 0 6px;color:var(--mute)}
.rtr .sent{font-size:1.6rem;line-height:2}
.rtr .w{border:0;background:none;color:inherit;font:inherit;padding:2px 4px;border-radius:6px;cursor:pointer}
.rtr .w.on{background:var(--hi);color:#16233b}
.rtr .qline{margin-top:12px}
.rtr .opts{display:grid;gap:8px;margin-top:10px}
.rtr .opt{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:1.3rem;padding:12px;border-radius:12px;cursor:pointer}
.rtr .opt.good{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 18%,var(--card))}
.rtr .opt.no{border-color:var(--bad)}
.rtr .msg{min-height:1.6em;font-weight:700;margin:8px 0}
.rtr .msg.ok{color:var(--ok)}
.rtr .msg.bad{color:var(--bad)}
.rtr .score{color:var(--mute)}
.rtr .note{color:var(--mute);font-size:.9rem;margin-top:24px}
`;
