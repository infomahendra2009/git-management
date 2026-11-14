import { useState, useRef, useEffect } from "react";

 
// Workbook entries use [Hindi word, English meanings, usage rating] tuples.
const spreadsheetWords = [
  ["होने के लिए","to be",1],
  ["तथा","and",1],
  ["सेवा मेरे","to",1],
  ["का","of",1],
  ["ए","a",1],
  ["मैं","I",1],
  ["में","in / into",1],
  ["रखने के लिए","to have",1],
  ["उस","that",1],
  ["वह","he / she",1],
  ["नहीं","not / no",1],
  ["उसके","his / her",1],
  ["यह","it",1],
  ["आप","you",1],
  ["साथ में","with / together / along",1],
  ["के लिये","for",1],
  ["करने के लिए","to do / to shall / to commit",1],
  ["जैसा","as",1],
  ["पर","on / at / onto",1],
  ["कहना","to say",1],
  ["उसे","him",1],
  ["से","from / than",1],
  ["परंतु","but",1],
  ["मुझे","me",1],
  ["मेरे","my",1],
  ["जाना","to go",1],
  ["वे","they",1],
  ["सब","all",1],
  ["द्वारा","by",1],
  ["इस","this",1],
  ["एक","one / an / single",1],
  ["बाहर","out / outside",1],
  ["ऊपर","up / over / above / upstairs",1],
  ["जानना","to know",1],
  ["इसलिए","so",1],
  ["देखना","to see",1],
  ["सकता है","could",1],
  ["या","or / whether",1],
  ["उन्हें","them",1],
  ["लेना","to get / to take",1],
  ["हम","we / ourselves",1],
  ["पसंद","like / choice",1],
  ["आना","to come",1],
  ["आदमी","man",1],
  ["क्या","what",1],
  ["बनाना","to make / to create",1],
  ["क्या आप वहां मौजूद हैं","there",1],
  ["के बारे में","about",1],
  ["कौन कौन से","which",1],
  ["जो अपने","their",1],
  ["सोचना","to think",1],
  ["देखने के लिए","to look / to watch",1],
  ["अगर","if",1],
  ["कौन","who",1],
  ["कब","when",1],
  ["पहर","time",1],
  ["वापस","back",1],
  ["कर सकते हैं","to can",1],
  ["चाहना","to will",1],
  ["तुंहारे","your",1],
  ["अधिक","more",1],
  ["फिर","then / again",1],
  ["नीचे","down / beneath / below",1],
  ["अच्छा","good / nice / okay / rare",1],
  ["बताने के लिए","to tell",1],
  ["अभी व","now",1],
  ["हाथ","hand",1],
  ["कुछ","some / few / certain",1],
  ["चाहने के लिए","to want",1],
  ["केवल","just / only / simply / merely",1],
  ["मार्ग","way / passage",1],
  ["देना","to give",1],
  ["अन्य","other / else",1],
  ["दिन","day",1],
  ["आंख","eye",1],
  ["से पहले","before",1],
  ["पूछना","to ask",1],
  ["ढूँढ़ने के लिए","to find",1],
  ["दो","two",1],
  ["थोड़ा","little / slightly / slight",1],
  ["लंबा","long / tall",1],
  ["बहुत","very / too / much / lot",1],
  ["महसूस करना","to feel",1],
  ["कोई भी","any",1],
  ["चीज़","thing",1],
  ["यहाँ","here",1],
  ["कभी नहीँ","never",1],
  ["चले जाना","to leave",1],
  ["व्यक्ति","person / individual",1],
  ["पुराना","old",1],
  ["सिर","head",1],
  ["मुड़ना","to turn",1],
  ["के माध्यम से","through",1],
  ["यहाँ तक की","even",1],
  ["चेहरा","face",1],
  ["बंद","off",1],
  ["हमें","us",1],
  ["प्रथम","first",1],
  ["सही","right / correct",1],
  ["हमारी","our",1],
  ["किस तरह","how",1],
  ["कहा पे","where",1],
  ["बाद","after",1],
  ["आईटी इस","its",1],
  ["महिला","woman / lady / female",1],
  ["दूर","away / far / distant",1],
  ["जिंदगी","life",1],
  ["प्रतीत होना","to seem",1],
  ["बुलाना","to call",1],
  ["फिर भी","still",1],
  ["सुनने के लिए","to hear",1],
  ["साल","year",1],
  ["अपना","own",1],
  ["काम करने के लिए","to work",1],
  ["चाहिए","should",1],
  ["जगह","place",1],
  ["कक्ष","room / chamber",1],
  ["कुंआ","well",1],
  ["सहन करना","to stand",1],
  ["के लिए ज़रूर","to must",1],
  ["स्वयं","himself / herself / yourself",1],
  ["चारों ओर","around",1],
  ["द्वार","door / gate / doorway",1],
  ["हो सकना","to might",1],
  ["कुछ कुछ","something",1],
  ["कोशिश करना","to try",1],
  ["प्यार करना","to love",1],
  ["मकान","house",1],
  ["रात","night",1],
  ["रखना","to put / to keep",1],
  ["महान","great / noble",1],
  ["ऐसा","such",1],
  ["बैठना","to sit",1],
  ["अंतिम","last / final",1],
  ["शुरू करने के लिए","to begin",1],
  ["इसलिये","because / therefore",1],
  ["उन","those",1],
  ["इन","these",1],
  ["शब्द","word",1],
  ["उपयोग करने के लिए","to use",1],
  ["जरूरत को","to need",1],
  ["खोलना","to open",1],
  ["रोके रखना","to hold",1],
  ["एक और","another",1],
  ["जबकि","while",1],
  ["अधिकांश","most",1],
  ["बात करने के लिए","to talk",1],
  ["किराए पर देना","to let",1],
  ["के ऊपर","upon",1],
  ["के बिना","without",1],
  ["होम","home",1],
  ["मुस्कुराना","to smile",1],
  ["हमेशा","always",1],
  ["आवाज़","voice",1],
  ["बच्चा","child / baby / kid",1],
  ["पिता","father / dad",1],
  ["पैदल चलना","to walk",1],
  ["युवा","young",1],
  ["का मतलब","to mean",1],
  ["कुछ भी तो नहीं","nothing",1],
  ["चलाने के लिए","to run",1],
  ["हालांकि","though / although",1],
  ["पल","moment",1],
  ["विरुद्ध","against",1],
  ["मां","mother",1],
  ["वही","same",1],
  ["नाम","name",1],
  ["बोलना","to speak",1],
  ["अनेक","many",1],
  ["मन","mind",1],
  ["लाने के लिए","to bring",1],
  ["रोशनी","light",1],
  ["बंद करना","to close / to shut / to lock",1],
  ["पक्ष","side / favor",1],
  ["कभी","ever",1],
  ["हिलाने के लिए","to move",1],
  ["मई में","to may",1],
  ["मित्र","friend",1],
  ["हर एक","every",1],
  ["बांह","arm",1],
  ["तीन","three",1],
  ["एक बार","once",1],
  ["पर्याप्त","enough",1],
  ["बनने के लिए","to become",1],
  ["लड़की","girl",1],
  ["के अंतर्गत","under",1],
  ["नया","new",1],
  ["समाप्त","end",1],
  ["जीने के लिए","to live",1],
  ["भी","also / either",1],
  ["मदद करने","to help",1],
  ["के बीच","between",1],
  ["विश्व","world",1],
  ["गिरना","to fall",1],
  ["शुरू करना","to start / to startle",1],
  ["से प्रत्येक","each",1],
  ["प्रतीक्षा करने के लिए","to wait",1],
  ["रोकने के लिए","to stop / to pause / to prevent",1],
  ["कुछ भी","anything",1],
  ["दोनों","both",1],
  ["पैर","foot",1],
  ["अंश","part",1],
  ["छोटा","small",1],
  ["जब तक","until / till / unless",1],
  ["वास्तव में","really / indeed / actually",1],
  ["जवाब देने के लिए","to answer",1],
  ["दिखाना","to show",1],
  ["लड़का","boy",1],
  ["झूठ","to lie",1],
  ["ज़रूर","sure",1],
  ["कोर्स","course",1],
  ["होना","to happen",1],
  ["विश्वास करने के लिए","to believe",1],
  ["लौटने के लिये","to return",1],
  ["पीछे","behind / rear",1],
  ["बिंदु","point",1],
  ["आगामी","next",1],
  ["अभी तक","yet",1],
  ["दिल","heart",1],
  ["पानी","water",1],
  ["लगभग","almost / nearly",1],
  ["स्थापित करना","to set / to establish",1],
  ["तन","body",1],
  ["क्यूं कर","why",1],
  ["पारित करने के लिए","to pass",1],
  ["सुबह","morning",1],
  ["घंटा","hour",1],
  ["ध्वनि","sound",1],
  ["मीलऩा","to meet",1],
  ["परमेश्वर","God",1],
  ["सफेद","white",1],
  ["याद करने के लिए","to remember",1],
  ["मेहरबान","kind",1],
  ["आशा करना","to hope",1],
  ["पहुचना","to reach",1],
  ["मरना","to die",1],
  ["कठिन","hard / difficult",1],
  ["खराब","bad",1],
  ["आधा","half",1],
  ["हंसना","to laugh / to gleam",1],
  ["परिवार","family",1],
  ["जबसे","since",1],
  ["उच्च","high",1],
  ["किताब","book",1],
  ["मामला","matter / case / affair",1],
  ["कदम","step",1],
  ["बदलने के लिए","to change / to replace",1],
  ["सवाल","question",1],
  ["भर में","across",1],
  ["समझने के लिए","to understand",1],
  ["पीछा करना","to follow / to pursue / to chase",1],
  ["बीवी","wife",1],
  ["खीचना","to pull",1],
  ["तालिका","table",1],
  ["खेलने के लिए","to play",1],
  ["खोने के लिए","to lose",1],
  ["बड़े","big",1],
  ["रोना","to cry",1],
  ["काली","black",1],
  ["बाल","hair",1],
  ["पढ़ने के लिए","to read / to study",1],
  ["सामने","front / opposite",1],
  ["भेजने के लिए","to send",1],
  ["काफी","quite / fairly",1],
  ["तोड़ने के लिए","to break",1],
  ["खुद","myself",1],
  ["पहले से","already",1],
  ["मिनट","minute",1],
  ["अंधेरा","dark / darkness",1],
  ["शीघ्र","soon / quick",1],
  ["बिस्तर","bed / sofa",1],
  ["की ओर","toward / towards",1],
  ["पूरा का पूरा","whole",1],
  ["गाड़ी","car / carriage / wagon",1],
  ["खिड़की","window",1],
  ["हिलाना","to shake",1],
  ["आराम","rest / comfort",1],
  ["पैसे","money",1],
  ["तथ्य","fact",1],
  ["बेटा","son",1],
  ["लिखना","to write",1],
  ["आग","fire",1],
  ["दूसरा","second",1],
  ["रहने के लिए","to stay",1],
  ["विस्मित होना","to wonder",1],
  ["कहानी","story / tale",1],
  ["लाइन","line",1],
  ["बढ़ना","to grow",1],
  ["वायु","air",1],
  ["इच्छा करना","to wish",1],
  ["विचार","thought / idea",1],
  ["वृद्धि करने के लिए","to rise",1],
  ["कम से कम","least",1],
  ["पूर्ण","full / complete",1],
  ["पकड़ना","to catch / to grab",1],
  ["नेतृत्व करना","to lead",1],
  ["विशाल","large / huge / giant",1],
  ["उपस्थित होना","to appear / to attend",1],
  ["सब कुछ","everything",1],
  ["देखभाल करने के लिए","to care",1],
  ["उठाना","to carry / to pick / to lift",1],
  ["मौत","death",1],
  ["सोने के लिए","to sleep / to slap",1],
  ["मारने के लिए","to kill",1],
  ["ज़वाब दोना","to reply",1],
  ["पहनने के लिए","to wear",1],
  ["दीवार","wall",1],
  ["ड्राइव करने के लिए","to drive",1],
  ["पास में","near",1],
  ["आकर्षित करने के लिए","to draw",1],
  ["कंधा","shoulder",1],
  ["सप्ताह","week",1],
  ["अतीत","past",1],
  ["मृत","dead",1],
  ["जल्दी","early",1],
  ["ताकना","to stare",1],
  ["अकेला","alone / lonely",1],
  ["समझ","sense / understanding",1],
  ["मुंह","mouth",1],
  ["बल्कि","rather",1],
  ["सहन करने के लिए","to bear",1],
  ["चार","four",1],
  ["जारी रखने के लिए","to continue",1],
  ["पेड़","tree",1],
  ["भाई","brother",1],
  ["कारण","reason / sake",1],
  ["घोड़ा","horse",1],
  ["अन्य लोग","others",1],
  ["क्रम","order",1],
  ["पंज","five",1],
  ["छूना","to touch",1],
  ["गोल","round",1],
  ["गहरा","deep / deeply",1],
  ["पत्र","letter",1],
  ["कुमारी र","Miss",1],
  ["माना की","to suppose",1],
  ["बल","force",1],
  ["नगर","town",1],
  ["खाने के लिए","to eat",1],
  ["स्पष्ट","clear",1],
  ["विवाह करना","to marry",1],
  ["फ़ेक्ना","to throw",1],
  ["देश","country",1],
  ["वर्तमान","present / current",1],
  ["के भीतर","inside",1],
  ["मंज़िल","floor",1],
  ["भुगतान करने के लिए","to pay",1],
  ["मंजूरी के लिए","to nod",1],
  ["उंगली","finger",1],
  ["बने रहना","to remain",1],
  ["आंसू","tear",1],
  ["सड़क","street / road",1],
  ["कम से","less",1],
  ["डर","fear",1],
  ["कोई व्यक्ति","someone / somebody",1],
  ["व्यापार","business / trade",1],
  ["योग्य","able",1],
  ["कुरसी","chair",1],
  ["भूल जाने के लिए","to forget",1],
  ["अपेक्षा करना","to expect",1],
  ["लाल","red",1],
  ["शक्ति","power / strength / energy",1],
  ["दृष्टि डालना","to glance",1],
  ["शायद","perhaps / probably / maybe",1],
  ["कम","short / low",1],
  ["भूमि","ground / land",1],
  ["सच","1",1],
  ["ओंठ","lip",1],
  ["असली","real",1],
  ["कपडे पहनना","to dress",1],
  ["महीना","month",1],
  ["सुनना","to listen",1],
  ["देर से","late",1],
  ["स्कूल","school",2],
  ["किसको","whom",2],
  ["के बीच में","among",2],
  ["पति","husband",2],
  ["जोड़ने के लिए","to add",2],
  ["विभिन्न","different / various",2],
  ["ड्रॉप करने के लिए","to drop",2],
  ["पीने के लिए","to drink",2],
  ["सीखना","to learn",2],
  ["अचानक से","suddenly",2],
  ["कागज़","paper",2],
  ["तरह","sort",2],
  ["अक्सर","often",2],
  ["शाम","evening",2],
  ["सौ","hundred",2],
  ["तय करना","to decide",2],
  ["सूचना के लिए","to notice",2],
  ["बेटी","daughter",2],
  ["कार्यालय","office",2],
  ["सर्दी","cold / winter",2],
  ["आकृति","figure",2],
  ["अनुभूति","feeling",2],
  ["लटकाना","to hang",2],
  ["काटना","to cut",2],
  ["संख्या","number",2],
  ["ठीक","fine",2],
  ["शहर","city",2],
  ["चकित करना","to surprise",2],
  ["अप करने के लिए","to raise",2],
  ["भरना","to fill / to pour",2],
  ["कई","several",2],
  ["किसका","whose",2],
  ["गरीब","poor",2],
  ["योजना","plan",2],
  ["पूर्व","ago / east / previous",2],
  ["चोटी","top",2],
  ["करवाना","to cause",2],
  ["प्रवेश करना","to enter",2],
  ["तैयार","ready / willing",2],
  ["नीला","blue",2],
  ["अंदर","within",2],
  ["अपने","themselves",2],
  ["आगे","forward / ahead / forth",2],
  ["बहन","sister",2],
  ["खर्च करना","to spend",2],
  ["राज्य","state",2],
  ["हालाँकि","however",2],
  ["लड़ना","to fight",2],
  ["बलवान","strong",2],
  ["चुंबन के लिए","to kiss",2],
  ["दौरान","during",2],
  ["बिट","bit",2],
  ["खुश करने के लिए","to please",2],
  ["टांग","leg",2],
  ["प्रिय","dear / darling",2],
  ["खुश","happy",2],
  ["ख्वाब","dream",2],
  ["ध्यान दें","note",2],
  ["गलत","wrong / 0",2],
  ["समझना","to realize",2],
  ["ब्याज","interest",2],
  ["रक्त","blood",2],
  ["सर्र से","quickly",2],
  ["समझाना","to explain",2],
  ["हवा","wind / breeze",2],
  ["मानव","human",2],
  ["भगवान","Lord",2],
  ["सवारी करने के लिए","to ride",2],
  ["कवर करने के लिए","to cover",2],
  ["औंधे","to lean",2],
  ["अनुमति देने के लिए","to allow",2],
  ["दस","ten",2],
  ["संदेह करना","doubt / to suspect",2],
  ["बीस","twenty",2],
  ["महोदय","sir",2],
  ["सुंदर","beautiful / pretty / lovely",2],
  ["युद्ध","war",2],
  ["धीरे से","slowly / lightly",2],
  ["मुमकिन","possible",2],
  ["मुसीबत","trouble",2],
  ["मुआयना करने के लिए","to visit",2],
  ["मोका","chance",2],
  ["पुश करने के लिए","to push",2],
  ["मुक्त","free",2],
  ["सांस","breath",2],
  ["टुकड़ा","piece",2],
  ["रवि","sun",2],
  ["सत्य","truth",2],
  ["आने के लिए","to arrive",2],
  ["विचार करने के लिए","to consider",2],
  ["कार्य करने के लिए","to act",2],
  ["अपने आप","itself",2],
  ["न","nor / neither",2],
  ["किसी को","anyone",2],
  ["संकेत","sign / signal / hint",2],
  ["सौदा","deal",2],
  ["पार करना","to cross",2],
  ["कांच","glass",2],
  ["काम","job",2],
  ["खत्म करने के लिए","to finish",2],
  ["फुसफुसाना","to whisper",2],
  ["प्रपत्र","form / blanket",2],
  ["आसान","easy",2],
  ["आयु","age",2],
  ["चित्र","picture / painting",2],
  ["छह","six",2],
  ["आखिरकार","finally / eventually",2],
  ["खरीदना","to buy",2],
  ["शांति","silence / peace",2],
  ["कुत्ता","dog",2],
  ["आधार शिला रखना","to lay",2],
  ["दृष्टि","sight / vision",2],
  ["कान","ear",2],
  ["देने के लिए","to offer",2],
  ["समुंद्री जहाज","ship",2],
  ["समुद्र","sea",2],
  ["अंगूठी","ring",2],
  ["वादा करना","to promise",2],
  ["उड़ने के लियें","to fly",2],
  ["हज़ार","thousand",2],
  ["अनुमान के लिए","to guess",2],
  ["कोना","corner",2],
  ["चिंता करना","to worry / to concern",2],
  ["राय","view / opinion",2],
  ["संकट","problem",2],
  ["के बगल में","beside",2],
  ["फ़ोन","phone",2],
  ["ध्यान","attention",2],
  ["छुपाना","to hide",2],
  ["याद आती है","to miss",2],
  ["टकटकी","gaze",2],
  ["पुलिस","police / cop",2],
  ["बचाना","to save",2],
  ["पार्टी","party",2],
  ["अंग्रेज़ी","English",2],
  ["पत्थर","stone",2],
  ["लंडन","London",2],
  ["अजीब","strange / odd / funny",2],
  ["डरा हुआ","afraid",2],
  ["दर्द","pain",2],
  ["लहर","wave",2],
  ["रसोई","kitchen",2],
  ["सहमत होना","to agree",2],
  ["हड़ताल करने के लिए","to strike",2],
  ["दबाने के लिए","to press",2],
  ["हरा","green",2],
  ["युगल","couple",2],
  ["पुरुष","guy",2],
  ["माफ़ कीजिये","sorry",2],
  ["अनुभव","experience",2],
  ["अमेरिकन","American",2],
  ["सीट","seat",2],
  ["लुढ़कना","to roll",2],
  ["फूंक मारना","to blow",2],
  ["कभी कभी","sometimes",2],
  ["भारी","heavy / heavily",2],
  ["अन्त: मन","soul",2],
  ["जरूरी","important",2],
  ["गरम","warm / hot",2],
  ["मेरी","mine",2],
  ["पद","position / post / rank",2],
  ["चिकित्सक","doctor",2],
  ["परे","beyond",2],
  ["चिल्लाना","to shout / to yell",2],
  ["विषय","subject",2],
  ["रात का खाना","dinner",2],
  ["जाँच करने के लिए","to check",2],
  ["आत्मा","spirit",2],
  ["दोपहर","afternoon",2],
  ["अफ़सर","officer",2],
  ["शांत","quiet / calm",2],
  ["इच्छा","desire",2],
  ["के सिवाय","except",2],
  ["पृथ्वी","earth",2],
  ["कल्पना करना","to imagine",2],
  ["पास जाना","to approach",2],
  ["गरदन","neck",2],
  ["मील","mile",2],
  ["तौर तरीका","manner",2],
  ["शामिल होना","to join",2],
  ["भोजन","food / meal",2],
  ["इमारत","building",2],
  ["चिपकाने के लिए","to stick",2],
  ["धार","edge",2],
  ["खेत","field / farm",2],
  ["प्रकृति","nature",2],
  ["नदी","river",2],
  ["चट्टान","rock",2],
  ["बंदूक","gun / pistol",2],
  ["उल्लेख करने के लिए","to mention",2],
  ["सीधे","straight / directly",2],
  ["चौड़ा","wide",2],
  ["कंपनी","company / firm",2],
  ["आकाश","sky",2],
  ["शूट करना","to shoot",2],
  ["लकड़ी","wood",2],
  ["मारना","to hit",2],
  ["नाचना","to dance",2],
  ["भीड़","crowd",2],
  ["जलाना","to burn",2],
  ["साथी","fellow / companion / partner",2],
  ["अभिव्यक्ति","expression",2],
  ["डिब्बा","box",2],
  ["नियंत्रण","control",2],
  ["चर्च","church",2],
  ["आह भरने के लिए","to sigh",2],
  ["हर कोई","everyone",2],
  ["चुनना","to choose",2],
  ["साझा करने के लिए","to share",2],
  ["करने के लिए सुझाव","to suggest",2],
  ["राजा","king",2],
  ["माता-पिता","parent",2],
  ["फिसलना","to slip / to slide",2],
  ["बनाने के लिए","to build",2],
  ["याद","memory",2],
  ["वस्त्र","clothes",2],
  ["रिपोर्ट","report",2],
  ["स्वीकार करने के लिए","to accept / to admit",2],
  ["मजा लेना","to enjoy",2],
  ["त्वचा","skin",2],
  ["गुप्त","secret",2],
  ["निश्चित रूप से","certainly / surely",2],
  ["खेल","game",2],
  ["बातचीत","conversation",2],
  ["नाव","boat / boot",2],
  ["खाली","empty",2],
  ["आज","today",2],
  ["नरक","hell",2],
  ["पिरस ना","to serve",2],
  ["मुलायम","soft",2],
  ["पलायन करना","to escape",2],
  ["सुर","tone",2],
  ["नफ़रत करना","to hate",2],
  ["दिशा","direction",2],
  ["प्रयास","attempt",2],
  ["समूह","group",2],
  ["गाल","cheek",2],
  ["जेब","pocket",2],
  ["प्रबंधन करना","to manage",2],
  ["हाँ","yes",2],
  ["खोजना","to search",2],
  ["सूंघना","to smell",2],
  ["वसंत","spring",2],
  ["सामान्य","general / usual / common",2],
  ["मध्य","middle",2],
  ["लेखा","account",2],
  ["बाएं","left",2],
  ["ठीक ठीक","exactly",2],
  ["सर्विस","service",2],
  ["निम्नलिखित","following",2],
  ["चोट पहुँचाना","to hurt",2],
  ["चार्ज","charge",2],
  ["जनता","public",2],
  ["समाधान करना","to settle",2],
  ["अभिराम","pleasure",2],
  ["बजाय","instead",2],
  ["खोज करना","to discover",2],
  ["सज्जन","gentleman / gentle",2],
  ["सोना","gold",2],
  ["जो कुछ","whatever",2],
  ["समाचार","news",2],
  ["घुटना","knee",2],
  ["उज्ज्वल","bright",2],
  ["हाथोंहाथ","immediately",2],
  ["प्रसन्न","glad",2],
  ["हराने के लिए","to beat",2],
  ["उपवास","fast",2],
  ["दूरी","distance",2],
  ["प्राप्त करने के लिए","to receive",2],
  ["स्थान","spot",2],
  ["स्थल","scene",2],
  ["मांग करना","to demand",2],
  ["रेल गाडी","train",2],
  ["कक्षा","class",2],
  ["जानवर","animal / beast",2],
  ["डेस्क","desk",2],
  ["हॉल","hall",2],
  ["छाती","chest",2],
  ["स्वामी","master / lord",2],
  ["कॉफ़ी","coffee",2],
  ["विश्वास करना","to trust",2],
  ["रक्षक","guard",2],
  ["मूक","silent",2],
  ["प्रभाव","effect / influence / impression",2],
  ["साया","shadow",2],
  ["गाने के लिए","to sing",2],
  ["बैग","bag",2],
  ["साबित करना","to prove",2],
  ["फ्रेंच","French",2],
  ["तलाश करना","to seek",2],
  ["कोई नहीं","none",2],
  ["जल्दी करना","to rush / to hurry",2],
  ["पर्वत","mountain",2],
  ["तैयारी करना","to prepare",2],
  ["फोजी","soldier",2],
  ["मुश्किल से","hardly",2],
  ["बार","bar",2],
  ["मुस्कराहट के लिए","to grin",2],
  ["इतिहास","history",2],
  ["स्वच्छ","clean / proper",2],
  ["बेचना","to sell",2],
  ["शादी","marriage / wedding",2],
  ["कार्य","action / task",2],
  ["गाँव","village",2],
  ["सदस्य","member",2],
  ["भविष्य","future",2],
  ["पहाड़ी","hill",2],
  ["ख़ास तौर पर","especially",2],
  ["बगीचा","garden",2],
  ["मिठाई","sweet",2],
  ["बारिश","rain",2],
  ["चरित्र","character",2],
  ["यात्रा करने के लिए","to travel",2],
  ["आक्रमण","attack",2],
  ["धुआं","smoke",2],
  ["सुरक्षित","safe",2],
  ["अंतरिक्ष","space",2],
  ["क्षेत्र","area",2],
  ["परिस्थिति","situation / circumstance",2],
  ["संबंध के लिए","to regard",2],
  ["मन करना","to refuse",2],
  ["तीस","thirty",2],
  ["सूखा","dry",2],
  ["कूदना","to jump",2],
  ["दोहराना","to repeat",2],
  ["जंगली","wild",2],
  ["इंगलैंड","England",2],
  ["कला","art",2],
  ["तीसरा","third",2],
  ["कमीज","shirt",2],
  ["जीतना","to win",2],
  ["नाक","nose",2],
  ["गर्मी","summer / heat",2],
  ["गला","throat",2],
  ["प्रयास है","effort",2],
  ["सरल","simple",2],
  ["अवधि","term / period",2],
  ["सिखाना","to teach",2],
  ["दौड़","race",2],
  ["धीमा","slow",2],
  ["कर्तव्य","duty",2],
  ["संगीत","music",2],
  ["भारतीय","Indian",2],
  ["घटना","event",2],
  ["फूल","flower",2],
  ["चिह्नित करना","to mark",2],
  ["चिड़िया","bird",2],
  ["इकट्ठा करने के लिए","to gather",2],
  ["श्री","Mr",2],
  ["कोर्ट","court",2],
  ["मुलाकात","meeting",2],
  ["चीख","to scream",2],
  ["टोपी","hat / cap",2],
  ["असफल होना","to fail",2],
  ["चढ़ना","to climb",2],
  ["हत्या","murder",2],
  ["फिट करने के लिए","to fit",2],
  ["पतला","thin",2],
  ["परिणाम","result",2],
  ["दांत","tooth",2],
  ["बांधना","to tie",3],
  ["उद्देश्य","purpose",3],
  ["पृष्ठ","page",3],
  ["इस प्रकार","thus",3],
  ["सूट","suit",3],
  ["दुश्मन","enemy",3],
  ["सदी","century",3],
  ["संघर्ष करना","to struggle / to cease",3],
  ["वस्तु","object",3],
  ["जगाना","to wake",3],
  ["धनी","rich",3],
  ["दावा करना","to claim",3],
  ["निष्पक्ष","fair",3],
  ["मोटा","thick",3],
  ["सामग्री","stuff / content / material",3],
  ["आदर करना","respect",3],
  ["पता करने के लिए","to address",3],
  ["जीवित","living",3],
  ["सात","seven",3],
  ["पहचानना","to recognize",3],
  ["शिफ़र तक","to ought",3],
  ["समर्थन के लिए","to support",3],
  ["यार्ड","yard",3],
  ["भूरा","brown",3],
  ["आदेश","command",3],
  ["उपस्थिति","presence",3],
  ["व्याख्या करना","to describe",3],
  ["कोट","coat",3],
  ["स्टेशन","station",3],
  ["ज़रूरी","necessary",3],
  ["डूबना","to sink",3],
  ["बैंक","bank",3],
  ["फैलना","to stretch",3],
  ["उत्तम","perfect",3],
  ["भुगतना","to suffer",3],
  ["अचानक","sudden",3],
  ["गायब करने के लिए","to disappear",3],
  ["आठ","eight",3],
  ["पथ","path",3],
  ["विशेष","particular / special",3],
  ["फ़ैलना","to spread",3],
  ["सीढ़ी","stair",3],
  ["धन्यवाद करने के लिए","to thank",3],
  ["आंदोलन","movement",3],
  ["दुकान","shop / store",3],
  ["पीला","pale / yellow",3],
  ["सदस्य बनने के लिए","to belong",3],
  ["भाषा","language",3],
  ["गंभीर","serious / grave",3],
  ["याद दिलाना","to remind",3],
  ["उपलब्ध कराना","to provide",3],
  ["संकीर्ण","narrow",3],
  ["शर्त","condition",3],
  ["मोड़ने के लिए","to bend",3],
  ["तारा","star",3],
  ["बोतल","bottle",3],
  ["ज़िंदा","alive",3],
  ["कुंजी","key",3],
  ["झूलने के लिए","to swing",3],
  ["जोर","loud",3],
  ["चुपचाप","quietly / silently",3],
  ["ग़लती","mistake",3],
  ["अनुसरण करना","to observe",3],
  ["टिप्पणी करने के लिए","to remark",3],
  ["सुंदरता","beauty / handsome",3],
  ["सावधानी से","carefully",3],
  ["दस्तक देना","to knock",3],
  ["अवगत","aware",3],
  ["हटाना","to remove",3],
  ["पूरी तरह","completely",3],
  ["हिम्मत करना","to dare",3],
  ["नौकर","servant",3],
  ["झुकना","to bow",3],
  ["वृत्त","circle",3],
  ["अभिलेख","record",3],
  ["चाय","tea / thee",3],
  ["गुस्सा","angry / anger",3],
  ["निजी","personal / private",3],
  ["बादल","cloud",3],
  ["नियम","rule",3],
  ["लड़ाई","battle",3],
  ["मंडल","board",3],
  ["घाव","wound",3],
  ["प्राकृतिक","natural",3],
  ["कहीं","somewhere",3],
  ["स्वाद","taste",3],
  ["ठीक करने के लिए","to fix",3],
  ["आसानी से","easily",3],
  ["वैसे भी","anyway",3],
  ["जंतु","creature",3],
  ["लंबाई","length",3],
  ["ताज़ा","fresh",3],
  ["वाइन","wine",3],
  ["फ्लैट","apartment",3],
  ["अवसर","occasion / opportunity",3],
  ["छवि","image",3],
  ["प्रणाली","system",3],
  ["न्यायाधीश","judge",3],
  ["जुबान","tongue",3],
  ["पौंड","pound",3],
  ["कप","cup",3],
  ["आकार","shape / size",3],
  ["लायक","worth",3],
  ["गीत","song",3],
  ["उत्पादन करना","to produce",3],
  ["आज रात","tonight",3],
  ["बीमार","ill / sick",3],
  ["हिमपात","snow",3],
  ["स्तर","level",3],
  ["मूर्ख","fool",3],
  ["गिनती करने के लिए","to count",3],
  ["सामाजिक","social",3],
  ["आने वाला कल","tomorrow",3],
  ["विस्तार","detail",3],
  ["कंधे उचकाने की क्रिया के लिए","to shrug",3],
  ["शामिल करना","to involve",3],
  ["डॉलर","dollar",3],
  ["ठंडा","cool",3],
  ["स्तन","breast",3],
  ["टायर के लिए","to tire",3],
  ["शिविर","camp",3],
  ["उदाहरण","example / instance",3],
  ["यात्रा","trip / journey",3],
  ["होटल","hotel",3],
  ["जोड़ा","pair",3],
  ["फ़्लैश करना","to flash",3],
  ["उपयुक्त","likely",3],
  ["आमतौर पर","usually",3],
  ["असंभव","impossible",3],
  ["भयानक","terrible",3],
  ["समाज","society",3],
  ["चोरी करना","to steal",3],
  ["संदेश","message",3],
  ["शयनकक्ष","bedroom",3],
  ["होने के लिये","to occur",3],
  ["आवश्यकता के लिए","to require",3],
  ["जूता","shoe",3],
  ["मति करना","to intend",3],
  ["रंग","color / colour",3],
  ["सेना","army",3],
  ["अजनबी","stranger",3],
  ["व्यस्त","busy",3],
  ["धूसर","gray / grey",3],
  ["जर्मन","German",3],
  ["शामिल करने के लिए","to contain",3],
  ["कार्ड","card",3],
  ["तेज़","sharp",3],
  ["व्यवहार करना","to treat",3],
  ["गेंद","ball",3],
  ["तल","bottom",3],
  ["खतरा","danger",3],
  ["संपूर्ण","entire / total",3],
  ["संकल्प करना","to determine",3],
  ["मछली","fish",3],
  ["मुख्य","main",3],
  ["पेंट करने के लिए","to paint",3],
  ["भूमिका देने के लिए","to cast",3],
  ["लेखक","author / writer",3],
  ["शोर","noise",3],
  ["अंतर","difference",3],
  ["अतिथि","guest",3],
  ["झटका","shock",3],
  ["शॉट","shot",3],
  ["दार सर","chief",3],
  ["चमकने के लिए","to shine / to blink",3],
  ["धोना","to wash",3],
  ["साँस लेना","to breathe",3],
  ["सरकार","government",3],
  ["बचने के लिए","to avoid",3],
  ["प्लेसमेंट","stage",3],
  ["पचास","fifty",3],
  ["छेद","hole",3],
  ["फोड़ना","to burst",3],
  ["चांदी","silver",3],
  ["बहाना करना","to exclaim / to pretend",3],
  ["टाइप","type",3],
  ["छोटे","tiny",3],
  ["घास","grass",3],
  ["निर्देशित करना","to direct",3],
  ["दिखावट","appearance",3],
  ["अमेरिका","America",3],
  ["आश्चर्यजनक","wonderful",3],
  ["पैक करने के लिए","to pack",3],
  ["अस्पताल","hospital",3],
  ["उसकी","hers",3],
  ["धीरे","gently / softly",3],
  ["ट्रैक","track",3],
  ["सबूत","evidence",3],
  ["बुराई","evil",3],
  ["प्रकट करना","to reveal",3],
  ["मौजूद है","to exist",3],
  ["घसीटना","to drag",3],
  ["प्रार्थना करना","to pray / to bid",3],
  ["ज्ञान","knowledge",3],
  ["व्यक्त करना","to express",3],
  ["अलग","aside / apart",3],
  ["परिचित","familiar",3],
  ["देवता","god",3],
  ["खंड","block",3],
  ["स्पष्ट रूप से","clearly / obviously",3],
  ["बड़बड़ाना","to murmur",3],
  ["धारा","stream",3],
  ["झाडू लगाना","to sweep",3],
  ["जोर देना","to insist",3],
  ["तिमाही","quarter",3],
  ["मस्तिष्क","brain",3],
  ["मैदान","plain",3],
  ["समतल","flat",3],
  ["मुद्दा","issue",3],
  ["आधार","base",3],
  ["आनंद","delight",3],
  ["द्वीप","island",3],
  ["पेरिस","Paris",3],
  ["पौधा","plant",3],
  ["हर्ष","joy",3],
  ["शिफ्ट करना","to shift",3],
  ["संबंध","relationship / relation / connection",3],
  ["चाकू","knife",3],
  ["ब्रश करना","to brush",3],
  ["लानत","damn",3],
  ["कांपना","to tremble",3],
  ["चर्चा करना","to discuss",3],
  ["मूल्य","value",3],
  ["पार्क","park",3],
  ["लिंग","sex",3],
  ["स्थानीय","local",3],
  ["जवानी","youth",3],
  ["अभ्यास","practice",3],
  ["कानून","wet / law",3],
  ["नाश्ता","breakfast",3],
  ["कप्तान","captain",3],
  ["नष्ट करना","to destroy",3],
  ["रविवार","Sunday",3],
  ["किसी न किसी तरह","somehow",3],
  ["फेंकना","to frown",3],
  ["लपेटना","to wrap",3],
  ["बिल्ली","cat",3],
  ["सीमा","bound / limit / border",3],
  ["इशारा","gesture",3],
  ["पुरोहित","priest",3],
  ["फ्रांस","France",3],
  ["संभालना","to handle",3],
  ["स्वर्ग","heaven",3],
  ["गवाह","witness",3],
  ["बढ़ाना","to increase",3],
  ["सुविधा","feature",3],
  ["लात मारना","to kick",3],
  ["मान लेना","to assume",3],
  ["सो","asleep",3],
  ["याद करना","to recall",3],
  ["मैच","match",3],
  ["तंग","tight",3],
  ["वन","forest",3],
  ["रक्षा करना","to protect",3],
  ["कमी","lack",3],
  ["पूरी तरह से","entirely / perfectly / totally",3],
  ["निर्णय","decision / judgment",3],
  ["को शामिल करने के लिए","to include",3],
  ["निशान","trail / trace",3],
  ["आमंत्रित करना","to invite",3],
  ["भावना","emotion",3],
  ["हड्डी","bone",3],
  ["बजे","o’clock",3],
  ["घेरना","to surround",3],
  ["सतह","surface",3],
  ["बक्से","dozen",3],
  ["घोषित करना","to declare",3],
  ["हथियार","weapon",3],
  ["केंद्र","center",3],
  ["स्वागत","welcome",3],
  ["अपराध","crime",3],
  ["भार","weight",3],
  ["पत्ते","lover / blade",3],
  ["तलवार","sword / broad",3],
  ["चाल","list / trick",3],
  ["तिथि","date",3],
  ["भाषण","speech",3],
  ["ईसाई","Christian",3],
  ["आश्वासन देना","to assure",3],
  ["स्नैप करने के लिए","to snap",3],
  ["प्रस्ताव","motion",3],
  ["जोश","passion",3],
  ["उन्नति करना","to advance",3],
  ["गति","speed",3],
  ["लोक","folk",3],
  ["आंधी","storm",3],
  ["चंद्रमा","moon",3],
  ["खिलाने के लिए","to feed",3],
  ["राजनीतिक","political",3],
  ["भीख माँगना","to beg",3],
  ["समझौते के लिए","to accord",3],
  ["मशीन","machine",3],
  ["चालीस","forty",3],
  ["नौ","nine",3],
  ["जारी करना","to release",3],
  ["उत्तर","north",3],
  ["चाचा","uncle",3],
  ["प्राचीन","ancient",3],
  ["उदास","sad",3],
  ["ब्रिटिश","British",3],
  ["बेहोश","faint",3],
  ["दोहरा","double",3],
  ["लंच","lunch",3],
  ["तुरंत","instant / instantly",3],
  ["प्लेट","plate",3],
  ["दफनाने के लिए","to bury",3],
  ["तुम्हारा","yours",3],
  ["बर्फ़","ice",3],
  ["अलग करना","to separate",3],
  ["काटने के लिए","to bite",3],
  ["डाकू","roof",3],
  ["कसम खाना","to swear",3],
  ["इंच","inch",3],
  ["ड्राइवर","driver",3],
  ["आईना","mirror",3],
  ["पेट","stomach / belly",3],
  ["किया जा रहा है","being",3],
  ["हासिल करना","to gain",3],
  ["उपेक्षा करना","to ignore",3],
  ["जवाब देना","to respond",3],
  ["कोई भी नहीं","nobody",3],
  ["परेशान करना","to bother / to disturb",3],
  ["व्यवस्था करना","to arrange",3],
  ["धूल","dust",3],
  ["रगड़ना","to rub",3],
  ["चमक","glow",3],
  ["नर्स","nurse",3],
  ["श्रीमती","Mrs",3],
  ["बर्बाद करना","to waste",3],
  ["घमंडी","proud",3],
  ["पागल","mad / crazy",3],
  ["अधिकार","authority / possession",3],
  ["संपर्क","contact",3],
  ["अख़बार","newspaper",3],
  ["क्रिसमस","Christmas",3],
  ["जोखिम","risk",3],
  ["विशेष रूप से","particularly",3],
  ["हद","degree",3],
  ["भूतपूर्व","former",3],
  ["कुछ हद तक","somewhat",3],
  ["शैली","style",3],
  ["के पास","to possess",3],
  ["ट्रक","truck",3],
  ["दिलचस्प","interesting",4],
  ["मज़ाक","joke",4],
  ["मुकर्रर करना","to mutter",4],
  ["संपत्ति","property",4],
  ["नंगा","bare / naked",4],
  ["मांस","flesh / meat",4],
  ["राहत","relief",4],
  ["संकोच करना","to hesitate",4],
  ["आराम करने के लिए","to ease",4],
  ["आसंजन","grip",4],
  ["छलांग लगाना","to leap",4],
  ["सप्लाई","supply",4],
  ["बीच में रोकना","to interrupt",4],
  ["चचेरा भाई","cousin",4],
  ["प्रक्रिया","process",4],
  ["हानि","loss",4],
  ["सिगरेट","cigarette",4],
  ["लोहा","iron",4],
  ["समझाने के लिए","to convince",4],
  ["कल्पना","fancy / imagination",4],
  ["पंक्ति","row",4],
  ["पेसमेकर","pace",4],
  ["दो बार","twice",4],
  ["बहना","to flow",4],
  ["रोगी","patient",4],
  ["मात्र","barely / mere",4],
  ["घोषणा करना","to announce",4],
  ["हंसी","laughter",4],
  ["चादर","sheet",4],
  ["डिज़ाइन","design",4],
  ["पकाने के लिए","to cook",4],
  ["तेरा","thy",4],
  ["पहिया","wheel",4],
  ["सफलता","success",4],
  ["ख़तरनाक","dangerous",4],
  ["दक्षिण","south",4],
  ["सचेत","awake / conscious",4],
  ["ढीला","loose",4],
  ["माथा","forehead",4],
  ["रेगिस्तान","desert",4],
  ["हलचल करना","to stir",4],
  ["स्ट्रोक","stroke",4],
  ["विंग","wing",4],
  ["चेतावनी देना","to warn",4],
  ["तह करना","to fold",4],
  ["ढेर","pile",4],
  ["लौ","flame",4],
  ["प्रवेश","entrance",4],
  ["पालना","to sail",4],
  ["परिचय कराना","to introduce",4],
  ["चिकना","smooth",4],
  ["शक्तिशाली","powerful",4],
  ["लागत","cost",4],
  ["दस लाख","million",4],
  ["धर्म","faith / religion",4],
  ["निगल जाना","to swallow",4],
  ["पुल","bridge",4],
  ["छात्र","student",4],
  ["माप","measure",4],
  ["अंधा","blind",4],
  ["हर","everybody",4],
  ["भाग्य","fortune / luck / fate",4],
  ["देय","due",4],
  ["जांच करना","to examine",4],
  ["मज़ा","fun",4],
  ["अभिमान","pride",4],
  ["नर","male",4],
  ["संलग्न करना","to engage / to attach",4],
  ["कसौटी","test",4],
  ["ढांचा","frame",4],
  ["वास्तविकता","reality",4],
  ["प्रतिबिंबित करना","to reflect",4],
  ["भटकना","to wander",4],
  ["प्रतिनिधित्व करना","to represent",4],
  ["टीम","team",4],
  ["मौसम","weather",4],
  ["संतुष्ट करना","to satisfy",4],
  ["कठिनाई","difficulty",4],
  ["कमज़ोर","weak",4],
  ["अर्थ","meaning",4],
  ["उड़ान","flight",4],
  ["सुखद","pleasant",4],
  ["डेक","deck",4],
  ["सतर्कता","careful",4],
  ["वर्ग","square",4],
  ["बहाना","excuse",4],
  ["शाखा","branch",4],
  ["पोंछना","to wipe",4],
  ["कीमत","price",4],
  ["मूल","original",4],
  ["बारह","twelve",4],
  ["वकील","lawyer",4],
  ["प्रार्थना","prayer / request",4],
  ["कोई","anybody",4],
  ["आदर","honor / honour",4],
  ["घंटी","bell",4],
  ["उपहार","gift",4],
  ["क्राइस्टचर्च","Christ",4],
  ["संभवतः","possibly",4],
  ["आदत","habit",4],
  ["गुणवत्ता","quality",4],
  ["टॉस करने","to toss",4],
  ["दोष","fault",4],
  ["कम करना","to lower",4],
  ["जाहिरा तौर पर","apparently",4],
  ["बहस करना","to argue",4],
  ["शुरू","beginning",4],
  ["दोष देना","to blame",4],
  ["विरोध करना","to protest / to resist",4],
  ["बंदी","prisoner",4],
  ["संकेत करना","to indicate",4],
  ["मरोड़ना","to twist",4],
  ["जैकेट","jacket",4],
  ["नायक","hero",4],
  ["सूचित करना","to inform",4],
  ["सुख","happiness",4],
  ["सही मायने में","truly",4],
  ["विकसित करना","to develop",4],
  ["ठोड़ी","chin",4],
  ["बरबाद करना","to ruin",4],
  ["दरार करना","to crack",4],
  ["नेता","leader",4],
  ["कल","yesterday",4],
  ["पंद्रह","fifteen",4],
  ["लकड़ी का","wooden",4],
  ["वितरित करने के लिए","to deliver",4],
  ["एजेंट","agent",4],
  ["प्रतिक्रिया","response / reaction",4],
  ["बेवकूफ","stupid",4],
  ["फ़ैशन","fashion",4],
  ["जिज्ञासु","curious",4],
  ["सफल होने के लिए","to succeed",4],
  ["बुद्धिमान","wise",4],
  ["मात्रा","amount",4],
  ["टेलीफोन","telephone",4],
  ["इनकार करना","to deny",4],
  ["खोदना","to dig",4],
  ["आग्रह करना","to urge",4],
  ["सदैव","forever",4],
  ["समुदाय","community",4],
  ["भौतिक","physical",4],
  ["स्रोत","source",4],
  ["हथेली","palm",4],
  ["शिक्षक","teacher",4],
  ["दास","slave",4],
  ["दोस्त","fat",4],
  ["पसंद करना","to prefer",4],
  ["सैन्य","military",4],
  ["रोटी","bread",4],
  ["संदर्भित करने के लिए","to refer",4],
  ["केबिन","cabin",4],
  ["रंगीन","fully",4],
  ["असमर्थ","unable",4],
  ["साथ देना","to accompany",4],
  ["आगे बढ़ना","to proceed",4],
  ["विनिमय करना","to exchange",4],
  ["सामूहिक","mass",4],
  ["किनारा","shore",4],
  ["मार्गदर्शन करने के लिए","to guide",4],
  ["सोने का","golden",4],
  ["धमकी देना","to threaten",4],
  ["दर","rate",4],
  ["शाप देना","to curse",4],
  ["भालू","beer",4],
  ["ज़ाहिर","obvious",4],
  ["टिप्पणी","comment",4],
  ["लाभ","advantage",4],
  ["बावजूद","spite",4],
  ["ट्रैफ़िक जाम","file",4],
  ["संभावना","possibility",4],
  ["आचरण करना","to conduct",4],
  ["फीका करना","to fade",4],
  ["आधुनिक","modern",4],
  ["ध्यान केंद्रित करना","to focus",4],
  ["स्क्रीन","screen",4],
  ["अस्तित्व","existence",4],
  ["माउंट करने के लिए","to mount",4],
  ["रेत","sand",4],
  ["शिकार","victim",4],
  ["टिप","tip",4],
  ["क्रोध","rage",4],
  ["काउंटर","counter",4],
  ["बाद वाला","latter",4],
  ["डराने के लिए","to scare / to frighten",4],
  ["दुर्घटना","accident",4],
  ["सहकर्मी","to peer",4],
  ["समलैंगिक","gay",4],
  ["कर्ल करने के लिए","to curl",4],
  ["इकट्ठा करना","to collect",4],
  ["मार्च करना","to march",4],
  ["प्रदर्शित करना","to display",4],
  ["समुद्र तट","beach",4],
  ["चाची","aunt",4],
  ["आरामदायक","comfortable",4],
  ["बहाव करना","to drift",4],
  ["दया","pity",4],
  ["उत्तेजना","excitement",4],
  ["निर्णय लेना","to arrest",4],
  ["अन्यथा","otherwise",4],
  ["क्लब","club",4],
  ["सेल","cell",4],
  ["स्वास्थ्य","health",4],
  ["पश्चिम","west",4],
  ["चमड़ा","leather",4],
  ["असभ्य","rough",4],
  ["हांफना","to gasp",4],
  ["प्रदर्शन करने के लिए","to perform",4],
  ["छोटी उंगली","pink",4],
  ["बैंड","band",4],
  ["वाक्य","sentence",4],
  ["मनोदशा","mood",4],
  ["लेख","article",4],
  ["श्रृंखला","chain",4],
  ["उच्चारण करना","to utter",4],
  ["छाया","shade",4],
  ["विमान","plane",4],
  ["कॉलेज","college",4],
  ["क्षमा करना","to forgive",4],
  ["कविता","poem / poetry",4],
  ["रस्सी","rope",4],
  ["प्रकाश","lamp",4],
  ["विशुद्ध","pure",4],
  ["लोड करने के लिए","to load",4],
  ["जब्त करना","to seize",4],
  ["ईमानदार","honest",4],
  ["प्रमुख","major",4],
  ["समान","similar",4],
  ["गतिविधि","activity",4],
  ["गूँजना","to echo",4],
  ["कब्जा करना","to occupy / to capture",4],
  ["प्रसिद्ध","famous",4],
  ["जीवित रहने के लिए","to survive",4],
  ["चिंतित","anxious",4],
  ["तर्क","argument",4],
  ["शैतान","devil",4],
  ["आत्मविश्वास","confidence",4],
  ["पछतावा करना","to regret",4],
  ["पसीना","sweat",4],
  ["रूसी","Russian",4],
  ["रेंज","range",4],
  ["अलार्म","alarm",4],
  ["उबरना","to recover",4],
  ["आतंक","horror / terror",4],
  ["सुरक्षा","security / safety",4],
  ["कर्मीदल","crew",4],
  ["दहाड़ना","to roar",4],
  ["भोर","dawn",4],
  ["राष्ट्र","nation",4],
  ["धातु","metal",4],
  ["परेशान","nervous",4],
  ["जेल","prison",4],
  ["त्याग करना","to abandon",4],
  ["कहीं भी","anywhere",4],
  ["कवि","poet",4],
  ["इसके","sin",4],
  ["घास के लिए","to grasp",4],
  ["रवैया","attitude",4],
  ["सुरक्षित करना","to secure",4],
  ["कथन","statement",4],
  ["बिल","bill",4],
  ["भौंह","brow",4],
  ["नैतिकता","moral",4],
  ["रोले","role",4],
  ["बहुत सारे","plenty",4],
  ["व्यवसाय","career",4],
  ["पूंछ","tail",4],
  ["जन्म","birth",4],
  ["लागू करने के लिए","to apply",4],
  ["आधिकारिक","official",4],
  ["संबंधित करना","to relate",4],
  ["परियोजना","project",4],
  ["घाटी","valley",4],
  ["बाजार","market",4],
  ["मुट्ठी","fist",4],
  ["भट्टियों को","to owe",4],
  ["इरादा","intention",4],
  ["शृंखला","series",4],
  ["साहस","courage",4],
  ["मीनार","tower",4],
  ["झील","lake",4],
  ["उभरना","to emerge",4],
  ["शर्त लगाना","to bet",4],
  ["चलचित्र","movie",4],
  ["स्कर्ट","skirt",4],
  ["रोने के लिए","to weep",4],
  ["परीक्षण","trial",4],
  ["जादू","magic / spell",4],
  ["इंजन","engine",4],
  ["धन्यवाद","thanks",4],
  ["लेखन","writing",4],
  ["बटन","button",4],
  ["फ़िल्म","film",4],
  ["शिकार करना","to hunt",4],
  ["साधारण","ordinary / normal",4],
  ["विस्तार करने के लिए","to extend",4],
  ["बचाने के लिए","to spare",4],
  ["सिद्धांत","theory / principle",4],
  ["नियमित","steady / regular",4],
  ["अनुदान देना","to grant",4],
  ["जून","June",4],
  ["यहूदी","Jew",4],
  ["टेक्स्ट","text",4],
  ["बिल्कुल","absolutely",4],
  ["तैरने के लिए","to float",4],
  ["रहस्य","mystery",4],
  ["ऋतु","season",4],
  ["मालिक","owner",4],
  ["वहन करने के लिए","to afford",4],
  ["सलाह","advice",4],
  ["प्रशंसा करना","to admire",4],
  ["स्वतंत्रता","freedom",4],
  ["दो चकाचौंध","to glare",4],
  ["पात्र हैं","to deserve",4],
  ["नमस्कार करने के लिए","to greet",4],
  ["गले लगाना","to hug / to embrace",4],
  ["स्टाफ़","staff",4],
  ["जोर लगाना","to thrust",4],
  ["बाद में","afterwards",4],
  ["निर्भर करना","to depend",4],
  ["तैरना","to swim",4],
  ["पूल","pool",4],
  ["मासूम","innocent",4],
  ["एड़ी","heel",4],
  ["generelt","generally",4],
  ["परदा","curtain",4],
  ["फोटो","photograph",4],
  ["शायद ही","scarcely",4],
  ["रेडियो","radio",4],
  ["देशी","native",4],
  ["साक्षात्कार","interview",4],
  ["अनुमति देना","to permit",4],
  ["गंदा","dirty",4],
  ["शर्म की बात है","shame",4],
  ["अंडा","egg",4],
  ["व्याख्या","explanation",4],
  ["दर्शक","audience",4],
  ["भयंकर","awful",4],
  ["पाइप","pipe",4],
  ["तनाव देना","to strain",5],
  ["कलाकार","artist",5],
  ["निचोड़ना","to squeeze",5],
  ["उपन्यास","Roman / novel / fiction",5],
  ["अपील करने के लिए","to appeal",5],
  ["कपड़ा","cloth",5],
  ["आयतन","volume",5],
  ["अनुभाग","section",5],
  ["अनुकूल","friendly",5],
  ["भूखा","hungry",5],
  ["रेंगना","to creep",5],
  ["आगंतुक","visitor",5],
  ["हर जगह","everywhere",5],
  ["धार्मिक","religious",5],
  ["प्राप्त करना","to obtain",5],
  ["नौकरानी","maid",5],
  ["न्याय","justice",5],
  ["प्रगति","progress",5],
  ["गोद","lap",5],
  ["धारणा","belief / notion",5],
  ["कनेक्ट करने के लिए","to connect",5],
  ["भूत","ghost",5],
  ["निशाना लगाना","to aim",5],
  ["फुलाना","to fling",5],
  ["शनिवार","Saturday",5],
  ["सर्जरी","operation",5],
  ["राहत देना","to relieve",5],
  ["अब","anymore",5],
  ["trots","despite",5],
  ["कमर","waist / hip",5],
  ["दूध","milk",5],
  ["बाथरूम","bathroom",5],
  ["पॉट","pot",5],
  ["मुठभेड़ करना","to encounter",5],
  ["जायदाद","estate",5],
  ["स्पिन करना","to spin",5],
  ["बड़ा","grand",5],
  ["फंदा","trap",5],
  ["प्रभावित करना","to affect / to impress",5],
  ["दवा","drug",5],
  ["रेशम","silk",5],
  ["सूप","supper",5],
  ["शराबी","drunk",5],
  ["क्रोध से","harm",5],
  ["फल","fruit",5],
  ["कंप्यूटर","computer",5],
  ["कोहनी","elbow",5],
  ["उतरना","to descend",5],
  ["दो नुकसान","to tap",5],
  ["बरामदा","porch",5],
  ["प्रफुल्लित होना","to swell",5],
  ["अप","upper",5],
  ["दादा","grandfather",5],
  ["व्यायाम","exercise",5],
  ["पुस्तकालय","library",5],
  ["मांसपेशी","muscle",5],
  ["जम जाना","to freeze",5],
  ["परेशान होना","to upset",5],
  ["शिकायत करना","to complain",5],
  ["यूरोप","Europe",5],
  ["जड़","root",5],
  ["उत्पन्न होना","to arise",5],
  ["चुनौती","challenge",5],
  ["शावर","shower",5],
  ["यूनानी","Greek",5],
  ["के दौरान","throughout",5],
  ["यौन","sexual",5],
  ["तार","string / wire",5],
  ["रेस्टोरेंट","restaurant",5],
  ["दबाव","pressure",5],
  ["लुप्त हो जाना","to vanish",5],
  ["अनुग्रह","grace",5],
  ["व्यापक","vast",5],
  ["कबूल करना","to confess",5],
  ["बलिदान","sacrifice",5],
  ["आगमन","arrival",5],
  ["झटके से","to jerk",5],
  ["पाठ","lesson",5],
  ["छोड़ना","lad",5],
  ["तेल","oil",5],
  ["पैटर्न","pattern",5],
  ["राइफल","rifle",5],
  ["भाग्यशाली","lucky",5],
  ["नितंब","ass",5],
  ["कुंठित","dull",5],
  ["गड़बड़","mess",5],
  ["तत्त्व","element",5],
  ["कराहना","to groan",5],
  ["konsekvens","consequence",5],
  ["संतुलन","balance",5],
  ["प्यार","affection",5],
  ["मोमबत्ती","candle",5],
  ["मल","shit",5],
  ["पिस्सू करने के लिए","to flee",5],
  ["ऊंचाई","height",5],
  ["स्टॉक","stock",5],
  ["शूरवीर","knight",5],
  ["घड़ी","clock",5],
  ["महल","castle / palace",5],
  ["बाड़","fence",5],
  ["दोषी","guilty",5],
  ["हल करना","to resolve",5],
  ["घुटने टेकना","to kneel",5],
  ["आराम करना","to relax",5],
  ["मंदिर","temple",5],
  ["के अतिरिक्त","besides",5],
  ["पत्रिका","magazine",5],
  ["पसंदीदा","favorite",5],
  ["आसीन","seated",5],
  ["अप्रैल","April",5],
  ["परंपरा","tradition",5],
  ["कड़वा","bitter",5],
  ["सराहना करना","to appreciate",5],
  ["विज्ञान","science",5],
  ["लोकप्रिय","popular",5],
  ["दादी","grandmother",5],
  ["आदर्श","model",5],
  ["दो कंपकंपी","to shiver",5],
  ["दैनिक","daily",5],
  ["विचार-विमर्श","discussion",5],
  ["सरदार","prince",5],
  ["आकर्षण","charm",5],
  ["पट्टी करना","to strip",5],
  ["निष्कर्ष निकालना","to conclude",5],
  ["वर्दी","uniform",5],
  ["विवरण","description",5],
  ["छत","ceiling",5],
  ["झाड़ी","bush",5],
  ["intersted","interested",5],
  ["निकट","closely",5],
  ["चिपटना","to cling",5],
  ["बेंच","bench",5],
  ["बहादुर","brave",5],
  ["संतुष्टि","satisfaction",5],
  ["क्रॉल करना","to crawl",5],
  ["बस","bus",5],
  ["साहित्यिक","literary",5],
  ["रक्तरंजित","bloody",5],
  ["तुलना करना","to compare",5],
  ["विदेशी","foreign",5],
  ["प्रस्ताव करना","to propose",5],
  ["लेखनी","pen",5],
  ["पूछताछ करना","to inquire",5],
  ["शोक","grief / sorrow",5],
  ["सहायता","aid",5],
  ["दोस्ती","friendship",5],
  ["दुर्घटना के लिए","to crash",5],
  ["साहसिक कार्य","adventure",5],
  ["लड़ने के लिए","to stride",5],
  ["संस्कृति","culture",5],
  ["किरण","beam",5],
  ["जुलूस","March",5],
  ["चश्मा","glasses",5],
  ["evne","ability",5],
  ["उत्कृष्ट","excellent",5],
  ["दृढ़ता से","firmly",5],
  ["इस्पात","steel",5],
  ["नस","nerve",5],
  ["देवदूत","angel",5],
  ["संदेह","suspicion",5],
  ["अज्ञात","unknown",5],
  ["बराबर","equal",5],
  ["तंबू","tent",5],
  ["स्मार्ट","smart",5],
  ["पीढ़ी","generation",5],
  ["sob करने के लिए","to sob",5],
  ["प्रति","per",5],
  ["När कभी","whenever",5],
  ["शिक्षा","education",5],
  ["प्रमाण","proof",5],
  ["उत्तेजित करना","to excite",5],
  ["चाबुक मारना","to whip",5],
  ["पहचान करने के लिए","to identify",5],
  ["कटोरा","bowl",5],
  ["उजागर करना","to expose",5],
  ["चेतावनी","warning",5],
  ["गहराई","depth",5],
  ["अध्याय","chapter",5],
  ["व्यवस्था","arrangement",5],
  ["दर्द से","to ache",5],
  ["घूंट पीना","to sip",5],
  ["इतालवी","Italian",5],
  ["भौं","eyebrow",5],
  ["चकनाचूर करना","to chuckle",5],
  ["गंभीरता से","seriously",5],
  ["पीछे हटना","to retreat",5],
  ["viktigheten","importance",5],
  ["अतिरिक्त","extra",5],
  ["रानी","queen",5],
  ["कलाई","wrist",5],
  ["कीचड़ में डालना","to slam",5],
  ["उत्तरदायित्व","responsibility",5],
  ["कुल मिलाकर","altogether",5],
  ["जबड़ा","jaw",5],
  ["बुरी तरह","badly",5],
  ["यात्री","passenger",5],
  ["प्रारंभिक","opening",5],
  ["जुलाई","July",5],
  ["कौशल","skill",5],
  ["मिशन","mission",5],
  ["रिवाज","custom",5],
  ["प्रवृत्ति करना","to tend",5],
  ["विधि","method",5],
  ["गाय","cow",5],
  ["उत्सुक","eager",5],
  ["योद्धा","warrior",5],
  ["दबाना","to clutch",5],
  ["अनुभव करना","to perceive",5],
  ["गुफा","cave",5],
  ["श्रेय","credit",5],
  ["प्रशंसा","praise",5],
  ["सक्षम","capable",5],
  ["भाड़े पर देना","to hire",5],
  ["संस्करण","version",5],
  ["पड़ोसी","neighbor",5],
  ["छिपाना","to conceal",5],
  ["ड्रिल करना","to bore",5],
  ["सहानुभूति","sympathy",5],
  ["जिज्ञासा","curiosity",5],
  ["दो उपकार","to oblige",5],
  ["बेल्ट","belt",5],
  ["सापेक्ष","relative",5],
  ["स्विच करने के लिए","to switch",5],
  ["मेल","mail",5],
  ["सोफ़ा","couch",5],
  ["गलियारा","corridor",5],
  ["प्रस्थान करना","to depart",5],
  ["स्पेनिश","Spanish",5],
  ["धमकी","threat",5],
  ["चीनी","Chinese",5],
  ["अत्यधिक","highly",5],
  ["नियोजित करना","to employ",5],
  ["लिंक","link",5],
  ["अनुपस्थिति","absence",5],
  ["निराशा","despair",5],
  ["संरचना","structure",5],
  ["आभारी","grateful",5],
  ["वापस लेने के लिए","to withdraw",5],
  ["नक्शा","map",5],
  ["अधिकतर","mostly",5],
  ["मंत्री","minister",5],
  ["तकिया","pillow",5],
  ["दिखाई","visible",5],
  ["पात्र","vessel",5],
  ["स्वामिनी","mistress",5],
  ["नाज़ुक","delicate",5],
  ["भ्रमित करना","to confuse",5],
  ["पेशेवर","professional",5],
  ["गर्मजोशी","warmth",5],
  ["टूटा","broken",5],
  ["थकना","to exhaust",5],
  ["मूर्खतापूर्ण","silly",5],
  ["जासूसी","detective",5],
  ["सैडल","saddle",5],
  ["क्षति","damage",5],
  ["विश्वासघात करना","to betray",5],
  ["स्वीकार करना","to acknowledge",5],
  ["गाउन","gown",5],
  ["ठोस","solid",5],
  ["अत्यंत","extremely",5],
  ["मुहावरा","phrase",5],
  ["नाखून","nail",5],
  ["साफ करना","to rent",5],
  ["बनाए रखना","to maintain",5],
  ["अगस्त","August",5],
  ["मज़दूर","worker",5],
  ["गोली","bullet",5],
  ["ट्रंक","trunk",5],
  ["konkluderer","conclusion",5],
  ["कुटिया","cottage",5],
  ["प्रतिभाशाली","brilliant",5],
  ["नागरिक","citizen",5],
  ["तेजी से","rapidly",5],
  ["सीटी देना","to whistle",5],
  ["हाल ही में","recently",5],
  ["निराश","desperate",5],
  ["पहलू","aspect",5],
  ["भ्रम की स्थिति","confusion",5],
  ["कुरूप","ugly",5],
  ["बुद्धि","intelligence",5],
  ["बहा देना","to shed",5],
  ["वक्र","curve",5],
  ["Lika","equally",5],
  ["टेप","tape",5],
  ["उद्यम करना","to venture",5],
  ["खरोंच करने के लिए","to scratch",5],
  ["गंध","scent",5],
  ["आकर्षित करना","to attract",5],
  ["विकास","development",5],
  ["दो लंगड़ा","to halt",5],
  ["पिन करना","to pin",5],
  ["भगा देना","to shove",5],
  ["मेडिकल","medical",5],
  ["ढाल","slope",5],
  ["स्वाभाविक रूप से","naturally",5],
  ["मानसिक","mental",5],
  ["बचाव करना","to defend",5],
  ["कमाने के लिए","to earn",5],
  ["कैमरा","camera",5],
  ["गंदगी","dirt",5],
  ["खोल","shell",5],
  ["भूखंड","plot",5],
  ["ताज","crown",5],
  ["सफल","successful",5],
  ["गुण","virtue",5],
  ["बाढ़","flood",5],
  ["रोम","Rome",5],
  ["पर्स","purse",5],
  ["पॉप करने के लिए","to pop",5],
  ["पुष्टि करना","to confirm",5],
  ["enorme","enormous",5],
  ["कुचल देना","to crush",5],
  ["बास्केटबाल","basket",5],
  ["आश्रय","shelter",5],
  ["थपथपाना","to pat",5],
  ["ansvarlig","responsible",5],
  ["चेतना","consciousness",5],
  ["नवीनतम","recent",5],
  ["विभाजित करना","to divide",5],
  ["अपराधी","criminal",5],
  ["अनमोल","precious",5],
  ["प्रोत्साहित करने के लिए","to encourage",5],
  ["सागर","ocean",5],
  ["जांघ","thigh",5],
  ["प्रतिबिंब","reflection",5],
  ["अंतिम संस्कार","funeral",5],
  ["विभाग","department",5],
  ["असामान्य","unusual",5],
  ["दो राजी","to persuade",5],
  ["वाहन","vehicle",5],
  ["भय","dread",5],
  ["पृष्ठभूमि","background",5],
  ["मानक","standard",5],
  ["टेलीविज़न","television",5],
  ["आरोप लगाना","to accuse",5],
].map(([word, meaning, rating]) => ({ word, meaning, rating }));

// Curated entries retain their syllable guides and existing ratings.
const CURATED_DATA =   [
    {
      "id": 1,
      "word": "होने के लिए",
      "translit": "ho-ne ke li-e",
      "meaning": "to be",
      "rating": 1
    },
    {
      "id": 2,
      "word": "तथा",
      "translit": "ta-thaa",
      "meaning": "and",
      "rating": 1
    },
    {
      "id": 3,
      "word": "सेवा मेरे",
      "translit": "se-vaa me-re",
      "meaning": "to",
      "rating": 1
    },
    {
      "id": 4,
      "word": "का",
      "translit": "kaa",
      "meaning": "of",
      "rating": 1
    },
    {
      "id": 5,
      "word": "एक",
      "translit": "ek",
      "meaning": "a / one",
      "rating": 1
    },
    {
      "id": 6,
      "word": "में",
      "translit": "men",
      "meaning": "in",
      "rating": 1
    },
    {
      "id": 7,
      "word": "है",
      "translit": "hai",
      "meaning": "is",
      "rating": 1
    },
    {
      "id": 8,
      "word": "कि",
      "translit": "ki",
      "meaning": "that",
      "rating": 1
    },
    {
      "id": 9,
      "word": "वह",
      "translit": "vah",
      "meaning": "he / she / it / that",
      "rating": 1
    },
    {
      "id": 10,
      "word": "वह था",
      "translit": "vah thaa",
      "meaning": "was",
      "rating": 1
    },
    {
      "id": 11,
      "word": "के लिए",
      "translit": "ke li-e",
      "meaning": "for",
      "rating": 1
    },
    {
      "id": 12,
      "word": "पर",
      "translit": "par",
      "meaning": "on",
      "rating": 1
    },
    {
      "id": 13,
      "word": "साथ",
      "translit": "saath",
      "meaning": "with",
      "rating": 1
    },
    {
      "id": 14,
      "word": "वे",
      "translit": "ve",
      "meaning": "they",
      "rating": 2
    },
    {
      "id": 15,
      "word": "हो",
      "translit": "ho",
      "meaning": "be",
      "rating": 2
    },
    {
      "id": 16,
      "word": "इस",
      "translit": "is",
      "meaning": "this",
      "rating": 1
    },
    {
      "id": 17,
      "word": "से",
      "translit": "se",
      "meaning": "from",
      "rating": 1
    },
    {
      "id": 18,
      "word": "द्वारा",
      "translit": "dwaa-raa",
      "meaning": "by",
      "rating": 2
    },
    {
      "id": 19,
      "word": "शब्द",
      "translit": "shabd",
      "meaning": "word",
      "rating": 2
    },
    {
      "id": 20,
      "word": "लेकिन",
      "translit": "le-kin",
      "meaning": "but",
      "rating": 1
    },
    {
      "id": 21,
      "word": "नहीं",
      "translit": "na-heen",
      "meaning": "not / no",
      "rating": 1
    },
    {
      "id": 22,
      "word": "क्या",
      "translit": "kyaa",
      "meaning": "what",
      "rating": 1
    },
    {
      "id": 23,
      "word": "सब",
      "translit": "sab",
      "meaning": "all",
      "rating": 1
    },
    {
      "id": 24,
      "word": "थे",
      "translit": "the",
      "meaning": "were",
      "rating": 2
    },
    {
      "id": 25,
      "word": "हम",
      "translit": "ham",
      "meaning": "we",
      "rating": 1
    },
    {
      "id": 26,
      "word": "जब",
      "translit": "jab",
      "meaning": "when",
      "rating": 1
    },
    {
      "id": 27,
      "word": "आपका",
      "translit": "aap-kaa",
      "meaning": "your",
      "rating": 1
    },
    {
      "id": 28,
      "word": "कर सकते हैं",
      "translit": "kar sak-te hain",
      "meaning": "can",
      "rating": 1
    },
    {
      "id": 29,
      "word": "कहा",
      "translit": "ka-haa",
      "meaning": "said",
      "rating": 2
    },
    {
      "id": 30,
      "word": "वहाँ",
      "translit": "va-haan",
      "meaning": "there",
      "rating": 1
    },
    {
      "id": 31,
      "word": "उपयोग",
      "translit": "u-pa-yog",
      "meaning": "use",
      "rating": 3
    },
    {
      "id": 32,
      "word": "प्रत्येक",
      "translit": "prat-yek",
      "meaning": "each",
      "rating": 3
    },
    {
      "id": 33,
      "word": "जो",
      "translit": "jo",
      "meaning": "which / who",
      "rating": 1
    },
    {
      "id": 34,
      "word": "करना",
      "translit": "kar-naa",
      "meaning": "to do",
      "rating": 1
    },
    {
      "id": 35,
      "word": "उनके",
      "translit": "un-ke",
      "meaning": "their",
      "rating": 2
    },
    {
      "id": 36,
      "word": "समय",
      "translit": "sa-may",
      "meaning": "time",
      "rating": 2
    },
    {
      "id": 37,
      "word": "अगर",
      "translit": "a-gar",
      "meaning": "if",
      "rating": 1
    },
    {
      "id": 38,
      "word": "होगा",
      "translit": "ho-gaa",
      "meaning": "will",
      "rating": 2
    },
    {
      "id": 39,
      "word": "कैसे",
      "translit": "kai-se",
      "meaning": "how",
      "rating": 1
    },
    {
      "id": 40,
      "word": "एक",
      "translit": "ek",
      "meaning": "an",
      "rating": 1
    },
    {
      "id": 41,
      "word": "बता",
      "translit": "ba-taa",
      "meaning": "tell",
      "rating": 2
    },
    {
      "id": 42,
      "word": "करता है",
      "translit": "kar-taa hai",
      "meaning": "does",
      "rating": 2
    },
    {
      "id": 43,
      "word": "सेट",
      "translit": "set",
      "meaning": "set",
      "rating": 3
    },
    {
      "id": 44,
      "word": "तीन",
      "translit": "teen",
      "meaning": "three",
      "rating": 2
    },
    {
      "id": 45,
      "word": "चाहते हैं",
      "translit": "chaah-te hain",
      "meaning": "want",
      "rating": 2
    },
    {
      "id": 46,
      "word": "हवा",
      "translit": "ha-vaa",
      "meaning": "air / wind",
      "rating": 2
    },
    {
      "id": 47,
      "word": "अच्छी तरह से",
      "translit": "ach-chhee ta-rah se",
      "meaning": "well",
      "rating": 3
    },
    {
      "id": 48,
      "word": "भी",
      "translit": "bhee",
      "meaning": "also / too",
      "rating": 1
    },
    {
      "id": 49,
      "word": "खेल",
      "translit": "khel",
      "meaning": "play / game",
      "rating": 2
    },
    {
      "id": 50,
      "word": "छोटे",
      "translit": "chho-te",
      "meaning": "small",
      "rating": 2
    },
    {
      "id": 51,
      "word": "अंत",
      "translit": "ant",
      "meaning": "end",
      "rating": 3
    },
    {
      "id": 52,
      "word": "डाल",
      "translit": "daal",
      "meaning": "put",
      "rating": 2
    },
    {
      "id": 53,
      "word": "घर",
      "translit": "ghar",
      "meaning": "home / house",
      "rating": 1
    },
    {
      "id": 54,
      "word": "पढ़ा",
      "translit": "pa-dhaa",
      "meaning": "read",
      "rating": 2
    },
    {
      "id": 55,
      "word": "हाथ",
      "translit": "haath",
      "meaning": "hand",
      "rating": 2
    },
    {
      "id": 56,
      "word": "बंदरगाह",
      "translit": "ban-dar-gaah",
      "meaning": "port",
      "rating": 5
    },
    {
      "id": 57,
      "word": "बड़ा",
      "translit": "ba-daa",
      "meaning": "large / big",
      "rating": 1
    },
    {
      "id": 58,
      "word": "जादू",
      "translit": "jaa-doo",
      "meaning": "spell / magic",
      "rating": 4
    },
    {
      "id": 59,
      "word": "जोड़",
      "translit": "jod",
      "meaning": "add",
      "rating": 3
    },
    {
      "id": 60,
      "word": "भूमि",
      "translit": "bhoo-mi",
      "meaning": "land",
      "rating": 4
    },
    {
      "id": 61,
      "word": "यहाँ",
      "translit": "ya-haan",
      "meaning": "here",
      "rating": 1
    },
    {
      "id": 62,
      "word": "चाहिए",
      "translit": "chaa-hi-e",
      "meaning": "must / should",
      "rating": 1
    },
    {
      "id": 63,
      "word": "उच्च",
      "translit": "uch-cha",
      "meaning": "high",
      "rating": 4
    },
    {
      "id": 64,
      "word": "ऐसा",
      "translit": "ai-saa",
      "meaning": "such",
      "rating": 2
    },
    {
      "id": 65,
      "word": "का पालन करें",
      "translit": "kaa paa-lan ka-ren",
      "meaning": "follow",
      "rating": 3
    },
    {
      "id": 66,
      "word": "अधिनियम",
      "translit": "a-dhi-ni-yam",
      "meaning": "act",
      "rating": 5
    },
    {
      "id": 67,
      "word": "क्यों",
      "translit": "kyon",
      "meaning": "why",
      "rating": 1
    },
    {
      "id": 68,
      "word": "पूछना",
      "translit": "poochh-naa",
      "meaning": "ask",
      "rating": 2
    },
    {
      "id": 69,
      "word": "पुरुषों",
      "translit": "pu-ru-shon",
      "meaning": "men",
      "rating": 3
    },
    {
      "id": 70,
      "word": "परिवर्तन",
      "translit": "pa-ri-var-tan",
      "meaning": "change",
      "rating": 4
    },
    {
      "id": 71,
      "word": "चला गया",
      "translit": "cha-laa ga-yaa",
      "meaning": "went",
      "rating": 1
    },
    {
      "id": 72,
      "word": "प्रकाश",
      "translit": "pra-kaash",
      "meaning": "light",
      "rating": 3
    },
    {
      "id": 73,
      "word": "तरह",
      "translit": "ta-rah",
      "meaning": "kind / way",
      "rating": 2
    },
    {
      "id": 74,
      "word": "बंद",
      "translit": "band",
      "meaning": "off / closed",
      "rating": 1
    },
    {
      "id": 75,
      "word": "आवश्यकता",
      "translit": "aa-vash-yak-taa",
      "meaning": "need",
      "rating": 4
    },
    {
      "id": 76,
      "word": "तस्वीर",
      "translit": "tas-veer",
      "meaning": "picture",
      "rating": 3
    },
    {
      "id": 77,
      "word": "कोशिश",
      "translit": "ko-shish",
      "meaning": "try",
      "rating": 2
    },
    {
      "id": 78,
      "word": "हमें",
      "translit": "ha-men",
      "meaning": "us",
      "rating": 1
    },
    {
      "id": 79,
      "word": "फिर",
      "translit": "phir",
      "meaning": "again / then",
      "rating": 1
    },
    {
      "id": 80,
      "word": "पशु",
      "translit": "pa-shu",
      "meaning": "animal",
      "rating": 3
    },
    {
      "id": 81,
      "word": "बिंदु",
      "translit": "bin-du",
      "meaning": "point",
      "rating": 4
    },
    {
      "id": 82,
      "word": "माँ",
      "translit": "maan",
      "meaning": "mother",
      "rating": 1
    },
    {
      "id": 83,
      "word": "दुनिया",
      "translit": "du-ni-yaa",
      "meaning": "world",
      "rating": 2
    },
    {
      "id": 84,
      "word": "निकट",
      "translit": "ni-kat",
      "meaning": "near",
      "rating": 4
    },
    {
      "id": 85,
      "word": "बनाना",
      "translit": "ba-naa-naa",
      "meaning": "build / make",
      "rating": 2
    },
    {
      "id": 86,
      "word": "आत्म",
      "translit": "aat-ma",
      "meaning": "self",
      "rating": 4
    },
    {
      "id": 87,
      "word": "पृथ्वी",
      "translit": "prith-vee",
      "meaning": "earth",
      "rating": 4
    },
    {
      "id": 88,
      "word": "पिता",
      "translit": "pi-taa",
      "meaning": "father",
      "rating": 2
    },
    {
      "id": 89,
      "word": "किसी भी",
      "translit": "ki-see bhee",
      "meaning": "any",
      "rating": 2
    },
    {
      "id": 90,
      "word": "नया",
      "translit": "na-yaa",
      "meaning": "new",
      "rating": 1
    },
    {
      "id": 91,
      "word": "काम",
      "translit": "kaam",
      "meaning": "work",
      "rating": 1
    },
    {
      "id": 92,
      "word": "हिस्सा",
      "translit": "his-saa",
      "meaning": "part",
      "rating": 2
    },
    {
      "id": 93,
      "word": "लेना",
      "translit": "le-naa",
      "meaning": "take",
      "rating": 1
    },
    {
      "id": 94,
      "word": "प्राप्त",
      "translit": "praapt",
      "meaning": "get / obtain",
      "rating": 3
    },
    {
      "id": 95,
      "word": "जगह",
      "translit": "ja-gah",
      "meaning": "place",
      "rating": 1
    },
    {
      "id": 96,
      "word": "निर्मित",
      "translit": "nir-mit",
      "meaning": "made",
      "rating": 5
    },
    {
      "id": 97,
      "word": "जीना",
      "translit": "jee-naa",
      "meaning": "live",
      "rating": 2
    },
    {
      "id": 98,
      "word": "जहाँ",
      "translit": "ja-haan",
      "meaning": "where",
      "rating": 1
    },
    {
      "id": 99,
      "word": "के बाद",
      "translit": "ke baad",
      "meaning": "after",
      "rating": 1
    },
    {
      "id": 100,
      "word": "वापस",
      "translit": "vaa-pas",
      "meaning": "back",
      "rating": 1
    },
    {
      "id": 101,
      "word": "थोड़ा",
      "translit": "tho-daa",
      "meaning": "little",
      "rating": 1
    },
    {
      "id": 102,
      "word": "केवल",
      "translit": "ke-val",
      "meaning": "only",
      "rating": 2
    },
    {
      "id": 103,
      "word": "दौर",
      "translit": "daur",
      "meaning": "round / phase",
      "rating": 4
    },
    {
      "id": 104,
      "word": "आदमी",
      "translit": "aad-mee",
      "meaning": "man",
      "rating": 1
    },
    {
      "id": 105,
      "word": "वर्ष",
      "translit": "varsh",
      "meaning": "year",
      "rating": 3
    },
    {
      "id": 106,
      "word": "आया",
      "translit": "aa-yaa",
      "meaning": "came",
      "rating": 1
    },
    {
      "id": 107,
      "word": "प्रदर्शन",
      "translit": "pra-dar-shan",
      "meaning": "show",
      "rating": 4
    },
    {
      "id": 108,
      "word": "हर",
      "translit": "har",
      "meaning": "every",
      "rating": 1
    },
    {
      "id": 109,
      "word": "अच्छा",
      "translit": "ach-chhaa",
      "meaning": "good",
      "rating": 1
    },
    {
      "id": 110,
      "word": "मुझे",
      "translit": "mu-jhe",
      "meaning": "me",
      "rating": 1
    },
    {
      "id": 111,
      "word": "दे",
      "translit": "de",
      "meaning": "give",
      "rating": 1
    },
    {
      "id": 112,
      "word": "हमारे",
      "translit": "ha-maa-re",
      "meaning": "our",
      "rating": 1
    },
    {
      "id": 113,
      "word": "नीचे",
      "translit": "nee-che",
      "meaning": "under / below",
      "rating": 1
    },
    {
      "id": 114,
      "word": "नाम",
      "translit": "naam",
      "meaning": "name",
      "rating": 1
    },
    {
      "id": 115,
      "word": "बहुत",
      "translit": "ba-hut",
      "meaning": "very",
      "rating": 1
    },
    {
      "id": 116,
      "word": "के माध्यम से",
      "translit": "ke maadh-yam se",
      "meaning": "through",
      "rating": 4
    },
    {
      "id": 117,
      "word": "बस",
      "translit": "bas",
      "meaning": "just / enough",
      "rating": 1
    },
    {
      "id": 118,
      "word": "फ़ॉर्म",
      "translit": "form",
      "meaning": "form",
      "rating": 3
    },
    {
      "id": 119,
      "word": "वाक्य",
      "translit": "vaak-ya",
      "meaning": "sentence",
      "rating": 3
    },
    {
      "id": 120,
      "word": "महान",
      "translit": "ma-haan",
      "meaning": "great",
      "rating": 3
    },
    {
      "id": 121,
      "word": "लगता है",
      "translit": "lag-taa hai",
      "meaning": "think / seems",
      "rating": 1
    },
    {
      "id": 122,
      "word": "कहना",
      "translit": "kah-naa",
      "meaning": "say",
      "rating": 1
    },
    {
      "id": 123,
      "word": "मदद",
      "translit": "ma-dad",
      "meaning": "help",
      "rating": 1
    },
    {
      "id": 124,
      "word": "कम",
      "translit": "kam",
      "meaning": "low / less",
      "rating": 1
    },
    {
      "id": 125,
      "word": "रेखा",
      "translit": "re-khaa",
      "meaning": "line",
      "rating": 3
    },
    {
      "id": 126,
      "word": "अलग",
      "translit": "a-lag",
      "meaning": "differ / separate",
      "rating": 1
    },
    {
      "id": 127,
      "word": "बारी",
      "translit": "baa-ree",
      "meaning": "turn",
      "rating": 2
    },
    {
      "id": 128,
      "word": "कारण",
      "translit": "kaa-ran",
      "meaning": "cause / reason",
      "rating": 2
    },
    {
      "id": 129,
      "word": "ज्यादा",
      "translit": "jyaa-daa",
      "meaning": "much / more",
      "rating": 1
    },
    {
      "id": 130,
      "word": "मतलब",
      "translit": "mat-lab",
      "meaning": "mean / meaning",
      "rating": 1
    },
    {
      "id": 131,
      "word": "पहले",
      "translit": "pah-le",
      "meaning": "before / first",
      "rating": 1
    },
    {
      "id": 132,
      "word": "चाल",
      "translit": "chaal",
      "meaning": "move / speed",
      "rating": 3
    },
    {
      "id": 133,
      "word": "सही",
      "translit": "sa-hee",
      "meaning": "right / correct",
      "rating": 1
    },
    {
      "id": 134,
      "word": "लड़का",
      "translit": "lad-kaa",
      "meaning": "boy",
      "rating": 1
    },
    {
      "id": 135,
      "word": "पुराना",
      "translit": "pu-raa-naa",
      "meaning": "old",
      "rating": 1
    },
    {
      "id": 136,
      "word": "भी",
      "translit": "bhee",
      "meaning": "too",
      "rating": 1
    },
    {
      "id": 137,
      "word": "वही",
      "translit": "va-hee",
      "meaning": "same",
      "rating": 1
    },
    {
      "id": 138,
      "word": "वह",
      "translit": "vah",
      "meaning": "she",
      "rating": 1
    },
    {
      "id": 139,
      "word": "सब",
      "translit": "sab",
      "meaning": "all",
      "rating": 1
    },
    {
      "id": 140,
      "word": "वहाँ",
      "translit": "va-haan",
      "meaning": "there",
      "rating": 1
    },
    {
      "id": 141,
      "word": "जब",
      "translit": "jab",
      "meaning": "when",
      "rating": 1
    },
    {
      "id": 142,
      "word": "ऊपर",
      "translit": "oo-par",
      "meaning": "up / above",
      "rating": 1
    },
    {
      "id": 143,
      "word": "उपयोग",
      "translit": "u-pa-yog",
      "meaning": "use",
      "rating": 3
    },
    {
      "id": 144,
      "word": "आपके",
      "translit": "aap-ke",
      "meaning": "your",
      "rating": 1
    },
    {
      "id": 145,
      "word": "रास्ता",
      "translit": "raas-taa",
      "meaning": "way / path",
      "rating": 1
    },
    {
      "id": 146,
      "word": "के बारे में",
      "translit": "ke baa-re men",
      "meaning": "about",
      "rating": 1
    },
    {
      "id": 147,
      "word": "कई",
      "translit": "ka-ee",
      "meaning": "many",
      "rating": 2
    },
    {
      "id": 148,
      "word": "तो",
      "translit": "to",
      "meaning": "then / so",
      "rating": 1
    },
    {
      "id": 149,
      "word": "उन्हें",
      "translit": "un-hen",
      "meaning": "them",
      "rating": 1
    },
    {
      "id": 150,
      "word": "लिखना",
      "translit": "likh-naa",
      "meaning": "write",
      "rating": 2
    },
    {
      "id": 151,
      "word": "होगा",
      "translit": "ho-gaa",
      "meaning": "would",
      "rating": 2
    },
    {
      "id": 152,
      "word": "जैसा",
      "translit": "jai-saa",
      "meaning": "like",
      "rating": 1
    },
    {
      "id": 153,
      "word": "तो",
      "translit": "to",
      "meaning": "so",
      "rating": 1
    },
    {
      "id": 154,
      "word": "इन",
      "translit": "in",
      "meaning": "these",
      "rating": 1
    },
    {
      "id": 155,
      "word": "उसके",
      "translit": "us-ke",
      "meaning": "her / his",
      "rating": 1
    },
    {
      "id": 156,
      "word": "लंबे समय तक",
      "translit": "lam-be sa-may tak",
      "meaning": "long",
      "rating": 3
    },
    {
      "id": 157,
      "word": "कर",
      "translit": "kar",
      "meaning": "make / do",
      "rating": 1
    },
    {
      "id": 158,
      "word": "बात",
      "translit": "baat",
      "meaning": "thing / talk",
      "rating": 1
    },
    {
      "id": 159,
      "word": "देखना",
      "translit": "dekh-naa",
      "meaning": "see",
      "rating": 1
    },
    {
      "id": 160,
      "word": "उसे",
      "translit": "u-se",
      "meaning": "him / her",
      "rating": 1
    },
    {
      "id": 161,
      "word": "दो",
      "translit": "do",
      "meaning": "two",
      "rating": 1
    },
    {
      "id": 162,
      "word": "है",
      "translit": "hai",
      "meaning": "has",
      "rating": 1
    },
    {
      "id": 163,
      "word": "देखो",
      "translit": "de-kho",
      "meaning": "look",
      "rating": 1
    },
    {
      "id": 164,
      "word": "अधिक",
      "translit": "a-dhik",
      "meaning": "more",
      "rating": 3
    },
    {
      "id": 165,
      "word": "दिन",
      "translit": "din",
      "meaning": "day",
      "rating": 1
    },
    {
      "id": 166,
      "word": "सकता है",
      "translit": "sak-taa hai",
      "meaning": "could",
      "rating": 2
    },
    {
      "id": 167,
      "word": "जाना",
      "translit": "jaa-naa",
      "meaning": "go",
      "rating": 1
    },
    {
      "id": 168,
      "word": "आना",
      "translit": "aa-naa",
      "meaning": "come",
      "rating": 1
    },
    {
      "id": 169,
      "word": "किया",
      "translit": "ki-yaa",
      "meaning": "did",
      "rating": 1
    },
    {
      "id": 170,
      "word": "संख्या",
      "translit": "san-khyaa",
      "meaning": "number",
      "rating": 3
    },
    {
      "id": 171,
      "word": "ध्वनि",
      "translit": "dhva-ni",
      "meaning": "sound",
      "rating": 4
    },
    {
      "id": 172,
      "word": "नहीं",
      "translit": "na-heen",
      "meaning": "no",
      "rating": 1
    },
    {
      "id": 173,
      "word": "सबसे",
      "translit": "sab-se",
      "meaning": "most",
      "rating": 1
    },
    {
      "id": 174,
      "word": "लोग",
      "translit": "log",
      "meaning": "people",
      "rating": 1
    },
    {
      "id": 175,
      "word": "मेरे",
      "translit": "me-re",
      "meaning": "my",
      "rating": 1
    },
    {
      "id": 176,
      "word": "अधिक",
      "translit": "a-dhik",
      "meaning": "over / excess",
      "rating": 3
    },
    {
      "id": 177,
      "word": "पता",
      "translit": "pa-taa",
      "meaning": "know / address",
      "rating": 1
    },
    {
      "id": 178,
      "word": "पानी",
      "translit": "paa-nee",
      "meaning": "water",
      "rating": 1
    },
    {
      "id": 179,
      "word": "से",
      "translit": "se",
      "meaning": "than",
      "rating": 1
    },
    {
      "id": 180,
      "word": "कॉल",
      "translit": "call",
      "meaning": "call",
      "rating": 1
    },
    {
      "id": 181,
      "word": "पहले",
      "translit": "pah-le",
      "meaning": "first",
      "rating": 1
    },
    {
      "id": 182,
      "word": "कौन",
      "translit": "kaun",
      "meaning": "who",
      "rating": 1
    },
    {
      "id": 183,
      "word": "मई",
      "translit": "ma-ee",
      "meaning": "May",
      "rating": 3
    },
    {
      "id": 184,
      "word": "नीचे",
      "translit": "nee-che",
      "meaning": "down",
      "rating": 1
    },
    {
      "id": 185,
      "word": "पक्ष",
      "translit": "paksh",
      "meaning": "side",
      "rating": 4
    },
    {
      "id": 186,
      "word": "गया",
      "translit": "ga-yaa",
      "meaning": "been / gone",
      "rating": 1
    },
    {
      "id": 187,
      "word": "अब",
      "translit": "ab",
      "meaning": "now",
      "rating": 1
    },
    {
      "id": 188,
      "word": "खोज",
      "translit": "khoj",
      "meaning": "find / search",
      "rating": 3
    },
    {
      "id": 189,
      "word": "सिर",
      "translit": "sir",
      "meaning": "head",
      "rating": 2
    },
    {
      "id": 190,
      "word": "खड़े",
      "translit": "kha-de",
      "meaning": "stand",
      "rating": 2
    },
    {
      "id": 191,
      "word": "खुद",
      "translit": "khud",
      "meaning": "own / self",
      "rating": 1
    },
    {
      "id": 192,
      "word": "पेज",
      "translit": "pej",
      "meaning": "page",
      "rating": 2
    },
    {
      "id": 193,
      "word": "चाहिए",
      "translit": "chaa-hi-e",
      "meaning": "should",
      "rating": 1
    },
    {
      "id": 194,
      "word": "देश",
      "translit": "desh",
      "meaning": "country",
      "rating": 2
    },
    {
      "id": 195,
      "word": "पाया",
      "translit": "paa-yaa",
      "meaning": "found",
      "rating": 2
    },
    {
      "id": 196,
      "word": "जवाब",
      "translit": "ja-vaab",
      "meaning": "answer",
      "rating": 1
    },
    {
      "id": 197,
      "word": "स्कूल",
      "translit": "skool",
      "meaning": "school",
      "rating": 1
    },
    {
      "id": 198,
      "word": "बढ़ने",
      "translit": "badh-ne",
      "meaning": "grow",
      "rating": 3
    },
    {
      "id": 199,
      "word": "अध्ययन",
      "translit": "adh-ya-yan",
      "meaning": "study",
      "rating": 4
    },
    {
      "id": 200,
      "word": "अब भी",
      "translit": "ab bhee",
      "meaning": "still",
      "rating": 2
    },
    {
      "id": 201,
      "word": "सीखना",
      "translit": "seekh-naa",
      "meaning": "learn",
      "rating": 2
    },
    {
      "id": 202,
      "word": "पौधा",
      "translit": "pau-dhaa",
      "meaning": "plant",
      "rating": 3
    },
    {
      "id": 203,
      "word": "कवर",
      "translit": "ka-var",
      "meaning": "cover",
      "rating": 3
    },
    {
      "id": 204,
      "word": "खाना",
      "translit": "khaa-naa",
      "meaning": "food / eat",
      "rating": 1
    },
    {
      "id": 205,
      "word": "सूरज",
      "translit": "soo-raj",
      "meaning": "sun",
      "rating": 2
    },
    {
      "id": 206,
      "word": "चार",
      "translit": "chaar",
      "meaning": "four",
      "rating": 1
    },
    {
      "id": 207,
      "word": "के बीच",
      "translit": "ke beech",
      "meaning": "between",
      "rating": 2
    },
    {
      "id": 208,
      "word": "राज्य",
      "translit": "raaj-ya",
      "meaning": "state",
      "rating": 3
    },
    {
      "id": 209,
      "word": "रखना",
      "translit": "rakh-naa",
      "meaning": "keep / put",
      "rating": 1
    },
    {
      "id": 210,
      "word": "आँख",
      "translit": "aankh",
      "meaning": "eye",
      "rating": 1
    },
    {
      "id": 211,
      "word": "कभी नहीं",
      "translit": "ka-bhee na-heen",
      "meaning": "never",
      "rating": 1
    },
    {
      "id": 212,
      "word": "पिछला",
      "translit": "pichh-laa",
      "meaning": "last / previous",
      "rating": 2
    },
    {
      "id": 213,
      "word": "चलो",
      "translit": "cha-lo",
      "meaning": "let / go",
      "rating": 1
    },
    {
      "id": 214,
      "word": "विचार",
      "translit": "vi-chaar",
      "meaning": "thought / idea",
      "rating": 3
    },
    {
      "id": 215,
      "word": "शहर",
      "translit": "sha-har",
      "meaning": "city",
      "rating": 2
    },
    {
      "id": 216,
      "word": "पेड़",
      "translit": "ped",
      "meaning": "tree",
      "rating": 2
    },
    {
      "id": 217,
      "word": "पार",
      "translit": "paar",
      "meaning": "cross / across",
      "rating": 2
    },
    {
      "id": 218,
      "word": "खेत",
      "translit": "khet",
      "meaning": "farm / field",
      "rating": 2
    },
    {
      "id": 219,
      "word": "कठिन",
      "translit": "ka-thin",
      "meaning": "hard / difficult",
      "rating": 3
    },
    {
      "id": 220,
      "word": "शुरुआत",
      "translit": "shu-ru-aat",
      "meaning": "start / beginning",
      "rating": 2
    },
    {
      "id": 221,
      "word": "हो सकता है",
      "translit": "ho sak-taa hai",
      "meaning": "might",
      "rating": 2
    },
    {
      "id": 222,
      "word": "कहानी",
      "translit": "ka-haa-nee",
      "meaning": "story",
      "rating": 2
    },
    {
      "id": 223,
      "word": "देखा",
      "translit": "de-khaa",
      "meaning": "saw",
      "rating": 1
    },
    {
      "id": 224,
      "word": "दूर",
      "translit": "door",
      "meaning": "far",
      "rating": 1
    },
    {
      "id": 225,
      "word": "समुद्र",
      "translit": "sa-mud-ra",
      "meaning": "sea",
      "rating": 4
    },
    {
      "id": 226,
      "word": "खींचना",
      "translit": "kheench-naa",
      "meaning": "draw / pull",
      "rating": 2
    },
    {
      "id": 227,
      "word": "बाएँ",
      "translit": "baa-en",
      "meaning": "left",
      "rating": 2
    },
    {
      "id": 228,
      "word": "देर",
      "translit": "der",
      "meaning": "late / delay",
      "rating": 1
    },
    {
      "id": 229,
      "word": "चलाना",
      "translit": "cha-laa-naa",
      "meaning": "run / drive",
      "rating": 1
    },
    {
      "id": 230,
      "word": "मत करो",
      "translit": "mat ka-ro",
      "meaning": "don't",
      "rating": 1
    },
    {
      "id": 231,
      "word": "जबकि",
      "translit": "jab-ki",
      "meaning": "while / whereas",
      "rating": 3
    },
    {
      "id": 232,
      "word": "दबाना",
      "translit": "da-baa-naa",
      "meaning": "press",
      "rating": 2
    },
    {
      "id": 233,
      "word": "करीब",
      "translit": "ka-reeb",
      "meaning": "close / near",
      "rating": 2
    },
    {
      "id": 234,
      "word": "रात",
      "translit": "raat",
      "meaning": "night",
      "rating": 1
    },
    {
      "id": 235,
      "word": "असली",
      "translit": "as-lee",
      "meaning": "real",
      "rating": 2
    },
    {
      "id": 236,
      "word": "जीवन",
      "translit": "jee-van",
      "meaning": "life",
      "rating": 3
    },
    {
      "id": 237,
      "word": "कुछ",
      "translit": "kuchh",
      "meaning": "few / some",
      "rating": 1
    },
    {
      "id": 238,
      "word": "उत्तर",
      "translit": "ut-tar",
      "meaning": "north / answer",
      "rating": 3
    },
    {
      "id": 239,
      "word": "किताब",
      "translit": "ki-taab",
      "meaning": "book",
      "rating": 2
    },
    {
      "id": 240,
      "word": "ले जाना",
      "translit": "le jaa-naa",
      "meaning": "carry",
      "rating": 2
    },
    {
      "id": 241,
      "word": "लिया",
      "translit": "li-yaa",
      "meaning": "took",
      "rating": 1
    },
    {
      "id": 242,
      "word": "विज्ञान",
      "translit": "vig-yaan",
      "meaning": "science",
      "rating": 4
    },
    {
      "id": 243,
      "word": "खाना",
      "translit": "khaa-naa",
      "meaning": "eat",
      "rating": 1
    },
    {
      "id": 244,
      "word": "कमरा",
      "translit": "kam-raa",
      "meaning": "room",
      "rating": 1
    },
    {
      "id": 245,
      "word": "दोस्त",
      "translit": "dost",
      "meaning": "friend",
      "rating": 1
    },
    {
      "id": 246,
      "word": "शुरू हुआ",
      "translit": "shu-roo hu-aa",
      "meaning": "began",
      "rating": 2
    },
    {
      "id": 247,
      "word": "विचार",
      "translit": "vi-chaar",
      "meaning": "idea",
      "rating": 3
    },
    {
      "id": 248,
      "word": "मछली",
      "translit": "machh-lee",
      "meaning": "fish",
      "rating": 2
    },
    {
      "id": 249,
      "word": "पहाड़",
      "translit": "pa-haad",
      "meaning": "mountain",
      "rating": 2
    },
    {
      "id": 250,
      "word": "रुकना",
      "translit": "ruk-naa",
      "meaning": "stop",
      "rating": 1
    },
    {
      "id": 251,
      "word": "एक बार",
      "translit": "ek baar",
      "meaning": "once",
      "rating": 1
    },
    {
      "id": 252,
      "word": "आधार",
      "translit": "aa-dhaar",
      "meaning": "base",
      "rating": 4
    },
    {
      "id": 253,
      "word": "सुनना",
      "translit": "sun-naa",
      "meaning": "hear / listen",
      "rating": 1
    },
    {
      "id": 254,
      "word": "घोड़ा",
      "translit": "gho-daa",
      "meaning": "horse",
      "rating": 3
    },
    {
      "id": 255,
      "word": "काटना",
      "translit": "kaat-naa",
      "meaning": "cut",
      "rating": 2
    },
    {
      "id": 256,
      "word": "यकीन",
      "translit": "ya-keen",
      "meaning": "sure / belief",
      "rating": 2
    },
    {
      "id": 257,
      "word": "घड़ी",
      "translit": "gha-dee",
      "meaning": "watch / clock",
      "rating": 2
    },
    {
      "id": 258,
      "word": "रंग",
      "translit": "rang",
      "meaning": "color",
      "rating": 2
    },
    {
      "id": 259,
      "word": "चेहरा",
      "translit": "cheh-raa",
      "meaning": "face",
      "rating": 2
    },
    {
      "id": 260,
      "word": "लकड़ी",
      "translit": "lak-dee",
      "meaning": "wood",
      "rating": 2
    },
    {
      "id": 261,
      "word": "मुख्य",
      "translit": "mukh-ya",
      "meaning": "main",
      "rating": 3
    },
    {
      "id": 262,
      "word": "खुला",
      "translit": "khu-laa",
      "meaning": "open",
      "rating": 1
    },
    {
      "id": 263,
      "word": "प्रतीत",
      "translit": "pra-teet",
      "meaning": "seem",
      "rating": 5
    },
    {
      "id": 264,
      "word": "एक साथ",
      "translit": "ek saath",
      "meaning": "together",
      "rating": 1
    },
    {
      "id": 265,
      "word": "अगला",
      "translit": "ag-laa",
      "meaning": "next",
      "rating": 1
    },
    {
      "id": 266,
      "word": "सफेद",
      "translit": "sa-fed",
      "meaning": "white",
      "rating": 2
    },
    {
      "id": 267,
      "word": "बच्चे",
      "translit": "bach-che",
      "meaning": "children",
      "rating": 1
    },
    {
      "id": 268,
      "word": "शुरू",
      "translit": "shu-roo",
      "meaning": "begin",
      "rating": 1
    },
    {
      "id": 269,
      "word": "मिला",
      "translit": "mi-laa",
      "meaning": "got / met",
      "rating": 1
    },
    {
      "id": 270,
      "word": "चलना",
      "translit": "chal-naa",
      "meaning": "walk",
      "rating": 1
    },
    {
      "id": 271,
      "word": "उदाहरण",
      "translit": "u-daa-ha-ran",
      "meaning": "example",
      "rating": 4
    },
    {
      "id": 272,
      "word": "आराम",
      "translit": "aa-raam",
      "meaning": "ease / rest",
      "rating": 2
    },
    {
      "id": 273,
      "word": "कागज",
      "translit": "kaa-gaz",
      "meaning": "paper",
      "rating": 2
    },
    {
      "id": 274,
      "word": "समूह",
      "translit": "sa-mooh",
      "meaning": "group",
      "rating": 4
    },
    {
      "id": 275,
      "word": "हमेशा",
      "translit": "ha-me-shaa",
      "meaning": "always",
      "rating": 1
    },
    {
      "id": 276,
      "word": "संगीत",
      "translit": "san-geet",
      "meaning": "music",
      "rating": 3
    },
    {
      "id": 277,
      "word": "उन",
      "translit": "un",
      "meaning": "those",
      "rating": 1
    },
    {
      "id": 278,
      "word": "दोनों",
      "translit": "do-non",
      "meaning": "both",
      "rating": 1
    },
    {
      "id": 279,
      "word": "निशान",
      "translit": "ni-shaan",
      "meaning": "mark / sign",
      "rating": 3
    },
    {
      "id": 280,
      "word": "अक्सर",
      "translit": "ak-sar",
      "meaning": "often",
      "rating": 2
    },
    {
      "id": 281,
      "word": "पत्र",
      "translit": "pat-ra",
      "meaning": "letter",
      "rating": 3
    },
    {
      "id": 282,
      "word": "जब तक",
      "translit": "jab tak",
      "meaning": "until",
      "rating": 2
    },
    {
      "id": 283,
      "word": "मील",
      "translit": "meel",
      "meaning": "mile",
      "rating": 3
    },
    {
      "id": 284,
      "word": "नदी",
      "translit": "na-dee",
      "meaning": "river",
      "rating": 2
    },
    {
      "id": 285,
      "word": "गाड़ी",
      "translit": "gaa-dee",
      "meaning": "car / vehicle",
      "rating": 1
    },
    {
      "id": 286,
      "word": "पैर",
      "translit": "pair",
      "meaning": "feet / leg",
      "rating": 1
    },
    {
      "id": 287,
      "word": "देखभाल",
      "translit": "dekh-bhaal",
      "meaning": "care",
      "rating": 3
    },
    {
      "id": 288,
      "word": "दूसरा",
      "translit": "doos-raa",
      "meaning": "second / other",
      "rating": 1
    },
    {
      "id": 289,
      "word": "पर्याप्त",
      "translit": "par-yaapt",
      "meaning": "enough / sufficient",
      "rating": 4
    },
    {
      "id": 290,
      "word": "सादा",
      "translit": "saa-daa",
      "meaning": "plain / simple",
      "rating": 2
    },
    {
      "id": 291,
      "word": "लड़की",
      "translit": "lad-kee",
      "meaning": "girl",
      "rating": 1
    },
    {
      "id": 292,
      "word": "हमेशा की तरह",
      "translit": "ha-me-shaa kee ta-rah",
      "meaning": "usual",
      "rating": 3
    },
    {
      "id": 293,
      "word": "युवा",
      "translit": "yu-vaa",
      "meaning": "young",
      "rating": 3
    },
    {
      "id": 294,
      "word": "तैयार",
      "translit": "tai-yaar",
      "meaning": "ready",
      "rating": 1
    },
    {
      "id": 295,
      "word": "ऊपर",
      "translit": "oo-par",
      "meaning": "above",
      "rating": 1
    },
    {
      "id": 296,
      "word": "कभी",
      "translit": "ka-bhee",
      "meaning": "ever / sometimes",
      "rating": 1
    },
    {
      "id": 297,
      "word": "लाल",
      "translit": "laal",
      "meaning": "red",
      "rating": 2
    },
    {
      "id": 298,
      "word": "सूची",
      "translit": "soo-chee",
      "meaning": "list",
      "rating": 4
    },
    {
      "id": 299,
      "word": "हालांकि",
      "translit": "haa-laan-ki",
      "meaning": "though / although",
      "rating": 3
    },
    {
      "id": 300,
      "word": "महसूस",
      "translit": "mah-soos",
      "meaning": "feel",
      "rating": 2
    }
  ];

const normalizeWord = (word) => word.trim().normalize("NFC");
const mergeWordData = () => {
  const wordsByText = new Map(
    CURATED_DATA.map((item) => [normalizeWord(item.word), { ...item }])
  );
  let nextId = Math.max(0, ...CURATED_DATA.map((item) => item.id)) + 1;

  spreadsheetWords.forEach((item) => {
    const key = normalizeWord(item.word);
    const existing = wordsByText.get(key);
    if (existing) {
      const meanings = existing.meaning.split(/\s*\/\s*/).filter(Boolean);
      item.meaning.split(/\s*\/\s*/).filter(Boolean).forEach((meaning) => {
        if (!meanings.some((current) => current.toLocaleLowerCase() === meaning.toLocaleLowerCase())) {
          meanings.push(meaning);
        }
      });
      existing.meaning = meanings.join(" / ");
      return;
    }

    wordsByText.set(key, {
      id: nextId++,
      word: item.word,
      translit: "",
      meaning: item.meaning,
      rating: item.rating,
    });
  });

  return [...wordsByText.values()];
};
const INITIAL_DATA = mergeWordData();

const COLORS = ["--c1", "--c2", "--c3", "--c4"];
const RATING_TABS = [
  ["all", "All"],
  ["1", "1 ★ (Daily)"],
  ["2", "2 ★"],
  ["3", "3 ★"],
  ["4", "4 ★"],
  ["5", "5 ★ (Rare)"],
];

const plain = (s) => s.replace(/-/g, "");

const matchRating = (item, tab) => {
  if (tab === "all") return true;
  return item.rating === Number(tab);
};

const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const speak = (text, rate = 0.85, lang = "hi-IN") =>
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

export default function WordReader() {
  const [words, setWords] = useState(INITIAL_DATA);
  const [tab, setTab] = useState("all");
  const [cur, setCur] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySeconds, setAutoPlaySeconds] = useState(5);
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

  const playWord = async (text = curRef.current?.word || "", rate = 0.85, lang = "hi-IN") => {
    if (!text) return;
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
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    s.recognition = recognition;
    setActive(-1);
    setListening(true);
    setAudioMessage("Listening… Say the Hindi word clearly.");

    recognition.onresult = (event) => {
      if (s.token !== token) return;
      const expectedWord = curRef.current.word.trim();
      const heard = Array.from(event.results[0], (result) => result.transcript.trim());
      const matched = heard.some((transcript) => transcript === expectedWord);
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
        message === "Listening… Say the Hindi word clearly."
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
    const s = st.current;
    if (!s.pool.length) {
      const filtered = wordList.filter((item) => matchRating(item, selectedTab));
      if (!filtered.length) {
        setCur(null);
        setProgress(`No words rated ${selectedTab} ★ yet`);
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

  const pickTab = (selectedTab) => {
    setTab(selectedTab);
    st.current.pool = [];
    nextWord(selectedTab);
  };

  const updateRating = (newRating) => {
    if (!cur) return;
    const updatedWords = words.map((item) =>
      item.id === cur.id ? { ...item, rating: newRating } : item
    );
    setWords(updatedWords);
    setCur({ ...cur, rating: newRating });
  };

  useEffect(() => {
    nextWord("all", INITIAL_DATA);
  }, []);

  useEffect(() => {
    if (!autoPlay || !cur || listening) return undefined;
    const timer = window.setTimeout(() => nextWord(tab), autoPlaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [autoPlay, autoPlaySeconds, cur?.id, listening, tab]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        nextWord(tab);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tab, words]);

  const parts = cur?.translit ? cur.translit.split("-") : [];

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
    setAudioMessage("Playing word slowly…");

    for (let i = 0; i < parts.length; i++) {
      if (s.token !== t) return;
      setActive(i);
      try {
        await speak(parts[i], 0.65, "en-IN");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
        setActive(-1);
        return;
      }
    }
    setActive(-1);
    if (s.token === t) {
      try {
        await speak(curRef.current.word, 0.8, "hi-IN");
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
          <h1>Hindi Daily Usage Reader</h1>
          <button type="button" className="a alt fullscreen-button" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>

        <div className="row" role="group" aria-label="Filter by daily usage rating">
          {RATING_TABS.map(([key, label]) => (
            <button
              key={key}
              className="f"
              aria-pressed={tab === key}
              onClick={() => pickTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="row autoplay-controls" role="group" aria-label="Autoplay settings">
          <button
            type="button"
            className="f"
            aria-pressed={autoPlay}
            onClick={() => setAutoPlay((enabled) => !enabled)}
            aria-label={autoPlay ? "Pause autoplay" : "Play autoplay"}
          >
            {autoPlay ? "⏸ Pause" : "▶ Play"}
          </button>
          <label className="autoplay-select">
            <span>Change word every</span>
            <select
              aria-label="Autoplay interval"
              value={autoPlaySeconds}
              onChange={(event) => setAutoPlaySeconds(Number(event.target.value))}
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
            </select>
          </label>
        </div>

        <div className="card">
          {cur ? (
            <>
              <div className="word" aria-live="polite">
                {cur.meaning}
              </div>
              {cur.word}

              <div className="rating-container">
                <span className="rating-label">Daily Usage Rating:</span>
                <div className="rating-bar" role="group" aria-label="Rate daily use from 1 to 5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${cur.rating >= star ? "filled" : ""}`}
                      onClick={() => updateRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                      title={`Set daily use rating to ${star}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {help && (
                <div className="help">
                  <div className="meaning">Meaning: {cur.meaning}</div>
                  {parts.length > 0 && (
                    <div className="chunks">
                      {parts.map((p, i) => (
                        <span
                          key={i}
                          className={i === active ? "on" : ""}
                          style={{ background: `var(${COLORS[i % 4]})` }}
                          onClick={() => playWord(p, 0.7, "en-IN")}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              playWord(p, 0.7, "en-IN");
                            }
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="tip">
                    {parts.length > 1
                      ? "Read each syllable chunk, then blend them together."
                      : cur.translit
                      ? `Pronunciation: ${plain(cur.translit)}`
                      : "Listen to the complete Hindi word for pronunciation."}
                  </p>
                </div>
              )}

              <div className="btns">
                <button className="a" onClick={onHelp}>
                  {help ? "Say slowly" : "Help"}
                </button>
                <button className="a alt" onClick={() => playWord()} disabled={!cur}>
                  Hear it
                </button>
                <button
                  className="a alt"
                  onClick={checkPronunciation}
                  disabled={!cur || listening}
                >
                  {listening ? "Listening…" : "Check pronunciation"}
                </button>
                <button className="a" onClick={() => nextWord(tab)}>
                  Next word
                </button>
              </div>
              {audioMessage && (
                <p className="audio-status" role="status" aria-live="polite">
                  {audioMessage}
                </p>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No words currently have a {tab} ★ rating.</p>
              <button className="a" onClick={() => pickTab("all")}>
                Show All Words
              </button>
            </div>
          )}
        </div>

        <p className="stat">{progress}</p>
     
      </main>
    </div>
  );
}

const CSS = `
.rwr{--bg:#f4f7fb;--card:#fff;--ink:#16233b;--mute:#5b6b85;--line:#d5deeb;--acc:#2456d6;--acc-ink:#fff;--star:#f59e0b;--c1:#ffd36b;--c2:#9ed8ff;--c3:#b9f0c4;--c4:#ffc0d0;
background:var(--bg);color:var(--ink);min-height:100vh;font:18px/1.5 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){.rwr{--bg:#0f1729;--card:#18233b;--ink:#e8eefb;--mute:#9aaac6;--line:#2c3b5c;--acc:#6c96ff;--acc-ink:#0b1226;--star:#fbbf24;--c1:#c99a1c;--c2:#2f7fb5;--c3:#2f9a58;--c4:#b5476a}}
.rwr *{box-sizing:border-box}
.rwr main{max-width:640px;margin:0 auto;padding:20px 16px 40px}
.rwr .header-row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px}
.rwr .fullscreen-button{white-space:nowrap}
.rwr:fullscreen{width:100vw;height:100vh;height:100dvh;overflow-y:auto;background:var(--bg)}
.rwr:fullscreen main{max-width:860px;padding-top:24px}
.rwr h1{font-size:1.5rem;margin:0}
.rwr .source-link{font-size:.9rem;color:var(--acc);text-decoration:none;font-weight:600}
.rwr .source-link:hover{text-decoration:underline}
.rwr .row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.rwr .autoplay-controls{align-items:center}
.rwr .autoplay-select{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0;color:var(--mute);font-size:.9rem}
.rwr .autoplay-select select{width:auto;min-width:120px;min-height:42px;border:2px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);font:inherit;padding:6px 12px}
.rwr .f{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:6px 14px;border-radius:999px;cursor:pointer;transition:background .15s,border-color .15s}
.rwr .f[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.rwr .card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:28px 12px;text-align:center}
.rwr .word{font-size:clamp(2.5rem,12vw,4.5rem);font-weight:700;line-height:1.2;margin:8px 0 6px;word-break:break-word;min-height:1.2em}
.rwr .rating-container{margin-bottom:14px}
.rwr .rating-label{display:block;font-size:0.85rem;color:var(--mute);margin-bottom:2px}
.rwr .rating-bar{display:inline-flex;gap:4px}
.rwr .star-btn{background:transparent;border:0;font-size:1.6rem;line-height:1;cursor:pointer;color:var(--line);padding:2px 4px;transition:transform .1s,color .15s}
.rwr .star-btn.filled{color:var(--star)}
.rwr .star-btn:hover{transform:scale(1.15)}
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