import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, FileText, Folder, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type TreeEntry = { name: string; path: string; directory: boolean; children?: TreeEntry[] };

type SidebarProps = { rootPath?: string; onSelectFile?: (path: string) => void };

export function Sidebar({ rootPath = ".", onSelectFile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [entries, setEntries] = useState<TreeEntry[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    invoke<TreeEntry[]>("list_workspace", { path: rootPath })
      .then((result) => active && setEntries(result))
      .catch((reason) => active && setError(String(reason)));
    return () => { active = false; };
  }, [rootPath]);

  return (
    <aside className="relative flex h-full shrink-0 border-r border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl">
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 248, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 1.0, stiffness: 180 }}
            className="overflow-hidden"
          >
            <div className="flex h-full w-[248px] flex-col">
              <div className="flex h-12 items-center justify-between px-4">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Workspace</span>
                <button aria-label="Collapse sidebar" onClick={() => setCollapsed(true)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10"><PanelLeftClose size={16} /></button>
              </div>
              <div className="flex-1 overflow-auto px-2 pb-4">
                {error ? <p className="px-2 py-3 text-xs text-red-500">{error}</p> : entries.map((entry) => <TreeItem key={entry.path} entry={entry} onSelectFile={onSelectFile} />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {collapsed && <button aria-label="Expand sidebar" onClick={() => setCollapsed(false)} className="m-2 self-start rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10"><PanelLeftOpen size={16} /></button>}
    </aside>
  );
}

function TreeItem({ entry, onSelectFile, depth = 0 }: { entry: TreeEntry; onSelectFile?: (path: string) => void; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  return (
    <div>
      <button onClick={() => entry.directory ? setOpen(!open) : onSelectFile?.(entry.path)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10" style={{ paddingLeft: 8 + depth * 16 }}>
        {entry.directory ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5" />}
        {entry.directory ? <Folder size={15} className="text-[var(--accent)]" /> : <FileText size={15} className="text-[var(--text-muted)]" />}
        <span className="truncate">{entry.name}</span>
      </button>
      {entry.directory && open && entry.children?.map((child) => <TreeItem key={child.path} entry={child} depth={depth + 1} onSelectFile={onSelectFile} />)}
    </div>
  );
}
