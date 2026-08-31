import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type FirstLaunchIntroProps = { onDismiss?: () => void };

const keybinds = [
  ["⌘ / Ctrl", "P", "Command palette"],
  ["⌘ / Ctrl", "S", "Save document"],
  ["⌘ / Ctrl", "⇧", "Toggle focus mode"],
];

export function FirstLaunchIntro({ onDismiss }: FirstLaunchIntroProps) {
  const [open, setOpen] = useState(true);
  const dismiss = () => { setOpen(false); onDismiss?.(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
          className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.section
            className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--glass)] p-8 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", damping: 1.0, stiffness: 160 }}
          >
            <div className="mb-5 flex items-center gap-3"><img src="/assets/typist.png" alt="Typist" className="h-12 w-12 rounded-2xl object-contain shadow-sm" onError={(event) => { event.currentTarget.style.display = "none"; }} /><p className="text-sm font-medium text-[var(--accent)]">Welcome to Typist</p></div>
            <h1 id="intro-title" className="text-3xl font-semibold tracking-[-0.04em]">Write without getting in the way.</h1>
            <p className="mt-3 leading-6 text-[var(--text-muted)]">Markdown stays close. Formatting appears as you write, and every file remains local to your workspace.</p>
            <div className="my-7 space-y-3">
              {keybinds.map(([modifier, key, label]) => (
                <div className="flex items-center gap-3 text-sm" key={label}>
                  <kbd className="rounded-lg border border-[var(--border)] bg-[var(--code)] px-2 py-1 font-mono text-xs">{modifier}</kbd>
                  <kbd className="rounded-lg border border-[var(--border)] bg-[var(--code)] px-2 py-1 font-mono text-xs">{key}</kbd>
                  <span className="text-[var(--text-muted)]">{label}</span>
                </div>
              ))}
            </div>
            <button onClick={dismiss} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white transition-transform active:scale-[.98]">Start writing</button>
            <button onClick={dismiss} className="mt-3 w-full py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Show this again later</button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
