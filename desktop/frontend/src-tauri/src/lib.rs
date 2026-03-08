use tauri::{AppHandle, Emitter, Manager, RunEvent, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;
use std::sync::Mutex;

mod adf_commands;

static OPENED_FILES: Mutex<Vec<String>> = Mutex::new(Vec::new());

fn add_opened_file(path: String) {
    if let Ok(mut files) = OPENED_FILES.lock() {
        files.push(path);
    }
}

fn dispatch_deep_link(app: &AppHandle, url: &str) {
    let _ = app.emit("deep-link", url.to_string());
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_focus();
        let _ = window.unminimize();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            for arg in args.iter().skip(1) {
                let path = std::path::Path::new(arg);
                if path.exists() {
                    add_opened_file(arg.clone());
                }
            }
            let _ = app.emit("files-changed", ());
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
                let _ = window.unminimize();
            }
        }))
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            for arg in args.iter().skip(1) {
                if std::path::Path::new(arg).exists() {
                    add_opened_file(arg.clone());
                }
            }

            {
                let app_handle = app.handle();
                #[cfg(any(target_os = "linux", target_os = "windows"))]
                if let Err(err) = app_handle.deep_link().register_all() {
                    log::warn!("Failed to register deep link handler: {}", err);
                }

                if let Ok(Some(urls)) = app_handle.deep_link().get_current() {
                    let initial_handle = app_handle.clone();
                    for url in urls {
                        dispatch_deep_link(&initial_handle, url.as_str());
                    }
                }

                let event_app_handle = app_handle.clone();
                app_handle.deep_link().on_open_url(move |event| {
                    for url in event.urls() {
                        dispatch_deep_link(&event_app_handle, url.as_str());
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            adf_commands::get_opened_files,
            adf_commands::pop_opened_files,
            adf_commands::clear_opened_files,
            adf_commands::open_adf_file,
            adf_commands::extract_adf_metadata,
            adf_commands::save_file,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            match event {
                RunEvent::WindowEvent {
                    event: WindowEvent::DragDrop(drag_drop_event),
                    ..
                } => {
                    use tauri::DragDropEvent;
                    match drag_drop_event {
                        DragDropEvent::Drop { paths, .. } => {
                            let mut added = false;
                            for path in paths {
                                if let Some(path_str) = path.to_str() {
                                    add_opened_file(path_str.to_string());
                                    added = true;
                                }
                            }
                            if added {
                                let _ = app_handle.emit("files-changed", ());
                            }
                        }
                        _ => {}
                    }
                }
                #[cfg(target_os = "macos")]
                RunEvent::Opened { urls } => {
                    use urlencoding::decode;
                    let mut added = false;
                    for url in urls {
                        let url_str = url.as_str();
                        if url_str.starts_with("file://") {
                            let encoded_path =
                                url_str.strip_prefix("file://").unwrap_or(url_str);
                            let file_path = match decode(encoded_path) {
                                Ok(decoded) => decoded.into_owned(),
                                Err(_) => encoded_path.to_string(),
                            };
                            add_opened_file(file_path);
                            added = true;
                        }
                    }
                    if added {
                        let _ = app_handle.emit("files-changed", ());
                    }
                }
                _ => {}
            }
        });
}
