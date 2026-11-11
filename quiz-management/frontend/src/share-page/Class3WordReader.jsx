import { useState, useRef, useEffect } from "react";

// Complete dataset of 109 words with syllables, meanings, and chapters
const CSV_DATA = [
  // First Aid and Good or Bad Touch
  { word: "un-for-tu-nate", meaning: "Unlucky or happening by bad luck", chapter: "First Aid and Good or Bad Touch" },
  { word: "in-ju-ry", meaning: "Physical harm or damage to a body", chapter: "First Aid and Good or Bad Touch" },
  { word: "sur-round-ings", meaning: "The area or environment around a person or thing", chapter: "First Aid and Good or Bad Touch" },
  { word: "ac-quain-tance", meaning: "A person you know slightly, but who is not a close friend", chapter: "First Aid and Good or Bad Touch" },
  { word: "aloof", meaning: "Staying distant, uninvolved, or detached from others", chapter: "First Aid and Good or Bad Touch" },
  { word: "ir-ri-tat-ed", meaning: "Annoyed, angry, or impatient", chapter: "First Aid and Good or Bad Touch" },
  { word: "ac-ci-dent", meaning: "An unexpected and unintended event that usually causes damage or injury", chapter: "First Aid and Good or Bad Touch" },
  { word: "first aid", meaning: "Emergency care or treatment given to a sick or injured person before professional medical help arrives", chapter: "First Aid and Good or Bad Touch" },
  { word: "an-ti-sep-tic", meaning: "A substance that prevents infection by stopping the growth of germs/microorganisms", chapter: "First Aid and Good or Bad Touch" },
  { word: "ster-ile", meaning: "Completely free from bacteria, germs, or contamination", chapter: "First Aid and Good or Bad Touch" },
  { word: "gauze", meaning: "A thin, light, transparent cotton fabric used for dressing wounds", chapter: "First Aid and Good or Bad Touch" },
  { word: "in-stant", meaning: "Happening immediately or without delay", chapter: "First Aid and Good or Bad Touch" },
  { word: "pouch-es", meaning: "Small bags or sacks used for holding items", chapter: "First Aid and Good or Bad Touch" },
  { word: "asep-tic", meaning: "Free from disease-causing germs and bacteria", chapter: "First Aid and Good or Bad Touch" },
  { word: "struc-ture", meaning: "The arrangement of and relations between the parts or elements of something", chapter: "First Aid and Good or Bad Touch" },
  { word: "e-mer-gen-cy", meaning: "A serious, unexpected, and often dangerous situation requiring immediate action", chapter: "First Aid and Good or Bad Touch" },
  { word: "con-tam-i-nat-ed", meaning: "Made impure by exposure to or addition of a poisonous or polluting substance", chapter: "First Aid and Good or Bad Touch" },
  { word: "pre-scrip-tions", meaning: "Instructions written by a medical practitioner that authorize a patient to be issued a medicine", chapter: "First Aid and Good or Bad Touch" },
  { word: "frac-ture", meaning: "A crack or break in a bone", chapter: "First Aid and Good or Bad Touch" },
  { word: "bleed-ing", meaning: "The loss of blood from the vessels, damage or injury", chapter: "First Aid and Good or Bad Touch" },

  // Safety Rules
  { word: "re-duc-ing", meaning: "Making something smaller or less in size, amount, or degree", chapter: "Safety Rules" },
  { word: "obey", meaning: "To follow rules, orders, or instructions", chapter: "Safety Rules" },
  { word: "match-sticks", meaning: "Small wooden or cardboard sticks used for lighting fires", chapter: "Safety Rules" },
  { word: "stair-case", meaning: "A set of stairs and its surrounding structure", chapter: "Safety Rules" },
  { word: "ban-is-ters", meaning: "The handrail and vertical posts supporting it along the side of a staircase", chapter: "Safety Rules" },
  { word: "strain", meaning: "An injury to a muscle or tendon caused by stretching too far", chapter: "Safety Rules" },
  { word: "curl-ing i-ron", meaning: "A tool used to curl hair using heat", chapter: "Safety Rules" },
  { word: "un-plugged", meaning: "Disconnected from an electrical power supply", chapter: "Safety Rules" },
  { word: "ovens", meaning: "Enclosed compartments for heating, baking, or cooking food", chapter: "Safety Rules" },
  { word: "con-duc-tor", meaning: "A material or substance through which heat or electricity can easily pass", chapter: "Safety Rules" },
  { word: "e-lec-tric shock", meaning: "A sudden discharge of electricity through a body", chapter: "Safety Rules" },
  { word: "su-per-vi-sion", meaning: "The act of watching over, directing, or keeping an eye on someone or something", chapter: "Safety Rules" },
  { word: "pe-des-tri-an", meaning: "A person walking along a road or in a developed area", chapter: "Safety Rules" },
  { word: "ze-bra cross-ing", meaning: "A marked pedestrian crosswalk with alternating white stripes painted on the road", chapter: "Safety Rules" },
  { word: "fas-ten", meaning: "To securely attach, join, or close something (e.g., a seatbelt)", chapter: "Safety Rules" },
  { word: "tod-dler", meaning: "A young child who is just learning or has recently learned to walk", chapter: "Safety Rules" },
  { word: "meas-ures", meaning: "Actions taken to achieve a particular purpose", chapter: "Safety Rules" },
  { word: "ap-pli-ances", meaning: "A device or piece of equipment designed to perform a specific task", chapter: "Safety Rules" },
  { word: "e-lec-tri-cal", meaning: "Operating by or producing electricity", chapter: "Safety Rules" },
  { word: "au-to-mat-i-cal-ly", meaning: "Working by itself with little or no direct human control", chapter: "Safety Rules" },
  { word: "junc-tions", meaning: "A point where two or more things are joined", chapter: "Safety Rules" },
  { word: "pro-hib-it-ed", meaning: "Not allowed; forbidden by law or rule", chapter: "Safety Rules" },
  { word: "con-trol-ling", meaning: "To exercise restraint or direction over; keep under control", chapter: "Safety Rules" },
  { word: "lab-o-ra-to-ry", meaning: "A room or building equipped for scientific experiments or research", chapter: "Safety Rules" },

  // Dignity of Labour
  { word: "oc-cu-pa-tions", meaning: "Jobs, professions, or regular activities done to earn a living", chapter: "Dignity of Labour" },
  { word: "de-serve", meaning: "To be worthy of or earned", chapter: "Dignity of Labour" },
  { word: "in-volve", meaning: "To include or contain as a necessary part", chapter: "Dignity of Labour" },
  { word: "su-pe-ri-or", meaning: "Higher in rank, quality, status, or importance", chapter: "Dignity of Labour" },
  { word: "in-fe-ri-or", meaning: "Lower in rank, status, quality, or position", chapter: "Dignity of Labour" },
  { word: "sin-cer-i-ty", meaning: "The quality of being honest, genuine, and free from pretense", chapter: "Dignity of Labour" },
  { word: "ad-vo-cate", meaning: "A person who publicly supports, recommends, or argues for a cause", chapter: "Dignity of Labour" },
  { word: "in-tel-lect", meaning: "The ability to think, reason, understand, and learn", chapter: "Dignity of Labour" },
  { word: "dig-ni-ty", meaning: "The state or quality of being worthy of honor and respect", chapter: "Dignity of Labour" },
  { word: "com-mu-ni-ty help-ers", meaning: "People in our community who help us live safely and comfortably", chapter: "Dignity of Labour" },
  { word: "la-bour-er", meaning: "A person doing unskilled manual work for wages", chapter: "Dignity of Labour" },
  { word: "in-ter-na-tion-al", meaning: "Existing, occurring, or carried on between two or more nations", chapter: "Dignity of Labour" },
  { word: "dif-fer-ent-ly abled", meaning: "Having a physical or mental disability", chapter: "Dignity of Labour" },

  // Family and Its Types
  { word: "sig-nif-i-cant", meaning: "Important or meaningful", chapter: "Family and Its Types" },
  { word: "mo-bil-i-ty", meaning: "The ability to move from one place to another", chapter: "Family and Its Types" },
  { word: "ur-ban-i-za-tion", meaning: "The process of making an area more urban (developing towns/cities)", chapter: "Family and Its Types" },
  { word: "in-sti-tu-tion", meaning: "An established custom, practice, or organization", chapter: "Family and Its Types" },
  { word: "nur-tured", meaning: "Cared for, encouraged, and supported growth", chapter: "Family and Its Types" },
  { word: "con-du-cive", meaning: "Making a certain situation or outcome likely or suitable", chapter: "Family and Its Types" },
  { word: "kin-ship", meaning: "Blood relationship or family ties", chapter: "Family and Its Types" },
  { word: "met-ro-pol-i-tan", meaning: "Relating to a large and densely populated city or major urban area", chapter: "Family and Its Types" },
  { word: "cor-dial", meaning: "Warm, friendly, and polite", chapter: "Family and Its Types" },
  { word: "alien-a-tion", meaning: "The state of feeling isolated or detached from a group or environment", chapter: "Family and Its Types" },
  { word: "cer-e-mo-nies", meaning: "A formal religious or public ceremony, ritual or occasion", chapter: "Family and Its Types" },
  { word: "un-di-vid-ed", meaning: "Not divided or split; whole", chapter: "Family and Its Types" },
  { word: "har-mo-ni-ous", meaning: "Forming a pleasing and consistent whole; free from disagreement", chapter: "Family and Its Types" },
  { word: "nu-cle-ar fam-i-ly", meaning: "A family group consisting only of parents and children", chapter: "Family and Its Types" },
  { word: "joint fam-i-ly", meaning: "An undivided family where more than one generation live together", chapter: "Family and Its Types" },
  { word: "co-op-er-ate", meaning: "Act jointly with others towards the same end", chapter: "Family and Its Types" },

  // Changes in Neighbourhood and School
  { word: "life-style", meaning: "The way in which a person or group lives, including their habits, opinions, and interests", chapter: "Changes in Neighbourhood and School" },
  { word: "geo-graph-i-cal", meaning: "Relating to the physical features and location of a place", chapter: "Changes in Neighbourhood and School" },
  { word: "trends", meaning: "General directions in which something is developing or changing", chapter: "Changes in Neighbourhood and School" },
  { word: "o-pin-ion", meaning: "A view or judgment formed about something", chapter: "Changes in Neighbourhood and School" },
  { word: "tra-di-tion", meaning: "The transmission of customs or beliefs from generation to generation", chapter: "Changes in Neighbourhood and School" },
  { word: "ur-ban", meaning: "Relating to, or characteristic of a city or town", chapter: "Changes in Neighbourhood and School" },
  { word: "ru-ral", meaning: "Relating to, or characteristic of the countryside rather than the town", chapter: "Changes in Neighbourhood and School" },
  { word: "e-con-om-ic", meaning: "Relating to the economics or economy of a country or region", chapter: "Changes in Neighbourhood and School" },

  // Medium-Hard General Knowledge & Social Studies Concepts
  { word: "en-vi-ron-ment", meaning: "The surroundings or conditions in which a person, animal, or plant lives", chapter: "Environment & Nature" },
  { word: "com-mu-ni-ca-tion", meaning: "The imparting or exchanging of information by speaking, writing, or using other mediums", chapter: "Means of Communication" },
  { word: "trans-por-ta-tion", meaning: "The movement of humans, animals, and goods from one location to another", chapter: "Means of Transport" },
  { word: "neigh-bour-hood", meaning: "The district or area surrounding a particular place, or the people living there", chapter: "Our Neighbourhood" },
  { word: "di-rec-tions", meaning: "A course along which someone or something moves; north, south, east, and west", chapter: "Maps and Directions" },
  { word: "gov-ern-ment", meaning: "The group of people with the authority to govern a country or state", chapter: "Our Government" },
  { word: "fes-ti-vals", meaning: "A day or period of celebration, typically for religious reasons", chapter: "Our Festivals" },
  { word: "na-tion-al", meaning: "Relating to a nation as a whole; common to the whole country", chapter: "National Symbols" },
  { word: "mon-u-ments", meaning: "A statue, building, or other structure erected to commemorate a notable person or event", chapter: "Historical Monuments" },
  { word: "cli-mate", meaning: "The weather conditions prevailing in an area in general or over a long period", chapter: "Weather and Climate" },
  { word: "ag-ri-cul-ture", meaning: "The science or practice of farming, including cultivation of the soil and rearing of animals", chapter: "Agriculture in India" },
  { word: "in-dus-try", meaning: "Economic activity concerned with the processing of raw materials and manufacture of goods", chapter: "Industries" },
  { word: "nat-u-ral re-sourc-es", meaning: "Materials or substances such as minerals, forests, water, and fertile land occurring in nature", chapter: "Natural Resources" },
  { word: "pop-u-la-tion", meaning: "All the inhabitants of a particular town, area, or country", chapter: "Our Population" },
  { word: "con-sti-tu-tion", meaning: "A body of fundamental principles or established precedents according to which a state is governed", chapter: "Civics & Rules" },
  { word: "dem-oc-ra-cy", meaning: "A system of government by the whole population through elected representatives", chapter: "Our Government" },
  { word: "am-bu-lance", meaning: "A vehicle equipped for taking sick or injured people to and from a hospital", chapter: "First Aid & Safety" },
  { word: "dis-as-ter", meaning: "A sudden accident or a natural catastrophe that causes great damage or loss of life", chapter: "Safety & Disasters" },
  { word: "con-ti-nent", meaning: "Any of the world's main continuous expanses of land (Europe, Asia, Africa, etc.)", chapter: "The Earth and Continents" },
  { word: "at-mos-phere", meaning: "The envelope of gases surrounding the earth or another planet", chapter: "Our Earth" }
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

export default function RandomWordReader() {
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