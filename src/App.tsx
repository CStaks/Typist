import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Bell, Minus, Moon, Square, Sun, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { FirstLaunchIntro } from "./components/FirstLaunchIntro";
import { MarkdownEditor } from "./components/Editor";
import { hasNewerCommit, releasesUrl } from "./utils/updateChecker";
import typistLogo from "../assets/typist.png";
import "./index.css";

const currentCommit = import.meta.env.VITE_COMMIT_SHA ?? "";
const appVersion = import.meta.env.VITE_APP_VERSION ?? "0.1.1";

const isTauri = () => Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("typist-theme") === "dark");
  const [selectedFile, setSelectedFile] = useState<string>();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(() => localStorage.getItem("typist-intro-dismissed") === "true");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const windowControls = isTauri() ? getCurrentWindow() : undefined;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("typist-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    hasNewerCommit(currentCommit).then(setUpdateAvailable).catch(() => undefined);
    if (windowControls) windowControls.isMaximized().then(setIsMaximized).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedFile || !isTauri()) {
      setContent("");
      setIsDirty(false);
      return;
    }
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
    if (!selectedFile || !isTauri()) return;
    setIsDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      writeTextFile(selectedFile, next).then(() => setIsDirty(false)).catch(() => undefined);
    }, 700);
  };

  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-[var(--canvas)] text-[var(--text-primary)]">
      <header data-tauri-drag-region className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 pl-20">
        <div className="pointer-events-none flex items-center gap-2 text-sm font-semibold tracking-[-0.02em]"><img src={typistLogo} alt="Typist logo" className="h-6 w-6 rounded-md object-contain" />Typist <span className="text-xs font-normal text-[var(--text-muted)]">{appVersion}</span></div>
        <div className="flex items-center gap-1">
          {updateAvailable && <a href={releasesUrl} target="_blank" rel="noreferrer" aria-label="Update available" className="rounded-lg p-2 text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/10"><Bell size={16} /></a>}
          <button aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setDark((value) => !value)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          {windowControls && <div className="ml-2 flex items-center" data-tauri-drag-region="false"><button aria-label="Minimize window" onClick={() => void windowControls.minimize()} className="p-2 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10"><Minus size={15} /></button><button aria-label={isMaximized ? "Restore window" : "Maximize window"} onClick={() => { void windowControls.toggleMaximize(); setIsMaximized((value) => !value); }} className="p-2 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10">{isMaximized ? <span className="text-xs">▣</span> : <Square size={12} />}</button><button aria-label="Close window" onClick={() => void windowControls.close()} className="p-2 text-[var(--text-muted)] hover:bg-red-500 hover:text-white"><X size={15} /></button></div>}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar onSelectFile={setSelectedFile} />
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-10 shrink-0 items-center border-b border-[var(--border)] px-6 text-xs text-[var(--text-muted)]">{selectedFile ?? "Untitled.md"}{isDirty && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-label="Unsaved changes" />}</div>
          {loading ? <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">Opening document…</div> : <MarkdownEditor value={content} onChange={handleChange} />}
        </section>
      </div>
      {!introDismissed && <FirstLaunchIntro onDismiss={() => { localStorage.setItem("typist-intro-dismissed", "true"); setIntroDismissed(true); }} />}
    </main>
  );
}
