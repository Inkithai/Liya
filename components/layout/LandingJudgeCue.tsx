"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "liya-judge-cue-dismissed";
const TOAST_KEY = "liya-judge-toast-shown";

export function LandingJudgeCue() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "true";
    setVisible(!dismissed);

    if (!window.sessionStorage.getItem(TOAST_KEY)) {
      window.sessionStorage.setItem(TOAST_KEY, "true");
      const timer = window.setTimeout(() => {
        toast("Judging Liya?", {
          description: "The 2-minute guide explains the live demo system before you try it.",
          action: { label: "Open", onClick: () => { window.location.href = "/how-it-works"; } }
        });
      }, 900);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return <div className="mx-auto mt-6 max-w-7xl px-4">
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-black/5 bg-white/62 p-4 shadow-lg shadow-black/[0.03] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-black/5 text-liya-600 dark:bg-white/10 dark:text-liya-300"><BookOpen size={18}/></span><div><b className="block">Need the judge overview?</b><p className="text-sm text-black/55 dark:text-white/60">Optional — see flow, MCP integration and uniqueness in under 2 minutes.</p></div></div>
      <div className="flex items-center gap-2"><Link href="/how-it-works"><Button size="sm" variant="secondary">Open guide</Button></Link><button aria-label="Dismiss guide suggestion" onClick={() => { window.localStorage.setItem(DISMISS_KEY, "true"); setVisible(false); }} className="focus-ring grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"><X size={16}/></button></div>
    </div>
  </div>;
}
