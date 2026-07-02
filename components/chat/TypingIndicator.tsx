export function TypingIndicator() {
  return <div className="flex items-center gap-2 rounded-3xl bg-white/80 px-4 py-3 text-sm shadow-sm dark:bg-white/10"><span>Liya is thinking</span><span className="flex gap-1">{[0,1,2].map((i) => <i key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-liya-500" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div>;
}
