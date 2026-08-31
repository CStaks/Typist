import { Editor, defaultValueCtx, editorViewCtx, rootCtx } from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { Milkdown, useEditor } from "@milkdown/react";
import { useEffect, useRef } from "react";

type EditorProps = { value: string; onChange: (markdown: string) => void };

export function MarkdownEditor({ value, onChange }: EditorProps) {
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;

  const { get } = useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, valueRef.current);
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => onChangeRef.current(markdown));
        })
        .use(commonmark)
        .use(gfm)
        .use(listener),
    [],
  );

  useEffect(() => {
    if (value === valueRef.current) return;
    valueRef.current = value;
    get()?.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const parser = view.state.schema.topNodeType;
      const text = value ? view.state.schema.text(value) : undefined;
      const doc = parser.createAndFill(null, text ? [text] : undefined);
      if (doc) view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content));
    });
  }, [get, value]);

  useEffect(() => { valueRef.current = value; }, [value]);

  return (
    <div className="milkdown-editor mx-auto h-full w-full max-w-3xl overflow-auto px-6 py-12 font-sans text-[17px] leading-8 text-[var(--text-primary)] [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:mb-6 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h1]:tracking-[-0.04em] [&_.ProseMirror_h2]:mb-4 [&_.ProseMirror_h2]:mt-10 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-[-0.03em] [&_.ProseMirror_p]:mb-5 [&_.ProseMirror_pre]:my-6 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-xl [&_.ProseMirror_pre]:bg-[var(--code)] [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[0.9em]">
      <Milkdown />
    </div>
  );
}
