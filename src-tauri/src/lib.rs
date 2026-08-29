use std::{fs, path::PathBuf};
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
        .invoke_handler(tauri::generate_handler![window_snapshot, read_workspace_file, write_workspace_file])
        .run(tauri::generate_context!())
        .expect("error while running Typist");
}
