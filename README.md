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

## Branding

This project utilizes the following scheme:
|  | Light Mode | Dark Mode |
| --- | --- | --- |
| **Primary** | `#FCFCFD` | `#1C1C1E` |
| **Secondary** | `#F2F2F7` | `#2C2C2E` |
| **Accent** | `#007AFF` | `#0A84FF` |
| **Background** | `#FCFCFD` | `#1C1C1E` |
| **Text** | `#1D1D1F` | `#F5F5F7` |

## License

MIT
