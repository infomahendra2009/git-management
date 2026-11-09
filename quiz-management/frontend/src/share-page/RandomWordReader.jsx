import { useState, useRef, useEffect } from "react";

// 2,000 common English words; "-" marks syllable chunks.
const DATA = ["the","and","for","that","you","with","this","was","are","have","not","but","from","your","all","his","they","one","can","will","just","like","about","out","what","has","when","more","were","who","had","their","there","her","which","time","get","been","would","she","new","peo-ple","how","some","al-so","them","now","oth-er","its","our","than","good","on-ly","af-ter","first","him","in-to","know","see","two","make","over","think","any","then","could","back","these","want","be-cause","well","said","way","most","much","very","where","even","should","may","here","need","re-al-ly","did","right","work","year","years","be-ing","day","too","go-ing","be-fore","off","why","made","still","take","got","many","nev-er","those","life","say","world","down","great","through","last","while","best","such","love","man","home","long","look","some-thing","use","same","used","both","ev-ery","come","part","state","three","around","be-tween","al-ways","bet-ter","find","help","high","lit-tle","old","since","an-oth-er","does","own","things","un-der","dur-ing","game","thing","give","house","place","school","again","next","each","with-out","against","end","found","must","show","big","feel","sure","team","ev-er","fam-i-ly","keep","might","please","put","mon-ey","free","sec-ond","some-one","away","left","num-ber","city","days","lot","name","night","play","un-til","com-pa-ny","do-ing","few","let","re-al","called","dif-fer-ent","hav-ing","set","thought","done","how-ev-er","get-ting","god","group","look-ing","pub-lic","top","wom-en","busi-ness","care","start","sys-tem","times","week","al-ready","any-thing","case","noth-ing","per-son","to-day","change","enough","full","live","mak-ing","point","read","told","yet","bad","four","hard","mean","once","sup-port","tell","in-clud-ing","mu-sic","pow-er","seen","states","stop","wa-ter","based","be-lieve","call","head","men","na-tion-al","small","took","white","came","far","job","side","though","try","went","yes","ac-tu-al-ly","amer-i-can","lat-er","less","line","or-der","par-ty","run","says","ser-vice","coun-try","open","sea-son","thank","chil-dren","ev-ery-one","gen-er-al","try-ing","unit-ed","us-ing","area","black","fol-low-ing","law","makes","to-geth-er","war","whole","car","face","five","kind","maybe","per","pres-i-dent","sto-ry","work-ing","course","games","health","hope","im-por-tant","least","means","news","with-in","able","book","ear-ly","friends","lo-cal","post","thanks","video","young","ago","oth-ers","so-cial","talk","court","fact","giv-en","guys","half","hand","lev-el","mind","of-ten","sin-gle","be-come","body","com-ing","con-trol","food","guy","hours","of-fice","pay","prob-lem","south","true","al-most","his-to-ry","known","large","lost","re-search","room","sev-er-al","start-ed","tak-ing","win","wrong","along","any-one","else","girl","john","mat-ter","pret-ty","re-mem-ber","air","bit","friend","hit","needs","nice","play-ing","prob-a-bly","say-ing","yeah","york","class","close","comes","idea","looks","past","pos-si-ble","want-ed","cause","due","hap-py","hu-man","mem-bers","months","move","ques-tion","se-ries","wait","wom-an","ask","com-mu-ni-ty","da-ta","late","leave","north","saw","spe-cial","watch","ei-ther","fuck-ing","fu-ture","light","low","mil-lion","morn-ing","po-lice","short","stay","tak-en","age","buy","deal","rather","rea-son","red","re-port","soon","third","turn","whether","among","check","form","fur-ther","heart","min-utes","my-self","ser-vices","your-self","act","al-though","asked","child","fire","fun","liv-ing","ma-jor","me-dia","phone","play-ers","art","be-hind","build-ing","easy","gonna","mar-ket","near","non","plan","po-lit-i-cal","quite","six","talk-ing","west","works","ac-cord-ing","avail-able","ed-u-ca-tion","fi-nal","for-mer","front","kids","list","ready","some-times","son","street","bring","col-lege","cur-rent","ex-am-ple","heard","lon-don","meet","pro-gram","type","ba-by","chance","fa-ther","march","process","song","study","word","across","ac-tion","clear","gave","gets","him-self","month","out-side","self","stu-dents","words","board","cost","cut","field","held","in-stead","main","mo-ment","moth-er","road","seems","think-ing","town","wants","en-er-gy","fight","fine","force","hear","is-sue","played","points","price","rest","re-sults","run-ning","shows","space","sum-mer","term","wife","amer-i-ca","beau-ti-ful","date","goes","land","miss","project","shot","site","strong","ac-count","eyes","in-clude","june","par-ents","pe-ri-od","po-si-tion","record","sim-i-lar","to-tal","above","club","com-mon","died","film","hap-pened","knew","lead","like-ly","mil-i-tary","per-fect","per-son-al","se-cu-ri-ty","share","won","april","cen-ter","coun-ty","cou-ple","eng-lish","hap-pen","hold","in-dus-try","in-side","is-sues","on-line","play-er","pri-vate","prob-lems","re-turn","rights","sense","star","test","view","weeks","break","british","com-pa-nies","event","high-er","hour","mem-ber","mid-dle","need-ed","present","re-sult","sor-ry","takes","train-ing","wish","an-swer","boy","de-sign","fi-nal-ly","girls","gold","gone","guess","in-ter-est","ju-ly","king","learn","pol-i-cy","so-ci-ety","added","alone","av-er-age","bank","brought","cer-tain","church","east","hands","hot","longer","med-i-cal","movie","orig-i-nal","park","press","re-ceived","role","sent","tried","worked","worth","ar-eas","be-came","bill","books","cool","di-rec-tor","ex-act-ly","giv-ing","ground","meet-ing","pro-vide","ques-tions","sep-tem-ber","sound","source","usu-al-ly","val-ue","ev-i-dence","fol-low","lives","of-fi-cial","rate","read-ing","round","save","stand","stuff","tax","what-ev-er","amount","blue","coun-tries","david","drive","eat","fall","fast","fed-er-al","feel-ing","felt","green","league","match","mod-el","pic-ture","size","step","trust","cen-tral","changes","eng-land","for-ward","groups","hey","key","mom","page","paid","range","re-view","sci-ence","trade","up-on","var-i-ous","at-ten-tion","broth-er","can-not","char-ac-ter","chief","cup","foot-ball","hate","james","led","looked","low-er","nat-u-ral","oc-to-ber","prop-er-ty","qual-i-ty","send","style","vote","amaz-ing","au-gust","blood","chi-na","com-plete","dog","eco-nom-ic","in-volved","it-self","lan-guage","lord","no-vem-ber","oil","re-lat-ed","se-ri-ous","stage","terms","ti-tle","add","ar-ti-cle","at-tack","born","de-cid-ed","de-ci-sion","en-joy","en-tire","french","jan-u-ary","met","per-haps","poor","re-lease","sit-u-a-tion","turned","web-site","writ-ten","choice","code","con-tin-ue","coun-cil","cov-er","cur-rent-ly","door","elec-tion","eu-ro-pean","events","fi-nan-cial","for-eign","hair","in-crease","le-gal","lose","michael","pick","race","seem","sev-en","sign","sim-ple","sim-ply","staff","su-per","union","walk","bed","be-gan","built","ca-reer","changed","crazy","dai-ly","daugh-ter","de-cem-ber","die","dif-fi-cult","fig-ure","hos-pi-tal","knows","loss","mod-ern","ones","pa-per","parts","pop-u-lar","pub-lished","safe","start-ing","sys-tems","ver-sion","voice","whose","writ-ing","army","aus-tralia","earth","for-get","goal","huge","in-ter-net","lis-ten","okay","prac-tice","rules","sea","sir","suc-cess","to-wards","wait-ing","ways","ac-cess","base","be-low","cre-at-ed","deep","fol-lowed","lol","mark","miss-ing","of-fer","pass","re-leased","risk","schools","sleep","ta-ble","ten","truth","ball","box","build","card","cas-es","dark","dis-trict","eu-rope","george","in-dia","mine","min-is-ter","note","per-cent","piece","prod-ucts","re-cent","see-ing","straight","vis-it","wall","wan-na","wrote","al-lowed","boys","cul-ture","etc","fans","feb-ru-ary","gives","growth","in-clud-ed","mar-ried","of-fi-cer","pain","paul","places","re-spect","re-sponse","riv-er","rock","shall","speak","spe-cif-ic","stan-dard","tonight","write","al-bum","cen-tu-ry","charge","cold","cre-ate","ef-fect","eight","ex-cept","eye","fun-ny","lim-it-ed","mov-ing","net-work","peace","pro-vid-ed","re-cent-ly","re-quired","sales","spent","store","stu-dent","to-mor-row","track","via","watch-ing","weight","ad-di-tion","ahead","al-low","an-ti","beat","brown","cap-i-tal","chi-nese","com-mit-tee","dou-ble","ex-pect","gas","is-land","moved","nor-mal","plans","po-ten-tial","pres-sure","ra-dio","rus-sian","sta-tion","text","treat-ment","west-ern","be-gin-ning","cam-paign","cer-tain-ly","con-tent","cred-it","cross","de-scribed","de-spite","fe-male","fo-cus","hus-band","ice","join","kept","lead-ing","loved","mes-sage","miles","near-ly","pre-vi-ous","quick-ly","re-gion","re-port-ed","sec-tion","sort","speed","trav-el","con-sid-er","con-tact","drop","fair","feet","je-sus","kid","link","pos-i-tive","sale","tour","wel-come","be-yond","ear-li-er","ex-tra","forces","jobs","leav-ing","minute","na-ture","num-bers","quick","sell","stud-ies","un-less","win-ning","agree","cana-da","clean","com-put-er","episode","fa-vorite","in-come","jus-tice","lev-els","man-ag-er","move-ment","pho-to","post-ed","safe-ty","san","scene","sold","sounds","spend","state-ment","sun","teams","abil-i-ty","an-nounced","ask-ing","call-ing","coach","con-tin-ued","costs","de-signed","ex-pect-ed","fri-day","hap-pens","heavy","in-cludes","knowl-edge","search","sub-ject","train","wide","wow","au-thor","cen-tre","claim","dad","de-vel-oped","fear","fit","gen-er-al-ly","ger-man","glob-al","goals","got-ta","ho-tel","judge","la-dy","lead-er","let-ter","lines","ma-te-ri-al","named","no-body","plus","pre","prod-uct","reg-u-lar","sec-re-tary","sis-ter","sto-ries","unit","work-ers","an-nu-al","any-more","bar","bat-tle","brain","con-tract","de-gree","fam-i-lies","fea-tures","fin-ished","floor","france","grow-ing","hurt","im-age","in-sur-ance","ma-jor-i-ty","meant","open-ing","opin-ion","phys-i-cal","pro","reach","rule","se-ri-ous-ly","sports","stupid","ac-tive","ap-proach","big-gest","can-cer","civ-il","dance","de-fense","di-rec-tion","mas-ter","none","rea-sons","rus-sia","ship","stock","trump","week-end","won-der","worst","africa","awe-some","band","beach","cash","clear-ly","com-pared","ef-fort","end-ed","fan","fight-ing","imag-ine","im-pact","lack","lat-est","learn-ing","mul-ti-ple","old-er","op-er-a-tion","passed","pic-tures","pro-tect","se-cret","se-nior","spring","sun-day","telling","wear","ad-dress","anal-y-sis","any-way","bought","calls","choose","christ-mas","col-or","de-tails","di-rect","dream","eas-i-ly","fin-ish","grand","in-creased","in-di-an","lit-er-al-ly","luck","mar-riage","names","nec-es-sary","pa-tients","re-sources","rich","skin","speak-ing","sup-posed","sweet","thus","touch","yes-ter-day","caught","closed","con-gress","dam-age","di-rect-ly","dis-ease","doc-tor","doubt","drink","driv-ing","face-book","feels","fish","ger-many","glad","greater","grow","largest","ma-chine","no-tice","over-all","plan-ning","pro-fes-sor","pro-grams","records","re-ports","shown","sit","trip","ba-sic","cap-tain","car-ry","cars","crime","ef-fec-tive","ef-fects","ex-plain","ful-ly","high-ly","hold-ing","japan","laws","male","mrs","par-ties","plant","re-al-i-ty","smith","spot","texas","win-ter","worse","ad-vice","agree-ment","award","block","bro-ken","caused","chal-lenge","chris-tian","com-ment","equip-ment","helped","holy","lived","lots","na-tion","oth-er-wise","pe-ter","prices","pri-ma-ry","pur-pose","rates","shop","show-ing","sick","teach-er","the-o-ry","us-es","william","agen-cy","avoid","cam-era","catch","cell","coast","com-ments","econ-o-my","ex-ec-u-tive","foot","hall","mass","mean-ing","mis-sion","nine","of-fi-cers","pol-i-tics","pop","pro-duced","ran","sat-ur-day","sta-tus","there-fore","tri-al","tru-ly","weath-er","ac-tiv-i-ty","app","claims","cof-fee","com-plex","con-di-tion","di-vi-sion","evening","flight","free-dom","google","heat","high-est","in-ter-view","li-brary","lo-cat-ed","lo-ca-tion","oba-ma","of-fered","putting","queen","sec-onds","showed","sit-ting","stand-ing","stars","walk-ing","ac-cept","ac-tu-al","ap-pear","at-tempt","broke","chan-nel","dis-tance","eat-ing","ex-change","fat","fell","find-ing","glass","learned","los-ing","mo-bile","north-ern","opened","placed","pow-er-ful","pri-or","reached","re-ceive","re-li-gious","ride","robert","roy-al","screen","serve","signed","slow","species","speech","traf-fic","tree","types","wear-ing","whom","won-der-ful","agreed","air-port","an-i-mals","ap-pears","be-gin","ben-e-fits","bot-tom","cities","de-mand","en-gine","ev-ery-body","fa-mous","ideas","keep-ing","lie","notes","part-ner","plays","raised","runs","sad","so-lu-tion","songs","sources","south-ern","square","stopped","struc-ture","thomas","twice","wind","wor-ry","amer-i-cans","ap-peared","be-comes","brand","bus","cent","chica-go","count","cov-ered","crit-i-cal","dig-i-tal","forced","fourth","fresh","lake","men-tal","men-tioned","missed","most-ly","mouth","own-er","pho-tos","re-al-ize","re-main","scale","score","sep-a-rate","smart","starts","sur-face","throw","tom","to-tal-ly","twit-ter","views","wed-ding","act-ing","ac-tions","african","arms","ben-e-fit","bud-get","click","es-tate","failed","faith","fash-ion","fea-ture","fund","hear-ing","hill","jack","larg-er","louis","met-al","mid","paris","pro-file","pull","push","re-turned","rose","seat","seemed","tar-get","vil-lage","agent","an-i-mal","ap-ply","au-thor-i-ty","ba-sis","be-com-ing","chris","draw","dude","em-ploy-ees","en-ter","fol-lows","gain","http","ja-pa-nese","lead-ers","mem-o-ry","prime","projects","ring","rise","sell-ing","served","sil-ver","soul","spread","sup-ply","waste","weird","adult","artist","chair-man","edi-tion","grade","hap-pen-ing","healthy","in-sti-tute","method","mike","mon-day","na-tions","ob-vi-ous-ly","op-tion","prison","pro-vides","re-mains","sen-ate","small-er","some-body","stone","strength","users","wild","win-dow","win-ner","ar-rived","bag","bet","camp","cast","christ","con-tin-ues","cor-rect","dan-ger-ous","ex-treme-ly","firm","great-est","han-dle","im-prove","in-deed","leaves","movies","neg-a-tive","pre-vent","re-moved","richard","spir-it","till","trou-ble","usa","videos","ad-van-tage","apart","aware","cat","cus-tomers","de-cide","din-ner","dol-lars","east-ern","fifth","func-tion","gift","help-ing","her-self","in-flu-ence","items","joe","los","mar-ket-ing","mary","ma-te-ri-als","nor","pro-duce","progress","proud","re-quire","shoot-ing","shut","stan-dards","tells","thinks","van","wood","birth","bridge","car-ried","charles","class-es","com-plet-ed","con-cept","copy","dear","dogs","ef-forts","gar-den","host","hous-ing","inc","is-rael","jour-nal","la-bor","length","lucky","nei-ther","on-to","pa-tient","pos-si-bly","prove","rare","set-ting","skills","soft-ware","thou-sands","tough","units","alive","ap-ple","bal-ance","birth-day","boss","cards","chang-ing","dress","eas-i-er","fel-low","flor-i-da","horse","know-ing","liked","mag-ic","man-aged","map","net","owned","re-quest","stick","turns","ve-hi-cle","vol-ume","wake","aid","beau-ty","be-lieved","bil-lion","busy","buy-ing","cells","con-cerned","cor-ner","crim-i-nal","cul-tur-al","de-vel-op","driv-er","ends","ex-ist-ing","farm","file","fix","fly","frank","guide","im-ages","mex-i-co","op-er-at-ing","pay-ing","pre-sent-ed","raise","roll","slight-ly","sug-gest","sur-prise","tech-ni-cal","thoughts","treat","unique","va-ri-ety","vi-o-lence","weapons","yours","youth","big-ger","break-ing","dont","dry","edge","evil","ex-cit-ed","for-ev-er","funds","helps","hen-ry","in-jury","iron","love-ly","mad","mag-a-zine","mar-tin","mod-els","of-fers","or-dered","pre-pared","ref-er-ence","re-li-gion","sites","some-where","stat-ed","strat-e-gy","teach-ers","web","wine","ac-counts","an-ge-les","arm","au-di-ence","bay","blog","clos-er","core","dropped","ex-cel-lent","ex-ist","fig-ures","forms","guard","hon-est","is-sued","joined","jones","lee","lies","likes","medicine","men-tion","moun-tain","nu-cle-ar","or-ders","port","pres-ence","re-ac-tion","re-duce","shoot","sides","sol-id","span-ish","sport","steps","stress","taste","tea","vic-to-ry","af-ter-noon","as-sis-tant","britain","cit-i-zens","clas-sic","clothes","de-ci-sions","elec-tric","emer-gen-cy","en-tered","en-tire-ly","facts","fail-ure","fes-ti-val","flat","fu-el","har-ry","hel-lo","hous-es","ill","ini-tial","john-son","kick","links","mail","mas-sive","mat-ters","pair","picked","pieces","plane","plen-ty","prince","prop-er","pro-vid-ing","quar-ter","re-gion-al","scott","ses-sion","shape","sky","teach-ing","to-ward","trans-fer","up-per","use-ful","val-ley","watched","will-ing","win-dows","zone","ac-ci-dent","ad-vanced","any-where","ar-ti-cles","awards","bear","boat","bring-ing","ca-pac-i-ty","cheap","cli-mate","drink-ing","du-ty","fan-tas-tic","feel-ings","fly-ing","gov-er-nor","hun-dred","joint","mix","mu-se-um","op-tions","path","plants","poli-cies","prom-ise","pro-posed","pur-chase","rain","re-move","signs","spend-ing","steel","steve","ter-ri-ble","tired","treat-ed","turn-ing","vice","warm","afraid","arts","beer","bor-der","cana-di-an","com-mand","crew","crowd","dat-ing","el-e-ments","en-e-my","en-sure","filled","fixed","for-est","in-tend-ed","labour","lim-it","moon","ocean","pow-ers","prof-it","proof","sol-diers","suit","wins","asian","at-tor-ney","banks","be-hav-ior","ben","bod-ies","broth-ers","build-ings","chair","cre-at-ing","debt","do-mes-tic","ex-pen-sive","grew","homes","hon-est-ly","hon-or","jump","launch","list-ed","min-i-mum","na-tive","not-ed","planned","ray","sets","sud-den-ly","supreme","sur-vey","tech","trees","up-date","us-er","writ-er","yel-low","younger","an-cient","at-tacks","charges","com-bined","con-nect-ed","con-tains","down-load","email","end-ing","ex-er-cise","ex-press","flow","formed","hero","il-le-gal","joke","loan","meth-ods","of-fi-cials","per-formed","plan-et","scot-land","se-lect-ed","shared","shop-ping","soft","stuck","sug-ar","sug-gest-ed","sup-port-ed","sur-prised","taught","trans-port","ac-cept-ed","adding","af-fairs","al-lows","ap-peal","ap-plied","artists","bos-ton","con-firmed","de-vice","dra-ma","en-try","era","fac-tor","feed","gold-en","grant","grown","heads","hop-ing","keeps","lawyer","legs","ly-ing","mea-sures","mis-take","mus-lim","plat-form","pool","pulled","re-gard-ing","re-la-tions","re-quires","route","saved","sched-ule","shoes","smoke","squad","teach","test-ing","tests","val-ues","walked","williams","abuse","an-gry","can-di-date","con-cern","dis-cuss","elec-tions","emo-tion-al","fall-ing","fox","guns","hole","hol-i-day","in-ter-ests","in-ter-nal","ire-land","ital-ian","italy","jer-sey","laugh","leg","let-ters","lib-er-al","lis-ten-ing","loves","lunch","max","milk","pack","pay-ment","per-form","record-ed","sec-tor","shar-ing","snow","storm","streets","strike","stu-dio","sub","weak","youtube","ac-tor","ad-vance","apart-ment","asia","chain","chap-ter","com-mit-ted","cook","cute","equal","fake","fi-nance","fo-cused","hits"];

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

export default function RandomWordReader() {
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