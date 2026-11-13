import { useState, useRef, useEffect } from "react";

 
// Dataset integrating words from your screenshot, rated by frequency of daily use (1 = most common/daily)
const INITIAL_DATA =  [
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
    }
  ];

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
  const [help, setHelp] = useState(false);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [listening, setListening] = useState(false);

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
    <div className="rwr">
      <style>{CSS}</style>
      <main>
        <div className="header-row">
          <h1>Hindi Daily Usage Reader</h1>
          
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
                  <p className="tip">
                    {parts.length > 1
                      ? "Read each syllable chunk, then blend them together."
                      : `Pronunciation: ${plain(cur.translit)}`}
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
.rwr h1{font-size:1.5rem;margin:0}
.rwr .source-link{font-size:.9rem;color:var(--acc);text-decoration:none;font-weight:600}
.rwr .source-link:hover{text-decoration:underline}
.rwr .row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
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