import { useState } from "react";

/* ---------- data ---------- */
const MATRAS = ["", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ः"];
const VOWELS_HI = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "अं", "अः"];
const VOWELS_EN = ["a", "aa", "i", "ee", "u", "oo", "e", "ai", "o", "au", "am", "ah"];

// [Hindi consonant, English sound]. Capitals mark the harder, tongue-curled sounds.
const HINDI = [
  ["क", "k"], ["ख", "kh"], ["ग", "g"], ["घ", "gh"], ["ङ", "ng"],
  ["च", "ch"], ["छ", "chh"], ["ज", "j"], ["झ", "jh"], ["ञ", "ny"],
  ["ट", "T"], ["ठ", "Th"], ["ड", "D"], ["ढ", "Dh"], ["ण", "N"],
  ["त", "t"], ["थ", "th"], ["द", "d"], ["ध", "dh"], ["न", "n"],
  ["प", "p"], ["फ", "ph"], ["ब", "b"], ["भ", "bh"], ["म", "m"],
  ["य", "y"], ["र", "r"], ["ल", "l"], ["व", "v"],
  ["श", "sh"], ["ष", "Sh"], ["स", "s"], ["ह", "h"],
  ["क्ष", "ksh"], ["त्र", "tr"], ["ज्ञ", "gy"],
];
const ENGLISH = "BCDFGHJKLMNPQRSTVWXYZ".split("");

const say = (text, lang) => {
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.8;
    speechSynthesis.speak(u);
  } catch (e) {}
};

/* ---------- component ---------- */
export default function Barakhadi() {
  const [tab, setTab] = useState("hindi");
  const [sel, setSel] = useState(null); // { main, sub, lang }

  const rows =
    tab === "hindi"
      ? HINDI.map(([hi, en]) => ({
          label: hi,
          sub: en,
          cells: MATRAS.map((m, i) => ({ main: hi + m, sub: en + VOWELS_EN[i], lang: "hi-IN" })),
        }))
      : ENGLISH.map((L) => ({
          label: L,
          sub: "",
          cells: VOWELS_EN.map((v) => ({ main: L.toLowerCase() + v, sub: "", lang: "en-US" })),
        }));

  const heads =
    tab === "hindi"
      ? VOWELS_HI.map((h, i) => [h, VOWELS_EN[i]])
      : VOWELS_EN.map((v) => [v, ""]);

  const pick = (c) => {
    setSel(c);
    say(c.main, c.lang);
  };

  return (
    <div className="bk">
      <style>{CSS}</style>
      <main>
        <h1>Barakhadi · बारहखड़ी</h1>
        <p className="sub">Each letter joined with the 12 vowel forms. Tap any cell to hear it.</p>

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "hindi"} onClick={() => { setTab("hindi"); setSel(null); }}>
            Hindi · क से ज्ञ
          </button>
          <button role="tab" aria-selected={tab === "english"} onClick={() => { setTab("english"); setSel(null); }}>
            English · A to Z
          </button>
        </div>

        <div className="show" aria-live="polite">
          {sel ? (
            <>
              <span className="showbig">{sel.main}</span>
              {sel.sub && <span className="showsub">{sel.sub}</span>}
            </>
          ) : (
            <span className="showsub">Tap a cell</span>
          )}
        </div>

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th className="corner">{tab === "hindi" ? "व्यंजन" : "Letter"}</th>
                {heads.map(([a, b], i) => (
                  <th key={i}>
                    <span className="hm">{a}</span>
                    {b && <span className="hs">{b}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="rowhead">
                    <span className="hm">{r.label}</span>
                    {r.sub && <span className="hs">{r.sub}</span>}
                  </th>
                  {r.cells.map((c, i) => (
                    <td key={i}>
                      <button
                        className={sel && sel.main === c.main ? "cell on" : "cell"}
                        onClick={() => pick(c)}
                      >
                        <span className="cm">{c.main}</span>
                        {c.sub && <span className="cs">{c.sub}</span>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="note">
          {tab === "hindi"
            ? "Capital letters (T, D, N, Sh) mark the harder, tongue-curled sounds."
            : "These are sound-practice syllables, not always real English words. The vowels A, E, I, O, U are the sounds themselves, so only consonants get rows."}
        </p>
      </main>
    </div>
  );
}

const CSS = `
.bk{--bg:#f4f7fb;--card:#fff;--ink:#16233b;--mute:#5b6b85;--line:#d5deeb;--acc:#2456d6;--acc-ink:#fff;--hi:#ffc83d;--head:#e6edf8;
background:var(--bg);color:var(--ink);min-height:100vh;font:17px/1.4 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI","Noto Sans Devanagari",sans-serif}
@media (prefers-color-scheme:dark){.bk{--bg:#0f1729;--card:#18233b;--ink:#e8eefb;--mute:#9aaac6;--line:#2c3b5c;--acc:#6c96ff;--acc-ink:#0b1226;--hi:#e6b229;--head:#223253}}
.bk *{box-sizing:border-box}
.bk main{max-width:980px;margin:0 auto;padding:20px 12px 40px}
.bk h1{font-size:1.6rem;margin:0 0 4px}
.bk .sub{color:var(--mute);margin:0 0 14px}
.bk .tabs{display:flex;gap:8px;margin-bottom:14px}
.bk .tabs button{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:8px 16px;border-radius:999px;cursor:pointer}
.bk .tabs button[aria-selected="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.bk button:focus-visible{outline:3px solid var(--hi);outline-offset:2px}
.bk .show{background:var(--card);border:2px solid var(--line);border-radius:16px;padding:10px;margin-bottom:14px;text-align:center;min-height:92px;display:flex;flex-direction:column;justify-content:center}
.bk .showbig{font-size:2.8rem;font-weight:700;line-height:1.2}
.bk .showsub{color:var(--mute);font-size:1.2rem}
.bk .wrap{overflow:auto;max-height:70vh;border:2px solid var(--line);border-radius:14px;background:var(--card)}
.bk table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%}
.bk th,.bk td{border-bottom:1px solid var(--line);border-right:1px solid var(--line);padding:0;text-align:center}
.bk thead th{position:sticky;top:0;z-index:2;background:var(--head);padding:6px 4px;min-width:68px}
.bk .corner{left:0;z-index:3;min-width:76px}
.bk .rowhead{position:sticky;left:0;z-index:1;background:var(--head);padding:6px 8px;min-width:76px}
.bk .hm{display:block;font-size:1.35rem;font-weight:700}
.bk .hs{display:block;font-size:.8rem;color:var(--mute)}
.bk .cell{display:block;width:100%;border:0;background:transparent;color:var(--ink);font:inherit;padding:8px 4px;cursor:pointer}
.bk .cell:hover{background:var(--head)}
.bk .cell.on{background:var(--hi);color:#16233b}
.bk .cm{display:block;font-size:1.3rem;font-weight:700}
.bk .cs{display:block;font-size:.78rem;color:var(--mute)}
.bk .cell.on .cs{color:#16233b}
.bk .note{color:var(--mute);font-size:.9rem;margin-top:14px}
`;
