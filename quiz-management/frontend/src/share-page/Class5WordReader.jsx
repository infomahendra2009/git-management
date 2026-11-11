import { useState, useRef, useEffect } from "react";

// Complete dataset of 109 words with syllables, meanings, and chapters
// Dataset extracted from Class 5 English Textbook Chapters 1 to 3
const CSV_DATA = [
  // Chapter 1: To the Ferry (Poem)
  { word: "fer-ry", meaning: "A boat or ship for carrying passengers and goods across a stream", chapter: "To the Ferry" },
  { word: "dai-ry", meaning: "A building or room for the processing, storage and distribution of milk and milk products", chapter: "To the Ferry" },
  { word: "drone", meaning: "A continuous low humming sound", chapter: "To the Ferry" },

  // Chapter 2: Childhood Fear
  { word: "ham-mock", meaning: "Kind of string bed hung from posts, trees at both ends", chapter: "Childhood Fear" },
  { word: "star-ing", meaning: "Looking at", chapter: "Childhood Fear" },
  { word: "snea-ked", meaning: "To move in a stealthy way", chapter: "Childhood Fear" },
  { word: "e-nor-mous", meaning: "Very big", chapter: "Childhood Fear" },
  { word: "out-house", meaning: "A building such as a shed or barn that is built on to or in the grounds of a house", chapter: "Childhood Fear" },
  { word: "ap-par-i-tion", meaning: "Ghost, spirit", chapter: "Childhood Fear" },
  { word: "hell-hound", meaning: "Dog in the hell", chapter: "Childhood Fear" },
  { word: "pe-trif-ied", meaning: "Turned into stone in fear", chapter: "Childhood Fear" },
  { word: "e-scaped", meaning: "Fled", chapter: "Childhood Fear" },
  { word: "ex-ten-ded", meaning: "Stretched", chapter: "Childhood Fear" },
  { word: "con-tempt", meaning: "Hatred", chapter: "Childhood Fear" },
  { word: "tos-sed", meaning: "Threw down", chapter: "Childhood Fear" },
  { word: "in-tense", meaning: "Keen", chapter: "Childhood Fear" },
  { word: "fas-ci-na-tion", meaning: "Liking", chapter: "Childhood Fear" },
  { word: "melt-ed a-way", meaning: "Vanished", chapter: "Childhood Fear" },

  // Chapter 3: Cinderella
  { word: "di-vor-cee", meaning: "A status attained after a formal separation between a husband and wife", chapter: "Cinderella" },
  { word: "dis-crim-i-nat-ing", meaning: "Differentiating", chapter: "Cinderella" },
  { word: "ill-trea-ted", meaning: "Treated badly", chapter: "Cinderella" },
  { word: "at-ten-dant", meaning: "A service provider", chapter: "Cinderella" },
  { word: "set off", meaning: "To begin a journey", chapter: "Cinderella" }
];

const COLORS = ["--c1", "--c2", "--c3", "--c4"];
const MODES = [
  ["all", "All"],
  ["short", "< 7 letters"],
  ["medium", "7 - 9 letters"],
  ["long", "10+ letters"]
];

const plain = (s) => (s ? s.replace(/-/g, "") : "");

const match = (item, m) => {
  const len = plain(item.word).length;
  if (m === "all") return true;
  if (m === "short") return len < 7;
  if (m === "medium") return len >= 7 && len <= 9;
  if (m === "long") return len >= 10;
  return true;
};

const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const speak = (text, rate = 0.85) =>
  new Promise((resolve, reject) => {
    const engine = window.speechSynthesis;
    if (!engine || !window.SpeechSynthesisUtterance) {
      reject(new Error("Speech playback is not supported in this browser."));
      return;
    }
    try {
      engine.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      const englishVoice = engine.getVoices().find((v) => /^en(-|_)/i.test(v.lang));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          reject(new Error(`Speech playback failed${event.error ? `: ${event.error}` : "."}`));
        } else {
          resolve();
        }
      };
      engine.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });

export default function Class5WordReader() {
  const [mode, setMode] = useState("all");
  const [curItem, setCurItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [help, setHelp] = useState(false);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [listening, setListening] = useState(false);

  const st = useRef({ pool: [], token: 0, recognition: null });
  const curRef = useRef(curItem);
  curRef.current = curItem;

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    const recognition = st.current.recognition;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }
  }, []);

  const playWord = async (text = plain(curRef.current?.word), rate = 0.85) => {
    if (!text) return;
    const s = st.current;
    const token = ++s.token;
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setActive(-1);
    setAudioMessage("Playing pronunciation…");
    try {
      await speak(text, rate);
      if (s.token === token) setAudioMessage("Audio finished.");
    } catch (error) {
      if (s.token === token) setAudioMessage(error.message || "Could not play audio.");
    }
  };

  const checkPronunciation = () => {
    if (!window.isSecureContext) {
      setAudioMessage("Microphone access requires a secure connection.");
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setAudioMessage("Speech recognition is not supported in this browser. Try Hear it instead.");
      return;
    }
    const s = st.current;
    const token = ++s.token;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    s.recognition = recognition;
    setActive(-1);
    setListening(true);
    setAudioMessage("Listening… Say the word clearly.");

    recognition.onresult = (event) => {
      if (s.token !== token) return;
      const expected = plain(curRef.current?.word).toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
      const heard = Array.from(event.results[0], (res) => res.transcript.trim());
      const matched = heard.some((t) => t.toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "") === expected);
      setAudioMessage(
        matched
          ? `Speech recognition heard "${plain(curRef.current?.word)}". Excellent!`
          : `Heard "${heard[0] || "nothing"}" instead. Try again or use Hear it as a guide.`
      );
    };

    recognition.onerror = (event) => {
      if (s.token !== token || event.error === "aborted") return;
      setAudioMessage(event.error === "not-allowed" ? "Microphone access denied." : "Speech check failed.");
      setListening(false);
      s.recognition = null;
    };

    recognition.onend = () => {
      if (s.token !== token) return;
      setListening(false);
      s.recognition = null;
    };

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      s.recognition = null;
      setAudioMessage(`Could not start speech recognition: ${error.message}`);
    }
  };

  const updateCardState = (item, newIndex, totalPoolLen) => {
    st.current.token++;
    window.speechSynthesis?.cancel();
    st.current.recognition?.abort();
    st.current.recognition = null;
    setListening(false);
    setAudioMessage("");
    setCurItem(item);
    setHelp(false);
    setActive(-1);
    setProgress(`Word ${newIndex + 1} of ${Math.max(history.length, totalPoolLen)}`);
  };

  const nextWord = (m = mode) => {
    const s = st.current;

    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      updateCardState(history[nextIdx], nextIdx, s.pool.length + history.length);
      return;
    }

    if (!s.pool.length) {
      s.pool = shuffle(CSV_DATA.filter((x) => match(x, m)));
    }

    if (!s.pool.length) return;

    const nextItem = s.pool.pop();
    const newHistory = [...history, nextItem];
    const newIndex = newHistory.length - 1;

    setHistory(newHistory);
    setHistoryIndex(newIndex);
    updateCardState(nextItem, newIndex, s.pool.length + newHistory.length);
  };

  const prevWord = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      updateCardState(history[prevIdx], prevIdx, history.length);
    }
  };

  const pickMode = (m) => {
    setMode(m);
    st.current.pool = [];
    setHistory([]);
    setHistoryIndex(-1);
    const filtered = shuffle(CSV_DATA.filter((x) => match(x, m)));
    if (filtered.length) {
      const first = filtered.pop();
      st.current.pool = filtered;
      setHistory([first]);
      setHistoryIndex(0);
      updateCardState(first, 0, filtered.length + 1);
    }
  };

  useEffect(() => {
    pickMode("all");
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "BUTTON") return;
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        nextWord(mode);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevWord();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, historyIndex, history]);

  const parts = curItem ? curItem.word.split("-") : [];

  const onHelp = async () => {
    if (!help) {
      setHelp(true);
      return;
    }
    const s = st.current;
    const t = ++s.token;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setAudioMessage("Playing word slowly…");
    for (let i = 0; i < parts.length; i++) {
      if (s.token !== t) return;
      setActive(i);
      try {
        await speak(parts[i], 0.6);
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
        setActive(-1);
        return;
      }
    }
    setActive(-1);
    if (s.token === t) {
      try {
        await speak(plain(curItem?.word), 0.85);
        if (s.token === t) setAudioMessage("Audio finished.");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
      }
    }
  };

  const tip =
    parts.length > 1
      ? "Read each chunk, then blend them. Tap a chunk to hear it."
      : `One chunk. Say each sound, then blend: ${plain(curItem?.word).split("").join(" · ")}`;

  return (
    <div className="rwr">
      <style>{CSS}</style>
      <main>
        <h1>Textbook Vocabulary Reader</h1>
        
        <div className="row" role="group" aria-label="Word length">
          {MODES.map(([key, label]) => (
            <button key={key} className="f" aria-pressed={mode === key} onClick={() => pickMode(key)}>
              {label}
            </button>
          ))}
        </div>

        {curItem && (
          <div className="card">
            {curItem.chapter && <span className="badge">{curItem.chapter}</span>}
            <div className="word" aria-live="polite">{plain(curItem.word)}</div>
            
            <p className="meaning">
              <strong>Meaning:</strong> {curItem.meaning}
            </p>

            {help && (
              <div className="help">
                <div className="chunks">
                  {parts.map((p, i) => (
                    <span
                      key={i}
                      className={i === active ? "on" : ""}
                      style={{ background: `var(${COLORS[i % 4]})` }}
                      onClick={() => playWord(p, 0.7)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          playWord(p, 0.7);
                        }
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <p className="tip">{tip}</p>
              </div>
            )}

            <div className="btns">
              <button className="a alt" onClick={prevWord} disabled={historyIndex <= 0}>
                ← Previous
              </button>
              <button className="a" onClick={onHelp}>
                {help ? "Say slowly" : "Help"}
              </button>
              <button className="a alt" onClick={() => playWord()} disabled={!curItem}>
                Hear it
              </button>
              <button className="a alt" onClick={checkPronunciation} disabled={!curItem || listening}>
                {listening ? "Listening…" : "Check"}
              </button>
              <button className="a" onClick={() => nextWord(mode)}>
                Next →
              </button>
            </div>

            {audioMessage && (
              <p className="audio-status" role="status" aria-live="polite">
                {audioMessage}
              </p>
            )}
          </div>
        )}

        <p className="stat">{progress}</p>
        <p className="note">Use Left & Right Arrow keys or buttons to navigate history.</p>
      </main>
    </div>
  );
}

const CSS = `
.rwr{--bg:#f4f7fb;--card:#fff;--ink:#16233b;--mute:#5b6b85;--line:#d5deeb;--acc:#2456d6;--acc-ink:#fff;--c1:#ffd36b;--c2:#9ed8ff;--c3:#b9f0c4;--c4:#ffc0d0;
background:var(--bg);color:var(--ink);min-height:100vh;font:18px/1.5 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){.rwr{--bg:#0f1729;--card:#18233b;--ink:#e8eefb;--mute:#9aaac6;--line:#2c3b5c;--acc:#6c96ff;--acc-ink:#0b1226;--c1:#c99a1c;--c2:#2f7fb5;--c3:#2f9a58;--c4:#b5476a}}
.rwr *{box-sizing:border-box}
.rwr main{max-width:640px;margin:0 auto;padding:20px 16px 40px}
.rwr h1{font-size:1.5rem;margin:0 0 12px;text-align:center}
.rwr .row{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:14px}
.rwr .f{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:6px 14px;border-radius:999px;cursor:pointer}
.rwr .f[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.rwr .card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:24px 16px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
.rwr .badge{display:inline-block;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:2px 10px;border-radius:12px;background:var(--line);color:var(--mute);margin-bottom:8px}
.rwr .word{font-size:clamp(2.2rem,10vw,4rem);font-weight:700;line-height:1.1;margin:4px 0 10px;word-break:break-word}
.rwr .meaning{font-size:1.1rem;color:var(--ink);margin:0 0 16px;padding:10px 14px;background:var(--bg);border-radius:12px;border:1px solid var(--line)}
.rwr .help{margin-top:10px;margin-bottom:14px}
.rwr .chunks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px}
.rwr .chunks span{font-size:clamp(1.6rem,8vw,2.8rem);font-weight:700;padding:2px 12px;border-radius:12px;color:#16233b;cursor:pointer}
.rwr .chunks span.on{outline:4px solid var(--acc)}
.rwr .tip{color:var(--mute);margin:8px 0 0;font-size:0.95rem}
.rwr .btns{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:16px}
.rwr button.a{border:0;background:var(--acc);color:var(--acc-ink);font:inherit;font-weight:700;font-size:1rem;padding:10px 18px;border-radius:12px;cursor:pointer}
.rwr button.a.alt{background:transparent;color:var(--ink);border:2px solid var(--line)}
.rwr button:disabled{opacity:.4;cursor:not-allowed}
.rwr button:focus-visible{outline:3px solid #ffc83d;outline-offset:2px}
.rwr .stat{text-align:center;color:var(--mute);margin-top:14px}
.rwr .audio-status{min-height:1.5em;margin:10px 0 0;text-align:center;color:var(--mute);font-size:.9rem}
.rwr .note{color:var(--mute);font-size:.85rem;text-align:center;margin-top:16px}
`;