import type { Language } from"@/types";

const sinhala = /[\u0D80-\u0DFF]/;
const tamil = /[\u0B80-\u0BFF]/;
const tanglishWords = /\b(akka|aiya|machan|mata|ona|venum|nalla|seri|epdi|gift eka|delivery eka|lassana|podiyata|amma|thaththa)\b/i;

export function detectLanguage(text: string): Language {
 if (sinhala.test(text)) return"si";
 if (tamil.test(text)) return"ta";
 if (tanglishWords.test(text)) return"tanglish";
 return"en";
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
