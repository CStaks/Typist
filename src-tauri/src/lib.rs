use serde::Serialize;
use std::{fs, path::{Path, PathBuf}};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct WindowState(pub Mutex<WindowSnapshot>);

#[derive(Default, Serialize)]
pub struct WindowSnapshot {
    pub focused: bool,
    pub maximized: bool,
}

#[derive(Default)]
pub struct WorkspaceState(pub Mutex<Option<PathBuf>>);

fn canonical_workspace(root: &Path) -> Result<PathBuf, String> {
    root.canonicalize().map_err(|error| format!("invalid workspace: {error}"))
}

fn safe_path(root: &Path, requested: &str) -> Result<PathBuf, String> {
    let root = canonical_workspace(root)?;
    let path = PathBuf::from(requested);
    let candidate = if path.is_absolute() { path } else { root.join(path) };
    let canonical = if candidate.exists() {
        candidate.canonicalize().map_err(|error| error.to_string())?
    } else {
        let parent = candidate.parent().ok_or("invalid file path")?.canonicalize().map_err(|error| error.to_string())?;
        parent.join(candidate.file_name().ok_or("invalid file path")?)
    };
    if canonical == root || !canonical.starts_with(&root) {
        return Err("path is outside the workspace".into());
    }
    Ok(canonical)
}

#[tauri::command]
pub async fn window_snapshot(app: AppHandle, state: State<'_, WindowState>) -> Result<WindowSnapshot, String> {
    let window = app.get_webview_window("main").ok_or("main window not found")?;
    let snapshot = WindowSnapshot { focused: window.is_focused().unwrap_or(false), maximized: window.is_maximized().unwrap_or(false) };
    *state.0.lock().await = WindowSnapshot { focused: snapshot.focused, maximized: snapshot.maximized };
    Ok(snapshot)
}

#[derive(Serialize)]
pub struct TreeEntry {
    pub name: String,
    pub path: String,
    pub directory: bool,
    pub children: Option<Vec<TreeEntry>>,
}

fn walk(path: &Path, root: &Path) -> Result<Vec<TreeEntry>, String> {
    let mut entries = fs::read_dir(path).map_err(|error| error.to_string())?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| !path.file_name().is_some_and(|name| name == ".git"))
        .map(|path| {
            let directory = path.is_dir();
            Ok(TreeEntry { name: path.file_name().unwrap_or_default().to_string_lossy().into_owned(), path: path.to_string_lossy().into_owned(), directory, children: directory.then(|| walk(&path, root)).transpose()? })
        })
        .collect::<Result<Vec<_>, String>>()?;
    entries.sort_by_key(|entry| (!entry.directory, entry.name.to_lowercase()));
    let _ = root;
    Ok(entries)
}

#[tauri::command]
pub async fn list_workspace(path: String, state: State<'_, WorkspaceState>) -> Result<Vec<TreeEntry>, String> {
    let root = canonical_workspace(Path::new(&path))?;
    *state.0.lock().await = Some(root.clone());
    walk(&root, &root)
}

#[tauri::command]
pub async fn read_workspace_file(path: String, state: State<'_, WorkspaceState>) -> Result<String, String> {
    let root = state.0.lock().await.clone().ok_or("workspace is not selected")?;
    fs::read_to_string(safe_path(&root, &path)?).map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn write_workspace_file(path: String, contents: String, state: State<'_, WorkspaceState>) -> Result<(), String> {
    let root = state.0.lock().await.clone().ok_or("workspace is not selected")?;
    fs::write(safe_path(&root, &path)?, contents).map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn choose_workspace(app: AppHandle, state: State<'_, WorkspaceState>) -> Result<Option<String>, String> {
    let selected = app.dialog().file().set_title("Choose workspace").blocking_pick_folder();
    let Some(path) = selected else { return Ok(None); };
    let path = path.into_path().map_err(|error| error.to_string())?;
    let root = canonical_workspace(&path)?;
    *state.0.lock().await = Some(root.clone());
    Ok(Some(root.to_string_lossy().into_owned()))
}

#[tauri::command]
pub fn choose_markdown_file(app: AppHandle) -> Option<String> {
    app.dialog().file().add_filter("Markdown", &["md", "markdown"]).blocking_pick_file().and_then(|path| path.into_path().ok()).map(|path| path.to_string_lossy().into_owned())
}

pub fn run() {
    tauri::Builder::default()
        .manage(WindowState::default())
        .manage(WorkspaceState::default())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![window_snapshot, list_workspace, read_workspace_file, write_workspace_file, choose_workspace, choose_markdown_file])
        .run(tauri::generate_context!())
        .expect("error while running Typist");
}
