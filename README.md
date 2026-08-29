# Typist

A small, local-first Markdown editor for macOS, Windows, and Linux. Typist uses Tauri for native windows and React for the editing surface.

## Scaffold

```sh
bun create tauri-app typist --template react-ts
cd typist
bun add framer-motion
bun add -d tailwindcss postcss autoprefixer
bunx tailwindcss init -p
```

Replace the generated `src/index.css`, add `src/components/FirstLaunchIntro.tsx`, and place the native commands in `src-tauri/src/lib.rs` and `src-tauri/src/main.rs`.

## Run

```sh
bun install
bun tauri dev
```

## Structure

```text
src/
  components/FirstLaunchIntro.tsx
  index.css
src-tauri/
  src/lib.rs
  src/main.rs
README.md
```

The filesystem commands are intentionally small. Add path validation and workspace boundaries before exposing them to untrusted input.

## License

MIT
