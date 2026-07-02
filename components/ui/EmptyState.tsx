import { Sparkles } from "lucide-react";
import { Card } from "./Card";
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <Card className="flex min-h-64 flex-col items-center justify-center text-center"><Sparkles className="mb-4 h-8 w-8 text-liya-500" /><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 max-w-sm text-sm text-black/55 dark:text-white/60">{description}</p></Card>;
}
