import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Bell, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { FirstLaunchIntro } from "./components/FirstLaunchIntro";
import { MarkdownEditor } from "./components/Editor";
import { hasNewerCommit, releasesUrl } from "./utils/updateChecker";
import "./index.css";

const currentCommit = import.meta.env.VITE_COMMIT_SHA ?? "";

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("typist-theme") === "dark");
  const [selectedFile, setSelectedFile] = useState<string>();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("typist-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    hasNewerCommit(currentCommit).then(setUpdateAvailable).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedFile) { setContent(""); setIsDirty(false); return; }
    let active = true;
    setLoading(true);
    readTextFile(selectedFile)
      .then((text) => { if (active) { setContent(text); setIsDirty(false); } })
      .catch(() => active && setContent(""))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [selectedFile]);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const handleChange = (next: string) => {
    setContent(next);
    if (!selectedFile) return;
    setIsDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      writeTextFile(selectedFile, next).then(() => setIsDirty(false)).catch(() => undefined);
    }, 700);
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[var(--canvas)] text-[var(--text-primary)]">
      <header data-tauri-drag-region className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 pl-20">
        <div className="pointer-events-none flex items-center gap-2 text-sm font-semibold tracking-[-0.02em]"><img src="/assets/typist.png" alt="" className="h-6 w-6 rounded-md object-contain" />Typist</div>
        <div className="flex items-center gap-1">
          {updateAvailable && <a href={releasesUrl} target="_blank" rel="noreferrer" aria-label="Update available" className="rounded-lg p-2 text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/10"><Bell size={16} /></a>}
          <button aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setDark((value) => !value)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar onSelectFile={setSelectedFile} />
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-10 items-center border-b border-[var(--border)] px-6 text-xs text-[var(--text-muted)]">{selectedFile ?? "Untitled.md"}{isDirty && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-label="Unsaved changes" />}</div>
          {loading ? <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">Opening document…</div> : <MarkdownEditor value={content} onChange={handleChange} />}
        </section>
      </div>
      <FirstLaunchIntro />
    </main>
  );
}
