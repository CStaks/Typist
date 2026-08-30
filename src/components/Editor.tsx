import { Editor, defaultValueCtx, rootCtx } from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { Milkdown, useEditor } from "@milkdown/react";
import { useRef } from "react";

type EditorProps = {
  value: string;
  onChange: (markdown: string) => void;
};

export function MarkdownEditor({ value, onChange }: EditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, value);
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
            onChangeRef.current(markdown);
          });
        })
        .use(commonmark)
        .use(gfm)
        .use(listener),
    [value],
  );

  return (
    <div className="milkdown-editor mx-auto h-full w-full max-w-3xl overflow-auto px-6 py-12 font-sans text-[17px] leading-8 text-[var(--text-primary)] [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:mb-6 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h1]:tracking-[-0.04em] [&_.ProseMirror_h2]:mb-4 [&_.ProseMirror_h2]:mt-10 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-[-0.03em] [&_.ProseMirror_p]:mb-5 [&_.ProseMirror_pre]:my-6 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-xl [&_.ProseMirror_pre]:bg-[var(--code)] [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[0.9em]">
      <Milkdown />
    </div>
  );
}
