import { useState, useRef, useEffect } from "react";

// 2,000 common English words; "-" marks syllable chunks.
const DATA =  [
  "कमल",
  "कलम",
  "किताब",
  "कबूतर",
  "किसान",
  "कपड़ा",
  "कमरा",
  "कंगन",
  "खरगोश",
  "खिलौना",
  "गमला",
  "गाजर",
  "गाय",
  "गुलाब",
  "घर",
  "चम्मच",
  "चिड़िया",
  "चमक",
  "चावल",
  "जहाज",
  "झरना",
  "टमाटर",
  "डमरू",
  "तरबूज",
  "तितली",
  "दरवाजा",
  "नदी",
  "नमक",
  "पतंग",
  "पानी",
  "पुस्तक",
  "फूल",
  "बकरी",
  "बादल",
  "बिल्ली",
  "मछली",
  "मटर",
  "मोर",
  "रथ",
  "लड्डू",
  "सेब",
  "हाथी"
];

const COLORS = ["--c1", "--c2", "--c3", "--c4"];
const MODES = [["all", "All"], ["3", "3 letters"], ["4", "4 letters"], ["5", "5 letters"], ["6", "6+ letters"]];
const plain = (s) => s.replace(/-/g, "");
const match = (s, m) => {
  const n = plain(s).length;
  return m === "all" || (m === "6" ? n >= 6 : n === +m);
};
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const speak = (text, rate = 0.85) => new Promise((resolve, reject) => {
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
    const englishVoice = engine.getVoices().find((voice) => /^en(-|_)/i.test(voice.lang));
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

export default function RandomWordReaderHindi() {
  const [mode, setMode] = useState("all");
  const [cur, setCur] = useState("");
  const [help, setHelp] = useState(false);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [listening, setListening] = useState(false);
  const st = useRef({ pool: [], seen: 0, total: 0, token: 0, recognition: null });
  const curRef = useRef(cur);
  curRef.current = cur;

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

  const playWord = async (text = plain(curRef.current), rate = 0.85) => {
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
      setAudioMessage("Microphone access requires a secure connection. Open this site over HTTPS on your phone; an HTTP 192.168.x.x address is not secure.");
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
      const expected = plain(curRef.current).toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
      const heard = Array.from(event.results[0], (result) => result.transcript.trim());
      const matched = heard.some((transcript) => transcript.toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "") === expected);
      setAudioMessage(matched
        ? `Speech recognition heard "${plain(curRef.current)}". This confirms the word, not pronunciation quality.`
        : `Heard "${heard[0] || "nothing"}" instead. Try again, or use Hear it as a guide.`);
    };
    recognition.onerror = (event) => {
      if (s.token !== token || event.error === "aborted") return;
      const message = event.error === "not-allowed"
        ? "Microphone access was denied. Allow microphone access to check your speech."
        : event.error === "no-speech"
          ? "No speech was detected. Try again and speak clearly."
          : event.error === "network"
            ? "Speech recognition could not connect. Check your internet connection and try again."
          : `Speech check failed${event.error ? `: ${event.error}` : "."}`;
      setAudioMessage(message);
      setListening(false);
      s.recognition = null;
    };
    recognition.onend = () => {
      if (s.token !== token) return;
      setListening(false);
      s.recognition = null;
      setAudioMessage((message) => message === "Listening… Say the word clearly."
        ? "No word was recognized. Try again and speak clearly."
        : message);
    };
    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      s.recognition = null;
      setAudioMessage(`Could not start speech recognition: ${error.message}`);
    }
  };

  const nextWord = (m) => {
    const s = st.current;
    if (!s.pool.length) {
      s.pool = shuffle(DATA.filter((x) => match(x, m)));
      s.seen = 0;
      s.total = s.pool.length;
    }
    const w = s.pool.pop();
    s.seen++;
    s.token++;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setAudioMessage("");
    setCur(w);
    setHelp(false);
    setActive(-1);
    setProgress(`Word ${s.seen} of ${s.total}`);
  };

  const pickMode = (m) => {
    setMode(m);
    st.current.pool = [];
    nextWord(m);
  };

  useEffect(() => { nextWord("all"); }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        nextWord(mode);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode]);

  const parts = cur ? cur.split("-") : [];

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
        await speak(plain(curRef.current), 0.85);
        if (s.token === t) setAudioMessage("Audio finished.");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
      }
    }
  };

  const tip =
    parts.length > 1
      ? "Read each chunk, then blend them. Tap a chunk to hear it."
      : `One chunk. Say each sound, then blend: ${plain(cur).split("").join(" · ")}`;

  return (
    <div className="rwr">
      <style>{CSS}</style>
      <main>
        <h1>Random word reader</h1>
        <div className="row" role="group" aria-label="Word length">
          {MODES.map(([key, label]) => (
            <button key={key} className="f" aria-pressed={mode === key} onClick={() => pickMode(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="word" aria-live="polite">{plain(cur)}</div>

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
            <button className="a" onClick={onHelp}>{help ? "Say slowly" : "Help"}</button>
            <button className="a alt" onClick={() => playWord()} disabled={!cur}>Hear it</button>
            <button className="a alt" onClick={checkPronunciation} disabled={!cur || listening}>{listening ? "Listening…" : "Check pronunciation"}</button>
            <button className="a" onClick={() => nextWord(mode)}>Next word</button>
          </div>
          {audioMessage && <p className="audio-status" role="status" aria-live="polite">{audioMessage}</p>}
        </div>

        <p className="stat">{progress}</p>
        <p className="note">2,000 everyday words. Words don’t repeat until you’ve seen them all.</p>
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
.rwr h1{font-size:1.5rem;margin:0 0 12px}
.rwr .row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.rwr .f{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:6px 14px;border-radius:999px;cursor:pointer}
.rwr .f[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.rwr .card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:28px 12px;text-align:center}
.rwr .word{font-size:clamp(2.6rem,14vw,5rem);font-weight:700;line-height:1.1;margin:8px 0 18px;word-break:break-word;min-height:1.2em}
.rwr .help{margin-top:6px}
.rwr .chunks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px}
.rwr .chunks span{font-size:clamp(2rem,10vw,3.4rem);font-weight:700;padding:2px 12px;border-radius:12px;color:#16233b;cursor:pointer}
.rwr .chunks span.on{outline:4px solid var(--acc)}
.rwr .tip{color:var(--mute);margin:10px 0 0}
.rwr .btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.rwr button.a{border:0;background:var(--acc);color:var(--acc-ink);font:inherit;font-weight:700;font-size:1.05rem;padding:12px 22px;border-radius:14px;cursor:pointer}
.rwr button.a.alt{background:transparent;color:var(--ink);border:2px solid var(--line)}
.rwr button:disabled{opacity:.6;cursor:not-allowed}
.rwr button:focus-visible{outline:3px solid #ffc83d;outline-offset:2px}
.rwr .stat{text-align:center;color:var(--mute);margin-top:14px}
.rwr .audio-status{min-height:1.5em;margin:12px 0 0;text-align:center;color:var(--mute);font-size:.9rem}
.rwr .note{color:var(--mute);font-size:.9rem;text-align:center;margin-top:20px}
`;