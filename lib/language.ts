import type { Language } from"@/types";

const sinhala = /[\u0D80-\u0DFF]/;
const tamil = /[\u0B80-\u0BFF]/;
const localRomanWords = /\b(akka|aiya|ayya|aiye|ane|hari|machan|machang|mata|mama|mage|oya|oyata|eyata|api|apita|eka|ekak|eken|kiyanna|balanna|danna|denna|ganna|ona|one|epa|thiyenawa|puluwan|kohomada|monawada|lassana|podiyata|amma|thaththa|nangi|malli|aiyo|aiyoo|vanakkam|enakku|ungal|unga|venum|vendum|nalla|seri|sari|epdi|eppadi|sapadu|gift eka|delivery eka)\b/i;
const englishSignals = /\b(the|this|that|please|delivery|checkout|budget|gift|order|track|today|tomorrow|wife|friend|mother|father)\b/i;

export function detectLanguage(text: string): Language {
 if (sinhala.test(text)) return"si";
 if (tamil.test(text)) return"ta";
 const localMatches = text.match(localRomanWords)?.length ?? 0;
 const englishMatches = text.match(englishSignals)?.length ?? 0;
 if (localMatches > 0 && (localMatches >= englishMatches || /\b(eka|ekak|mata|mama|oya|venum|nalla|seri|epdi)\b/i.test(text))) return"tanglish";
 return"en";
}

export function languageLabel(language: Language) {
 if (language ==="si") return"Sinhala";
 if (language ==="ta") return"Tamil";
 if (language ==="tanglish") return"Singlish / Tanglish";
 return"English";
}

export function liyaGreeting(language: Language) {
 switch (language) {
 case"si": return"ආයුබෝවන්! මම Liya. කාටද මේ තෑග්ග?";
 case"ta": return"வணக்கம்! நான் Liya. யாருக்காக shopping பண்ணலாம்?";
 case"tanglish": return"Hi hi! Liya here — kaatada gift eka? Budget eka kiyanna, lassana deyak set karamu.";
 default: return"Hi, I’m Liya — your Sri Lankan shopping friend. Who are we shopping for today?";
 }
}

export function friendlyLine(language: Language, english: string) {
 if (language ==="si") return `${english} හරි, මේක ලස්සනට සෙට් කරමු.`;
 if (language ==="ta") return `${english} சரி, இதை அழகா set பண்ணலாம்.`;
 if (language ==="tanglish") return `${english} hari, patta choice ekak balamu.`;
 return english;
}
