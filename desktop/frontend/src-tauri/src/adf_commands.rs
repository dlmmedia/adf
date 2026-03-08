use serde::Serialize;
use std::fs;
use std::io::Read;

use crate::OPENED_FILES;

#[derive(Serialize)]
pub struct AdfMetadata {
    pub has_pdf: bool,
    pub has_semantic: bool,
    pub has_agent: bool,
    pub has_graph: bool,
    pub has_benchmarks: bool,
    pub has_embeddings: bool,
    pub semantic_json: Option<String>,
    pub agent_json: Option<String>,
    pub graph_json: Option<String>,
    pub benchmarks_json: Option<String>,
}

#[tauri::command]
pub fn get_opened_files() -> Vec<String> {
    OPENED_FILES.lock().unwrap_or_else(|e| e.into_inner()).clone()
}

#[tauri::command]
pub fn pop_opened_files() -> Vec<String> {
    let mut files = OPENED_FILES.lock().unwrap_or_else(|e| e.into_inner());
    let result = files.clone();
    files.clear();
    result
}

#[tauri::command]
pub fn clear_opened_files() {
    let mut files = OPENED_FILES.lock().unwrap_or_else(|e| e.into_inner());
    files.clear();
}

#[tauri::command]
pub fn open_adf_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

#[tauri::command]
pub fn extract_adf_metadata(path: String) -> Result<AdfMetadata, String> {
    let file = fs::File::open(&path)
        .map_err(|e| format!("Failed to open {}: {}", path, e))?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("Failed to read ZIP {}: {}", path, e))?;

    let mut metadata = AdfMetadata {
        has_pdf: false,
        has_semantic: false,
        has_agent: false,
        has_graph: false,
        has_benchmarks: false,
        has_embeddings: false,
        semantic_json: None,
        agent_json: None,
        graph_json: None,
        benchmarks_json: None,
    };

    for i in 0..archive.len() {
        let mut entry = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read ZIP entry: {}", e))?;
        match entry.name() {
            "document.pdf" => metadata.has_pdf = true,
            "embeddings.bin" => metadata.has_embeddings = true,
            "semantic.json" => {
                metadata.has_semantic = true;
                let mut content = String::new();
                entry.read_to_string(&mut content)
                    .map_err(|e| format!("Failed to read semantic.json: {}", e))?;
                metadata.semantic_json = Some(content);
            }
            "agent.json" => {
                metadata.has_agent = true;
                let mut content = String::new();
                entry.read_to_string(&mut content)
                    .map_err(|e| format!("Failed to read agent.json: {}", e))?;
                metadata.agent_json = Some(content);
            }
            "graph.json" => {
                metadata.has_graph = true;
                let mut content = String::new();
                entry.read_to_string(&mut content)
                    .map_err(|e| format!("Failed to read graph.json: {}", e))?;
                metadata.graph_json = Some(content);
            }
            "benchmarks.json" => {
                metadata.has_benchmarks = true;
                let mut content = String::new();
                entry.read_to_string(&mut content)
                    .map_err(|e| format!("Failed to read benchmarks.json: {}", e))?;
                metadata.benchmarks_json = Some(content);
            }
            _ => {}
        }
    }

    Ok(metadata)
}

#[tauri::command]
pub fn save_file(path: String, data: Vec<u8>) -> Result<(), String> {
    fs::write(&path, data).map_err(|e| format!("Failed to write file {}: {}", path, e))
}
