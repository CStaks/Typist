import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { FirstLaunchIntro } from "./components/FirstLaunchIntro";
import "./index.css";

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("typist-theme") === "dark");
  const [selectedFile, setSelectedFile] = useState<string>();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("typist-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[var(--canvas)] text-[var(--text-primary)]">
      <header data-tauri-drag-region className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 pl-20">
        <span className="pointer-events-none text-sm font-semibold tracking-[-0.02em]">Typist</span>
        <button aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setDark(!dark)} className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar onSelectFile={setSelectedFile} />
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-10 items-center border-b border-[var(--border)] px-6 text-xs text-[var(--text-muted)]">{selectedFile ?? "Untitled.md"}</div>
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">Your writing space</div>
        </section>
      </div>
      <FirstLaunchIntro />
    </main>
  );
}
