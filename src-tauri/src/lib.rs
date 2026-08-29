use std::{fs, path::PathBuf};
use serde::Serialize;
use tauri::{AppHandle, Manager, State};
use tokio::sync::Mutex;

#[derive(Default)]
pub struct WindowState(pub Mutex<WindowSnapshot>);

#[derive(Default, serde::Serialize)]
pub struct WindowSnapshot {
    pub focused: bool,
    pub maximized: bool,
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

#[tauri::command]
pub fn list_workspace(path: String) -> Result<Vec<TreeEntry>, String> {
    fn walk(path: &PathBuf) -> Result<Vec<TreeEntry>, String> {
        let mut entries = fs::read_dir(path).map_err(|error| error.to_string())?
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| !path.file_name().is_some_and(|name| name == ".git"))
            .map(|path| {
                let directory = path.is_dir();
                Ok(TreeEntry { name: path.file_name().unwrap_or_default().to_string_lossy().into_owned(), path: path.to_string_lossy().into_owned(), directory, children: directory.then(|| walk(&path)).transpose()? })
            })
            .collect::<Result<Vec<_>, String>>()?;
        entries.sort_by_key(|entry| (!entry.directory, entry.name.to_lowercase()));
        Ok(entries)
    }
    walk(&PathBuf::from(path))
}

#[tauri::command]
pub fn read_workspace_file(path: String) -> Result<String, String> {
    fs::read_to_string(PathBuf::from(path)).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn write_workspace_file(path: String, contents: String) -> Result<(), String> {
    fs::write(PathBuf::from(path), contents).map_err(|error| error.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .manage(WindowState::default())
        .invoke_handler(tauri::generate_handler![window_snapshot, list_workspace, read_workspace_file, write_workspace_file])
        .run(tauri::generate_context!())
        .expect("error while running Typist");
}
