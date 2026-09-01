import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight, FileText, Folder, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type TreeEntry = { name: string; path: string; directory: boolean; children?: TreeEntry[] };
type SidebarProps = { rootPath?: string; onSelectFile?: (path: string) => void };
const isTauri = () => Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

export function Sidebar({ rootPath = ".", onSelectFile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [entries, setEntries] = useState<TreeEntry[]>([]);
  const [error, setError] = useState<string>();
  const [workspace, setWorkspace] = useState(rootPath);

  const refresh = (path: string) => invoke<TreeEntry[]>("list_workspace", { path }).then(setEntries).catch((reason) => setError(String(reason)));
  useEffect(() => { if (isTauri()) refresh(workspace); }, [workspace]);

  const createWorkspace = async () => {
    if (!isTauri()) return;
    const name = window.prompt("Name your Typist workspace", "My Vault");
    if (!name) return;
    try { setWorkspace(await invoke<string>("create_workspace", { name })); setError(undefined); } catch (reason) { setError(String(reason)); }
  };

  const openJournal = async () => {
    if (!isTauri()) return;
    try { onSelectFile?.(await invoke<string>("open_daily_journal")); setError(undefined); } catch (reason) { setError(String(reason)); }
  };

  return <aside className="relative flex h-full shrink-0 border-r border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl"><AnimatePresence initial={false}>{!collapsed && <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 248, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden"><div className="flex h-full w-[248px] flex-col"><div className="flex h-12 items-center justify-between px-4"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Workspace</span><div className="flex gap-1"><button aria-label="Create workspace" onClick={createWorkspace} className="rounded-lg p-1.5 text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/10"><Plus size={16} /></button><button aria-label="Collapse sidebar" onClick={() => setCollapsed(true)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10"><PanelLeftClose size={16} /></button></div></div><button onClick={openJournal} className="mx-2 mb-3 flex items-center gap-2 rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-left text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/15"><BookOpen size={15} />Daily journal</button><div className="flex-1 overflow-auto px-2 pb-4">{error ? <p className="px-2 py-3 text-xs text-red-500">{error}</p> : entries.map((entry) => <TreeItem key={entry.path} entry={entry} onSelectFile={onSelectFile} />)}{!isTauri() && <p className="px-2 py-3 text-xs text-[var(--text-muted)]">Open the desktop app to browse a workspace.</p>}</div></div></motion.div>}</AnimatePresence>{collapsed && <button aria-label="Expand sidebar" onClick={() => setCollapsed(false)} className="m-2 self-start rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10"><PanelLeftOpen size={16} /></button>}</aside>;
}

function TreeItem({ entry, onSelectFile, depth = 0 }: { entry: TreeEntry; onSelectFile?: (path: string) => void; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  return <div><button onClick={() => entry.directory ? setOpen(!open) : onSelectFile?.(entry.path)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10" style={{ paddingLeft: 8 + depth * 16 }}>{entry.directory ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5" />}{entry.directory ? <Folder size={15} className="text-[var(--accent)]" /> : <FileText size={15} className="text-[var(--text-muted)]" />}<span className="truncate">{entry.name}</span></button>{entry.directory && open && entry.children?.map((child) => <TreeItem key={child.path} entry={child} depth={depth + 1} onSelectFile={onSelectFile} />)}</div>;
}
