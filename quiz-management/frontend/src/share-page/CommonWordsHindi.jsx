import { useState, useRef, useEffect } from "react";

  
const WORD_DATA = [
  ["Hindi words", "कमल", "kamal"],
  ["Hindi words", "कलम", "kalam"],
  ["Hindi words", "किताब", "kitaab"],
  ["Hindi words", "कबूतर", "kabutar"],
  ["Hindi words", "किसान", "kisaan"],
  ["Hindi words", "कपड़ा", "kapda"],
  ["Hindi words", "कमरा", "kamra"],
  ["Hindi words", "कंगन", "kangan"],
  ["Hindi words", "खरगोश", "khargosh"],
  ["Hindi words", "खिलौना", "khilauna"],
  ["Hindi words", "गमला", "gamla"],
  ["Hindi words", "गाजर", "gajar"],
  ["Hindi words", "गाय", "gaay"],
  ["Hindi words", "गुलाब", "gulab"],
  ["Hindi words", "घर", "ghar"],
  ["Hindi words", "चम्मच", "chammach"],
  ["Hindi words", "चिड़िया", "chidiya"],
  ["Hindi words", "चमक", "chamak"],
  ["Hindi words", "चावल", "chawal"],
  ["Hindi words", "जहाज", "jahaz"],
  ["Hindi words", "झरना", "jharna"],
  ["Hindi words", "टमाटर", "tamatar"],
  ["Hindi words", "डमरू", "damru"],
  ["Hindi words", "तरबूज", "tarbooj"],
  ["Hindi words", "तितली", "titli"],
  ["Hindi words", "दरवाजा", "darwaza"],
  ["Hindi words", "नदी", "nadi"],
  ["Hindi words", "नमक", "namak"],
  ["Hindi words", "पतंग", "patang"],
  ["Hindi words", "पानी", "paani"],
  ["Hindi words", "पुस्तक", "pustak"],
  ["Hindi words", "फूल", "phool"],
  ["Hindi words", "बकरी", "bakri"],
  ["Hindi words", "बादल", "baadal"],
  ["Hindi words", "बिल्ली", "billi"],
  ["Hindi words", "मछली", "machhli"],
  ["Hindi words", "मटर", "matar"],
  ["Hindi words", "मोर", "mor"],
  ["Hindi words", "रथ", "rath"],
  ["Hindi words", "लड्डू", "laddoo"],
  ["Hindi words", "सेब", "seb"],
  ["Hindi words", "हाथी", "haathi"],
  ["Hindi words", "आम", "aam"],
  ["Hindi words", "अंगूर", "angur"],
  ["Hindi words", "इलायची", "ilaichi"],
  ["Hindi words", "उम्र", "umr"],
  ["Hindi words", "एड़ी", "eddi"],
  ["Hindi words", "कद्दू", "kaddoo"],
  ["Hindi words", "खजूर", "khajoor"],
  ["Hindi words", "गेंद", "genda"],
  ["Hindi words", "घड़ी", "ghadi"],
  ["Hindi words", "चाबी", "chaabi"],
  ["Hindi words", "जलेबी", "jalebi"],
  ["Hindi words", "जड़ी-बूटी", "jadibooti"],
  ["Hindi words", "तस्वीर", "tasveer"],
  ["Hindi words", "दीवार", "deewar"],
  ["Hindi words", "धूप", "dhoop"],
  ["Hindi words", "नाश्ता", "nashta"],
  ["Hindi words", "पढ़ाई", "padhai"],
  ["Hindi words", "प्रकाश", "prakash"],
  ["Hindi words", "बगीचा", "bagicha"],
  ["Hindi words", "भालू", "bhalu"],
  ["Hindi words", "मक्खन", "makhan"],
  ["Hindi words", "मोती", "moti"],
  ["Hindi words", "राजा", "raja"],
  ["Hindi words", "सूरज", "suraj"],
  ["Hindi words", "साइकिल", "sicycle"],
  ["Hindi words", "सफेद", "safed"],
  ["Hindi words", "तारा", "tara"],
  ["Hindi words", "उतर", "utar"],
  ["Hindi words", "काला", "kala"],
  ["Hindi words", "नाच", "naach"],
  ["Hindi words", "पंखा", "pankha"],
  ["Hindi words", "रोटी", "roti"],
  ["Hindi words", "सीढ़ी", "seedhi"],
  ["Hindi words", "शेर", "sher"],
  ["Hindi words", "सारी", "sari"],
  ["Hindi words", "हवा", "hava"],
  ["Hindi words", "मकान", "makaan"],
  ["Hindi words", "कुंजी", "kunji"],
  ["Hindi words", "तश्तरी", "thali"],
  ["Hindi words", "छत", "chhat"],
  ["Hindi words", "जमीन", "zameen"],
  ["Hindi words", "कठपुतली", "kathputli"],
  ["Hindi words", "सिमटना", "simatna"],
  ["Hindi words", "मौसम", "mausam"],
  ["Hindi words", "दवाई", "dawai"],
  ["Hindi words", "प्याज", "pyaz"],
  ["Hindi words", "सड़क", "sadak"],
  ["Hindi words", "पढ़ना", "padhna"],
  ["Hindi words", "लिखना", "likhna"],
  ["Hindi words", "कक्षा", "kaksha"],
  ["Hindi words", "विद्यालय", "vidyalaya"],
  ["Hindi words", "किराना", "kirana"],
  ["Hindi words", "समाचार", "samachar"],
  ["Hindi words", "ताजगी", "taazgi"],
  ["Hindi words", "पर्यावरण", "paryavaran"],
  ["Hindi words", "मस्जिद", "masjid"],
  ["Hindi words", "गाड़ी", "gaadi"],
  ["Hindi words", "पोर्टेबल", "portable"],
  ["Hindi words", "मिलना", "milna"],
  ["Hindi words", "सामने", "saamne"],
  ["Hindi words", "कागज", "kagaj"],
  ["Hindi words", "तारीख", "taareekh"],
  ["Hindi words", "भोजन", "bhojan"],
  ["Hindi words", "ध्यान", "dhyaan"],
  ["Hindi words", "शिक्षक", "shikshak"],
  ["Hindi words", "उपकरण", "upkaran"],
  ["Hindi words", "ताज", "taaj"]
];

const INITIAL_DATA = WORD_DATA.map(([category, hindiWord, englishWord], index) => ({
  id: index + 1,
  category,
  word: englishWord,
  clue: hindiWord,
}));

const CATEGORY_TABS = [
  ["all", "All topics"],
  ...Array.from(new Set(WORD_DATA.map(([category]) => category)), (category) => [category, category]),
];

const COLORS = ["--c1", "--c2", "--c3", "--c4"];
const matchCategory = (item, tab) => tab === "all" || item.category === tab;

const normalizeAnswer = (value) => value.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
const splitCharacters = (value) => {
  const word = value.normalize("NFC").trim();
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter("en", { granularity: "grapheme" }).segment(word),
      (part) => part.segment
    );
  }
  return Array.from(word);
};

// Show only some letters (first, last and every 3rd); mask the rest with *
const maskWord = (word) => {
  const chars = splitCharacters(word);
  return chars
    .map((ch, i) => {
      if (!/[\p{L}\p{N}]/u.test(ch)) return ch; // keep spaces . / - etc.
      const prev = chars[i - 1];
      const next = chars[i + 1];
      const startOfPart = i === 0 || !/[\p{L}\p{N}]/u.test(prev);
      const endOfPart = i === chars.length - 1 || !/[\p{L}\p{N}]/u.test(next);
      const partLen = (() => {
        let a = i, b = i;
        while (a > 0 && /[\p{L}\p{N}]/u.test(chars[a - 1])) a--;
        while (b < chars.length - 1 && /[\p{L}\p{N}]/u.test(chars[b + 1])) b++;
        return { a, len: b - a + 1 };
      })();
      const pos = i - partLen.a;
      if (startOfPart) return ch;
      if (partLen.len > 3 && (endOfPart || pos % 3 === 0)) return ch;
      return "*";
    })
    .join("");
};

const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const speak = (text, rate = 0.85, lang = "en-US") =>
  new Promise((resolve, reject) => {
    const engine = window.speechSynthesis;
    if (!engine || !window.SpeechSynthesisUtterance) {
      reject(new Error("Speech playback is not supported in this browser."));
      return;
    }
    try {
      engine.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      const matchedVoice = engine
        .getVoices()
        .find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
      if (matchedVoice) utterance.voice = matchedVoice;
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

export default function CommonWordsHindi() {
  const words = INITIAL_DATA;
  const [tab, setTab] = useState("all");
  const [cur, setCur] = useState(null);
  const [quizMode, setQuizMode] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState([]);
  const [roundDone, setRoundDone] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const inputRef = useRef(null);
  const advanceTimer = useRef(null);
  const goNextRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySeconds, setAutoPlaySeconds] = useState(5);
  const [soundOn, setSoundOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [help, setHelp] = useState(false);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [listening, setListening] = useState(false);

  const readerRef = useRef(null);
  const st = useRef({ pool: [], seen: 0, total: 0, token: 0, recognition: null });
  const curRef = useRef(cur);
  curRef.current = cur;
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(
    () => () => {
      window.clearTimeout(advanceTimer.current);
      window.speechSynthesis?.cancel();
      const recognition = st.current.recognition;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
    },
    []
  );

  useEffect(() => {
    const updateFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === readerRef.current);
    };
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (!readerRef.current) return;
    try {
      if (document.fullscreenElement === readerRef.current) {
        await document.exitFullscreen();
      } else if (typeof readerRef.current.requestFullscreen !== "function") {
        setAudioMessage("Fullscreen is not supported in this browser.");
      } else {
        await readerRef.current.requestFullscreen();
      }
    } catch (error) {
      setAudioMessage(`Could not change fullscreen mode: ${error.message}`);
    }
  };

  const playWord = async (text = curRef.current?.clue || curRef.current?.word || "", rate = 0.85, lang = "hi-IN") => {
    if (!text || !soundOn) return;
    const s = st.current;
    const token = ++s.token;
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setActive(-1);
    setAudioMessage("Playing pronunciation…");
    try {
      await speak(text, rate, lang);
      if (s.token === token) setAudioMessage("Audio finished.");
    } catch (error) {
      if (s.token === token) setAudioMessage(error.message || "Could not play audio.");
    }
  };

  const checkPronunciation = () => {
    if (!curRef.current) return;
    if (!window.isSecureContext) {
      setAudioMessage(
        "Microphone access requires a secure connection. Open this site over HTTPS."
      );
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
    setAudioMessage("Listening… Say the English term clearly.");

    recognition.onresult = (event) => {
      if (s.token !== token) return;
      const expectedWord = curRef.current.word.trim();
      const heard = Array.from(event.results[0], (result) => result.transcript.trim());
      const matched = heard.some((transcript) => normalizeAnswer(transcript) === normalizeAnswer(expectedWord));
      setAudioMessage(
        matched
          ? `Speech recognition heard "${expectedWord}". Good match!`
          : `Heard "${heard[0] || "nothing"}" instead. Try again, or use Hear it as a guide.`
      );
    };

    recognition.onerror = (event) => {
      if (s.token !== token || event.error === "aborted") return;
      const message =
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow microphone access to check your speech."
          : event.error === "no-speech"
          ? "No speech was detected. Try again and speak clearly."
          : event.error === "network"
          ? "Speech recognition could not connect. Check your internet connection."
          : `Speech check failed${event.error ? `: ${event.error}` : "."}`;
      setAudioMessage(message);
      setListening(false);
      s.recognition = null;
    };

    recognition.onend = () => {
      if (s.token !== token) return;
      setListening(false);
      s.recognition = null;
      setAudioMessage((message) =>
        message === "Listening… Say the English term clearly."
          ? "No word was recognized. Try again and speak clearly."
          : message
      );
    };

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      s.recognition = null;
      setAudioMessage(`Could not start speech recognition: ${error.message}`);
    }
  };

  const nextWord = (selectedTab, wordList = wordsRef.current) => {
    setQuizAnswer("");
    setQuizResult(null);
    const s = st.current;
    if (!s.pool.length) {
      const filtered = wordList.filter((item) => matchCategory(item, selectedTab));
      if (!filtered.length) {
        setCur(null);
        setProgress(`No terms found for ${selectedTab}`);
        setAudioMessage("");
        return;
      }
      s.pool = shuffle(filtered);
      s.seen = 0;
      s.total = s.pool.length;
    }
    const nextItem = s.pool.pop();
    s.seen++;
    s.token++;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setAudioMessage("");
    setCur(nextItem);
    setHelp(false);
    setActive(-1);
    setProgress(`Word ${s.seen} of ${s.total}`);
    return nextItem;
  };

  const resetQuizStats = () => {
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setBestStreak(0);
    setMissed([]);
    setRoundDone(false);
  };

  const startQuiz = (selectedTab = tab) => {
    resetQuizStats();
    st.current.pool = [];
    const item = nextWord(selectedTab);
    if (item) playWord(item.clue, 0.85, "hi-IN");
  };

  const goNextQuestion = () => {
    window.clearTimeout(advanceTimer.current);
    if (st.current.pool.length === 0) {
      setRoundDone(true);
      return;
    }
    const item = nextWord(tab);
    if (item) playWord(item.clue, 0.85, "hi-IN");
  };

  goNextRef.current = goNextQuestion;

  const skipQuestion = () => {
    if (!cur) return;
    if (quizResult === null) {
      setScore((x) => ({ ...x, total: x.total + 1 }));
      setStreak(0);
      setMissed((list) => (list.some((w) => w.id === cur.id) ? list : [...list, cur]));
    }
    goNextQuestion();
  };

  const retryCurrent = () => {
    setQuizAnswer("");
    setQuizResult(null);
    setSubmitted("");
    setAudioMessage("Try again manually.");
    inputRef.current?.focus();
  };

  const retryMissed = () => {
    const s = st.current;
    s.pool = shuffle(missed);
    s.seen = 0;
    s.total = s.pool.length;
    resetQuizStats();
    const item = nextWord(tab);
    if (item) playWord(item.clue, 0.85, "hi-IN");
  };

  const submitQuizAnswer = (event) => {
    event.preventDefault();
    if (!cur) return;
    if (quizResult !== null) {
      goNextQuestion();
      return;
    }
    if (!quizAnswer.trim()) {
      playWord(cur.clue, 0.85, "hi-IN");
      return;
    }
    const ok = normalizeAnswer(quizAnswer) === normalizeAnswer(cur.word);
    setSubmitted(quizAnswer.trim());
    setQuizResult(ok);
    setScore((x) => ({ correct: x.correct + (ok ? 1 : 0), total: x.total + 1 }));
    if (ok) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => goNextRef.current?.(), 900);
      setStreak((x) => {
        setBestStreak((b) => Math.max(b, x + 1));
        return x + 1;
      });
    } else {
      window.clearTimeout(advanceTimer.current);
      setStreak(0);
      setMissed((list) => (list.some((w) => w.id === cur.id) ? list : [...list, cur]));
    }
  };

  const pickTab = (selectedTab) => {
    setTab(selectedTab);
    st.current.pool = [];
    if (quizMode) resetQuizStats();
    nextWord(selectedTab);
  };

  useEffect(() => {
    if (quizMode) inputRef.current?.focus();
  }, [cur?.id, quizMode, roundDone, quizResult]);

  useEffect(() => {
    nextWord("all", INITIAL_DATA);
  }, []);

  useEffect(() => {
    if (!autoPlay || !cur || listening || quizMode) return undefined;
    const timer = window.setTimeout(() => nextWord(tab), autoPlaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [autoPlay, autoPlaySeconds, cur?.id, listening, quizMode, tab]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (e.key === " " && !quizMode && tag !== "BUTTON" && tag !== "INPUT" && tag !== "SELECT") {
        e.preventDefault();
        nextWord(tab);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tab, words, quizMode]);

  const parts = cur?.clue ? cur.clue.split(/\s+/) : [];
  const quizLetters = cur ? splitCharacters(cur.clue) : [];

  const onHelp = async () => {
    if (!cur) return;
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
    setAudioMessage("Playing term slowly…");

    for (let i = 0; i < parts.length; i++) {
      if (s.token !== t) return;
      setActive(i);
      try {
        await speak(parts[i], 0.65, "hi-IN");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
        setActive(-1);
        return;
      }
    }
    setActive(-1);
    if (s.token === t) {
      try {
        await speak(curRef.current.clue || curRef.current.word, 0.8, "hi-IN");
        if (s.token === t) setAudioMessage("Audio finished.");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
      }
    }
  };

  return (
    <div className="rwr" ref={readerRef}>
      <style>{CSS}</style>
      <main>
        <div className="header-row">
          <h1>Hindi Words Quiz</h1>
          <div className="header-actions">
            <button type="button" className="a alt sound-button" onClick={() => setSoundOn((v) => !v)} aria-pressed={soundOn}>
              {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
            <button type="button" className="a alt fullscreen-button" onClick={toggleFullscreen}>
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </div>

        <label className="topic-select">
          <span>Choose topic</span>
          <select
            aria-label="Choose topic"
            value={tab}
            onChange={(event) => pickTab(event.target.value)}
          >
            {CATEGORY_TABS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        {cur && !roundDone && (
          <div className="scoreboard" role="status" aria-live="polite">
            <div><span>Score</span><strong>{score.correct} / {score.total}</strong></div>
            <div><span>Accuracy</span><strong>{score.total ? Math.round((score.correct / score.total) * 100) : 0}%</strong></div>
            <div><span>Streak 🔥</span><strong>{streak}</strong></div>
            <div><span>Missed</span><strong>{missed.length}</strong></div>
            <div className="bar"><i style={{ width: `${st.current.total ? (score.total / st.current.total) * 100 : 0}%` }} /></div>
          </div>
        )}

        <div className="card">
          {cur && roundDone ? (
            <form
              className="quiz-card quiz-summary"
              onSubmit={(event) => {
                event.preventDefault();
                if (missed.length > 0) retryMissed();
                else startQuiz();
              }}
            >
              <p className="quiz-title">Round complete 🎉</p>
              <p className="big-score">{score.correct} / {score.total}</p>
              {missed.length > 0 && (
                <div className="missed-list">
                  <p>Words you missed:</p>
                  <ul>{missed.map((w) => <li key={w.id}>{w.word}</li>)}</ul>
                </div>
              )}
              <label htmlFor="word-quiz-answer">
                {missed.length > 0 ? "Press Enter to retry missed words" : "Press Enter to start a new round"}
              </label>
              <input id="word-quiz-answer" ref={inputRef} readOnly autoFocus placeholder="Press Enter" />
              <div className="quiz-actions">
                <button type="submit" className="a">{missed.length > 0 ? `Retry missed (${missed.length})` : "New round"}</button>
              </div>
            </form>
          ) : cur ? (
            <form className="quiz-card" onSubmit={submitQuizAnswer}>
              <p className="quiz-instruction">Topic: {cur.category}</p>
              <div className="masked" aria-label="Hindi word with hidden letters">{cur.clue}</div>
              <label htmlFor="word-quiz-answer">
                {quizResult === null ? "Type the English name, then press Submit" : "Press Enter for next"}
              </label>
              <input
                id="word-quiz-answer"
                ref={inputRef}
                className={quizResult === null ? "" : quizResult ? "ok" : "bad"}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                placeholder="Type here"
                readOnly={quizResult !== null}
                value={quizAnswer}
                onChange={(event) => setQuizAnswer(event.target.value)}
              />
              <div className={`quiz-feedback ${quizResult === null ? "" : quizResult ? "correct" : "incorrect"}`} role="status" aria-live="polite">
                {quizResult === true && "✓ Correct match!"}
                {quizResult === false && (
                  <>
                    <div>✗ Wrong answer.</div>
                    <div className="answer-line">You typed: <s>{submitted}</s></div>
                    <div className="answer-line">Correct answer: <strong>{cur.word}</strong></div>
                  </>
                )}
              </div>
              <div className="quiz-actions">
                <button type="button" className="a alt" onClick={() => playWord(cur.clue, 0.85, "hi-IN")}>
                  🔊 Hear Hindi word
                </button>
                <button type="submit" className="a" disabled={quizResult !== null || !quizAnswer.trim()}>
                  Submit
                </button>
                {quizResult === false && (
                  <button type="button" className="a alt" onClick={retryCurrent}>
                    Try again
                  </button>
                )}
                <button type="button" className={`a ${quizResult === false ? "" : "alt"}`} onClick={skipQuestion}>
                  {st.current.pool.length === 0 ? "See results →" : "Next →"}
                </button>
              </div>
            </form>
          ) : (
            <p>No terms found.</p>
          )}
        </div>

        <p className="stat">{progress}</p>
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
.rwr .header-row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px}
.rwr .header-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.rwr .sound-button,.rwr .fullscreen-button{white-space:nowrap}
.rwr:fullscreen{width:100vw;height:100vh;height:100dvh;overflow-y:auto;background:var(--bg)}
.rwr:fullscreen main{max-width:860px;padding-top:24px}
.rwr h1{font-size:1.5rem;margin:0}
.rwr .source-link{font-size:.9rem;color:var(--acc);text-decoration:none;font-weight:600}
.rwr .source-link:hover{text-decoration:underline}
.rwr .row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.rwr .topic-select{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 14px;color:var(--mute);font-size:.9rem}
.rwr .topic-select select{width:100%;min-height:44px;padding:8px 12px;border:2px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:inherit}
.rwr .mode-controls{justify-content:center}
.rwr .autoplay-controls{align-items:center}
.rwr .autoplay-select{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0;color:var(--mute);font-size:.9rem}
.rwr .autoplay-select select{width:auto;min-width:120px;min-height:42px;border:2px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);font:inherit;padding:6px 12px}
.rwr .quiz-card{max-width:520px;margin:0 auto;text-align:left}
.rwr .quiz-instruction{margin:0;color:var(--mute);text-align:center}
.rwr .quiz-clue{margin:4px 0 18px;font-size:clamp(1.5rem,6vw,2.2rem);font-weight:700;text-align:center;overflow-wrap:anywhere}
.rwr .masked{margin:10px 0 18px;text-align:center;font-size:clamp(1.8rem,8vw,2.8rem);font-weight:700;letter-spacing:.18em;font-family:ui-monospace,Menlo,Consolas,monospace;overflow-wrap:anywhere}
.rwr .quiz-title{margin:0 0 4px;font-size:1.4rem;font-weight:700;text-align:center}
.rwr .quiz-actions.top{justify-content:center;margin:14px 0 18px}
.rwr .quiz-actions.top .a{flex:0 1 auto;font-size:.9rem;padding:8px 16px}
.rwr .quiz-card input.ok{border-color:#1d8a4f;background:rgba(29,138,79,.1)}
.rwr .quiz-card input.bad{border-color:#c93b3b;background:rgba(201,59,59,.1)}
.rwr .answer-line{font-weight:600;color:var(--ink)}
.rwr .answer-line s{color:#c93b3b;text-decoration:line-through}
.rwr .answer-line strong{color:#1d8a4f;font-size:1.2em}
.rwr .quiz-feedback.correct{color:#1d8a4f}
.rwr .quiz-feedback.incorrect{color:#c93b3b}
.rwr .quiz-feedback.incorrect .answer-line strong{color:#1d8a4f}
.rwr .scoreboard{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;padding:12px;background:var(--card);border:2px solid var(--line);border-radius:16px;text-align:center}
.rwr .scoreboard span{display:block;color:var(--mute);font-size:.75rem}
.rwr .scoreboard strong{font-size:1.3rem}
.rwr .scoreboard .bar{grid-column:1/-1;height:6px;border-radius:99px;background:var(--line);overflow:hidden}
.rwr .scoreboard .bar i{display:block;height:100%;background:var(--acc);transition:width .3s}
.rwr .big-score{margin:6px 0;font-size:3rem;font-weight:700;text-align:center}
.rwr .missed-list{margin:14px 0;text-align:left}
.rwr .missed-list p{margin:0 0 6px;color:var(--mute)}
.rwr .missed-list ul{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}
.rwr .missed-list li{padding:4px 12px;border-radius:999px;background:rgba(201,59,59,.12);color:#c93b3b;font-weight:600;font-size:.95rem}
.rwr .quiz-hints{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:16px}
.rwr .quiz-hints>div{display:grid;justify-items:center;gap:4px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--bg)}
.rwr .quiz-hints span{color:var(--mute);font-size:.82rem}
.rwr .quiz-hints strong{font-size:1.7rem}
.rwr .quiz-card label{display:block;margin-bottom:5px;color:var(--mute);font-size:.9rem}
.rwr .quiz-card input{width:100%;min-height:48px;padding:10px 12px;border:2px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);font:inherit}
.rwr .quiz-feedback{min-height:1.5em;margin:10px 0;color:var(--mute);font-weight:700}
.rwr .quiz-feedback.correct{color:#1d8a4f}
.rwr .quiz-feedback.incorrect{color:#c93b3b}
.rwr .quiz-actions{display:flex;flex-wrap:wrap;gap:8px}
.rwr .quiz-actions .a{flex:1 1 150px}
.rwr .f{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:6px 14px;border-radius:999px;cursor:pointer;transition:background .15s,border-color .15s}
.rwr .f[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.rwr .card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:28px 12px;text-align:center}
.rwr .word{font-size:clamp(2.5rem,12vw,4.5rem);font-weight:700;line-height:1.2;margin:8px 0 6px;word-break:break-word;min-height:1.2em}
.rwr .help{margin-top:6px}
.rwr .meaning{font-size:1.1rem;font-weight:600;color:var(--mute);margin-bottom:10px}
.rwr .chunks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px}
.rwr .chunks span{font-size:clamp(1.5rem,7vw,2.4rem);font-weight:700;padding:2px 12px;border-radius:12px;color:#16233b;cursor:pointer}
.rwr .chunks span.on{outline:4px solid var(--acc)}
.rwr .tip{color:var(--mute);margin:10px 0 0}
.rwr .btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.rwr button.a{border:0;background:var(--acc);color:var(--acc-ink);font:inherit;font-weight:700;font-size:1.05rem;padding:12px 22px;border-radius:14px;cursor:pointer}
.rwr button.a.alt{background:transparent;color:var(--ink);border:2px solid var(--line)}
.rwr button:disabled{opacity:.6;cursor:not-allowed}
.rwr button:focus-visible{outline:3px solid #ffc83d;outline-offset:2px}
.rwr .empty-state{padding:24px 0}
.rwr .stat{text-align:center;color:var(--mute);margin-top:14px}
.rwr .audio-status{min-height:1.5em;margin:12px 0 0;text-align:center;color:var(--mute);font-size:.9rem}
.rwr .note{color:var(--mute);font-size:.9rem;text-align:center;margin-top:20px}
.rwr .note a{color:var(--acc);text-decoration:none}
.rwr .note a:hover{text-decoration:underline}
`;