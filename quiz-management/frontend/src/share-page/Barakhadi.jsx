import { useEffect, useMemo, useRef, useState } from "react";

export const pageTitle = "Barakhadi";
export const pageDescription = "Explore Hindi letter-vowel combinations, hear their sounds, and practise by row.";

/* ---------- data ---------- */
const MATRAS = ["", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ः"];
const VOWELS_HI = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "अं", "अः"];
const VOWELS_EN = ["a", "aa", "i", "ee", "u", "oo", "e", "ai", "o", "au", "an", "ah"];

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

const HINDI_ROWS = HINDI.map(([hi, en]) => ({
  label: hi,
  sub: en,
  cells: MATRAS.map((matra, i) => ({ main: hi + matra, sub: en + VOWELS_EN[i], lang: "hi-IN" })),
}));
const ENGLISH_ROWS = ENGLISH.map((letter) => ({
  label: letter,
  sub: "",
  cells: VOWELS_EN.map((vowel) => ({ main: letter.toLowerCase() + vowel, sub: "", lang: "en-US" })),
}));
// Example word for each syllable: { syllable: [Hindi word, English meaning] }
const WORDS = {
  क: ["कमल", "lotus"], का: ["काम", "work"], कि: ["किताब", "book"], की: ["कीड़ा", "insect"], कु: ["कुत्ता", "dog"], कू: ["कूद", "jump"], के: ["केला", "banana"], कै: ["कैंची", "scissors"], को: ["कोयल", "cuckoo"], कौ: ["कौआ", "crow"], कं: ["कंघी", "comb"],
  ख: ["खरगोश", "rabbit"], खा: ["खाना", "food"], खि: ["खिड़की", "window"], खी: ["खीर", "rice pudding"], खु: ["खुश", "happy"], खू: ["खूबानी", "apricot"], खे: ["खेल", "game"], खो: ["खोज", "search"],
  ग: ["गमला", "flower pot"], गा: ["गाय", "cow"], गि: ["गिलास", "glass"], गी: ["गीत", "song"], गु: ["गुड़िया", "doll"], गे: ["गेंद", "ball"], गै: ["गैस", "gas"], गो: ["गोल", "round"], गौ: ["गौरैया", "sparrow"],
  घ: ["घर", "house"], घा: ["घास", "grass"], घी: ["घी", "ghee"], घो: ["घोड़ा", "horse"],
  च: ["चम्मच", "spoon"], चा: ["चाँद", "moon"], चि: ["चिड़िया", "bird"], ची: ["चीनी", "sugar"], चु: ["चुप", "quiet"], चू: ["चूहा", "mouse"], चे: ["चेहरा", "face"], चो: ["चोर", "thief"], चौ: ["चौक", "square"],
  छ: ["छत", "roof"], छा: ["छाता", "umbrella"], छि: ["छिपकली", "lizard"], छु: ["छुट्टी", "holiday"], छू: ["छूना", "to touch"], छे: ["छेद", "hole"], छो: ["छोटा", "small"],
  ज: ["जल", "water"], जा: ["जादू", "magic"], जि: ["जिराफ", "giraffe"], जी: ["जीभ", "tongue"], जु: ["जुराब", "socks"], जू: ["जूता", "shoe"], जे: ["जेब", "pocket"], जो: ["जोकर", "joker"], जौ: ["जौ", "barley"],
  झ: ["झगड़ा", "fight"], झा: ["झाड़ू", "broom"], झी: ["झील", "lake"], झू: ["झूला", "swing"], झो: ["झोला", "cloth bag"],
  ट: ["टमाटर", "tomato"], टो: ["टोपी", "cap"],
  ठ: ["ठंड", "cold"], ठे: ["ठेला", "cart"],
  ड: ["डमरू", "small drum"], डा: ["डाक", "mail"], डि: ["डिब्बा", "box"], डो: ["डोरी", "string"],
  ढ: ["ढक्कन", "lid"], ढो: ["ढोल", "drum"],
  त: ["तरबूज़", "watermelon"], ता: ["तारा", "star"], ति: ["तितली", "butterfly"], ती: ["तीर", "arrow"], तु: ["तुलसी", "basil"], ते: ["तेल", "oil"], तै: ["तैरना", "to swim"], तो: ["तोता", "parrot"], तौ: ["तौलिया", "towel"],
  थ: ["थकान", "tiredness"], था: ["थाली", "plate"], थै: ["थैला", "bag"], थो: ["थोड़ा", "a little"],
  द: ["दरवाज़ा", "door"], दा: ["दादी", "grandmother"], दि: ["दिन", "day"], दी: ["दीपक", "lamp"], दु: ["दुकान", "shop"], दू: ["दूध", "milk"], दे: ["देश", "country"], दो: ["दोस्त", "friend"], दौ: ["दौड़", "run"],
  ध: ["धनुष", "bow"], धा: ["धागा", "thread"], धू: ["धूप", "sunshine"], धो: ["धोबी", "washerman"],
  न: ["नल", "tap"], ना: ["नाव", "boat"], नि: ["निशान", "mark"], नी: ["नीला", "blue"], ने: ["नेता", "leader"], नो: ["नोट", "note"], नौ: ["नौ", "nine"],
  प: ["पतंग", "kite"], पा: ["पानी", "water"], पि: ["पिता", "father"], पी: ["पीला", "yellow"], पु: ["पुल", "bridge"], पू: ["पूरी", "puri (fried bread)"], पे: ["पेड़", "tree"], पै: ["पैर", "foot"], पौ: ["पौधा", "plant"],
  फ: ["फल", "fruit"], फा: ["फावड़ा", "shovel"], फि: ["फिल्म", "film"], फू: ["फूल", "flower"], फो: ["फोन", "phone"],
  ब: ["बकरी", "goat"], बा: ["बादल", "cloud"], बि: ["बिल्ली", "cat"], बी: ["बीज", "seed"], बु: ["बुलबुल", "bulbul (songbird)"], बू: ["बूँद", "drop"], बे: ["बेटा", "son"], बै: ["बैल", "ox"], बो: ["बोतल", "bottle"],
  भा: ["भालू", "bear"], भी: ["भीड़", "crowd"], भू: ["भूख", "hunger"], भे: ["भेड़", "sheep"], भै: ["भैंस", "buffalo"], भो: ["भोजन", "meal"],
  म: ["मकान", "building"], मा: ["माँ", "mother"], मि: ["मिठाई", "sweets"], मी: ["मीठा", "sweet"], मु: ["मुर्गा", "rooster"], मू: ["मूली", "radish"], मे: ["मेज़", "table"], मो: ["मोर", "peacock"], मौ: ["मौसम", "weather"],
  या: ["यात्रा", "journey"], यु: ["युद्ध", "war"], यो: ["योग", "yoga"],
  र: ["रस्सी", "rope"], रा: ["राजा", "king"], रि: ["रिबन", "ribbon"], रु: ["रुपया", "rupee"], रू: ["रूई", "cotton"], रे: ["रेल", "train"], रो: ["रोटी", "flatbread"],
  ल: ["लकड़ी", "wood"], ला: ["लाल", "red"], लू: ["लू", "hot wind"], लो: ["लोहा", "iron"],
  व: ["वन", "forest"], वी: ["वीणा", "veena (instrument)"],
  श: ["शहद", "honey"], शा: ["शाम", "evening"], शि: ["शिक्षक", "teacher"], शी: ["शीशा", "mirror"], शे: ["शेर", "lion"], शौ: ["शौक", "hobby"],
  स: ["सब्ज़ी", "vegetable"], सा: ["साबुन", "soap"], सि: ["सिक्का", "coin"], सी: ["सीढ़ी", "ladder"], सु: ["सुबह", "morning"], सू: ["सूरज", "sun"], से: ["सेब", "apple"], सै: ["सैनिक", "soldier"], सो: ["सोना", "gold"], सौ: ["सौ", "hundred"],
  ह: ["हल", "plough"], हा: ["हाथी", "elephant"], हि: ["हिरण", "deer"], हो: ["होली", "Holi"],
};
const HINDI_HEADS = VOWELS_HI.map((vowel, i) => [vowel, VOWELS_EN[i]]);
const ENGLISH_HEADS = VOWELS_EN.map((vowel) => [vowel, ""]);

const VIEW_LABELS = { both: "Hindi + English", hindi: "Hindi only", english: "English only" };
const NEXT_VIEW = { both: "hindi", hindi: "english", english: "both" };

/* ---------- component ---------- */
export default function Barakhadi() {
  const [tab, setTab] = useState("hindi");
  const [sel, setSel] = useState(null); // { main, sub, lang }
  const [filter, setFilter] = useState("");
  const [speechStatus, setSpeechStatus] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [view, setView] = useState("both"); // "both" | "hindi" | "english"
  const [autoSound, setAutoSound] = useState(true); // play sound when a cell is tapped
  const speechRun = useRef(0);

  const hindi = tab === "hindi";
  const rows = useMemo(() => {
    const allRows = hindi ? HINDI_ROWS : ENGLISH_ROWS;
    const query = filter.trim().toLocaleLowerCase();
    return query
      ? allRows.filter((row) => `${row.label} ${row.sub}`.toLocaleLowerCase().includes(query))
      : allRows;
  }, [filter, hindi]);
  const heads = hindi ? HINDI_HEADS : ENGLISH_HEADS;

  const cycleView = () => setView((v) => NEXT_VIEW[v]);

  // Renders a main/sub pair according to the current view (Hindi tab only)
  const pair = (main, sub, mainCls, subCls) => {
    if (!hindi || view === "both") {
      return (
        <>
          <span className={mainCls}>{main}</span>
          {sub && <span className={subCls}>{sub}</span>}
        </>
      );
    }
    if (view === "hindi") return <span className={mainCls}>{main}</span>;
    return <span className={mainCls}>{sub}</span>; // English only
  };

  const switchTab = (next) => {
    stopSpeech();
    setTab(next);
    setSel(null);
    setView("both");
  };

  const stopSpeech = () => {
    speechRun.current += 1;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSpeechStatus("Audio stopped.");
  };

  useEffect(() => () => {
    speechRun.current += 1;
    window.speechSynthesis?.cancel();
  }, []);

  const speak = (text, lang) => new Promise((resolve, reject) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      reject(new Error("Speech playback is not supported in this browser."));
      return;
    }
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.onend = resolve;
      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") resolve();
        else reject(new Error(`Speech playback failed${event.error ? `: ${event.error}` : "."}`));
      };
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });

  const toggleAutoSound = () => {
    if (autoSound) {
      speechRun.current += 1;
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      setSpeechStatus("Auto sound is off.");
    } else {
      setSpeechStatus("Auto sound is on.");
    }
    setAutoSound((v) => !v);
  };

  // force = true plays even when auto sound is off (only the "Hear selected sound" button)
  const playWord = async (word) => {
    const run = ++speechRun.current;
    window.speechSynthesis?.cancel();
    setSpeaking(true);
    setSpeechStatus(`Playing ${word}…`);
    try {
      await speak(word, "hi-IN");
      if (speechRun.current === run) setSpeechStatus("Audio finished.");
    } catch (error) {
      if (speechRun.current === run) setSpeechStatus(error.message || "Could not play audio.");
    } finally {
      if (speechRun.current === run) setSpeaking(false);
    }
  };

  const playCell = async (cell, force = false) => {
    if (!autoSound && !force) {
      speechRun.current += 1;
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      setSpeechStatus("Auto sound is off. Press “Hear selected sound” to listen.");
      setSel(cell);
      return;
    }
    const run = ++speechRun.current;
    window.speechSynthesis?.cancel();
    setSel(cell);
    setSpeaking(true);
    setSpeechStatus(`Playing ${cell.main}…`);
    try {
      await speak(cell.main, cell.lang);
      if (speechRun.current === run) setSpeechStatus("Audio finished.");
    } catch (error) {
      if (speechRun.current === run) setSpeechStatus(error.message || "Could not play audio.");
    } finally {
      if (speechRun.current === run) setSpeaking(false);
    }
  };

  const playRow = async (row) => {
    const run = ++speechRun.current;
    window.speechSynthesis?.cancel();
    setSpeaking(true);
    setSpeechStatus(`Practising the ${row.label} row…`);
    try {
      for (const cell of row.cells) {
        if (speechRun.current !== run) return;
        setSel(cell);
        await speak(cell.main, cell.lang);
      }
      if (speechRun.current === run) setSpeechStatus(`Finished the ${row.label} row.`);
    } catch (error) {
      if (speechRun.current === run) setSpeechStatus(error.message || "Could not play audio.");
    } finally {
      if (speechRun.current === run) setSpeaking(false);
    }
  };

  const practiseRandom = () => {
    if (!rows.length) return;
    const row = rows[Math.floor(Math.random() * rows.length)];
    playCell(row.cells[Math.floor(Math.random() * row.cells.length)]); // respects Auto sound
  };

  return (
    <div className="bk">
      <style>{CSS}</style>
      <main>
        <h1>Barakhadi · बारहखड़ी</h1>
        <p className="sub">Each letter joined with the 12 vowel forms. Tap any cell to hear it.</p>

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={hindi} onClick={() => switchTab("hindi")}>
            Hindi · क से ज्ञ
          </button>
          <button role="tab" aria-selected={!hindi} onClick={() => switchTab("english")}>
            English · A to Z
          </button>
        </div>

        <div className="show" aria-live="polite">
          {sel ? (
            <>
              {pair(sel.main, sel.sub, "showbig", "showsub")}
              {hindi && WORDS[sel.main] && (
                <div className="word">
                  {view !== "english" && <span className="wordhi">{WORDS[sel.main][0]}</span>}
                  {view !== "hindi" && <span className="worden">{WORDS[sel.main][1]}</span>}
                  <button type="button" className="replay" onClick={() => playWord(WORDS[sel.main][0])}>Hear word</button>
                </div>
              )}
              <button type="button" className="replay" onClick={() => playCell(sel, true)}>Hear selected sound</button>
            </>
          ) : (
            <span className="showsub">Tap a cell</span>
          )}
        </div>

        <div className="tools">
          <label className="search-label">
            <span>Find a {hindi ? "Hindi letter" : "English letter"}</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder={hindi ? "Try क or kh" : "Try B"} />
          </label>
          <button type="button" className="tool-button" onClick={practiseRandom} disabled={!rows.length}>Random practice</button>
          <button type="button" className={autoSound ? "tool-button on" : "tool-button"} onClick={toggleAutoSound} aria-pressed={autoSound}>
            Auto sound: {autoSound ? "On" : "Off"}
          </button>
          {hindi && (
            <button type="button" className="tool-button" onClick={cycleView}>
              Show: {VIEW_LABELS[view]}
            </button>
          )}
          {speaking && <button type="button" className="tool-button" onClick={stopSpeech}>Stop audio</button>}
        </div>
        {speechStatus && <p className="speech-status" role="status" aria-live="polite">{speechStatus}</p>}

        <div className="wrap">
          <table>
            <thead>
              <tr>
                <th className="corner">{hindi ? "व्यंजन" : "Letter"}</th>
                {heads.map(([a, b], i) => (
                  <th key={i}>{pair(a, b, "hm", "hs")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="rowhead">
                    {pair(r.label, r.sub, "hm", "hs")}
                    <button type="button" className="row-play" onClick={() => playRow(r)} aria-label={`Hear all sounds in the ${r.label} row`}>Hear row</button>
                  </th>
                  {r.cells.map((c, i) => (
                    <td key={i}>
                      <button
                        type="button"
                        aria-pressed={!!sel && sel.main === c.main}
                        className={sel && sel.main === c.main ? "cell on" : "cell"}
                        onClick={() => playCell(c)}
                      >
                        {pair(c.main, c.sub, "cm", "cs")}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="note">
          {hindi
            ? "Capital letters (T, D, N, Sh) mark the harder, tongue-curled sounds."
            : "These are sound-practice syllables, not always real English words. The vowels A, E, I, O, U are the sounds themselves, so only consonants get rows."}
          {" "}Pronunciation playback depends on the voices installed in your browser or device.
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
.bk .replay,.bk .tool-button,.bk .row-play{border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font:inherit;padding:5px 9px;cursor:pointer}
.bk .replay{align-self:center;margin-top:8px}
.bk .word{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 12px;margin-top:6px}
.bk .wordhi{font-size:1.5rem;font-weight:700}
.bk .worden{color:var(--mute);font-size:1.1rem}
.bk .word .replay{margin-top:0}
.bk .tools{display:flex;flex-wrap:wrap;align-items:end;gap:10px;margin-bottom:8px}
.bk .search-label{display:grid;gap:4px;min-width:min(100%,240px);margin:0;color:var(--mute);font-size:.82rem}
.bk .search-label input{min-height:40px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:inherit;padding:6px 10px}
.bk .tool-button{min-height:40px}
.bk .tool-button.on{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.bk .tool-button:disabled{opacity:.5;cursor:not-allowed}
.bk .speech-status{min-height:1.4em;margin:4px 0 8px;color:var(--mute);font-size:.9rem}
.bk .wrap{overflow:auto;max-height:70vh;border:2px solid var(--line);border-radius:14px;background:var(--card)}
.bk table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%}
.bk th,.bk td{border-bottom:1px solid var(--line);border-right:1px solid var(--line);padding:0;text-align:center}
.bk thead th{position:sticky;top:0;z-index:2;background:var(--head);padding:6px 4px;min-width:68px}
.bk .corner{left:0;z-index:3;min-width:76px}
.bk .rowhead{position:sticky;left:0;z-index:1;background:var(--head);padding:6px 8px;min-width:76px}
.bk .row-play{margin-top:5px;padding:3px 6px;font-size:.68rem}
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