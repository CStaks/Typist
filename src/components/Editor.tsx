import { useEffect, useRef } from "react";

type EditorProps = { value: string; onChange: (markdown: string) => void };

export function MarkdownEditor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 overflow-auto px-6 py-12">
      <textarea
        ref={textareaRef}
        defaultValue={value}
        aria-label="Markdown document"
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        placeholder="Start writing…"
        className="min-h-full w-full resize-none border-0 bg-transparent font-sans text-[17px] leading-8 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
}
