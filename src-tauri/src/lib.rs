use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{Read, Seek, SeekFrom, Write};
use std::sync::Mutex;
use std::thread;
use zip::write::SimpleFileOptions;

// Global storage for the server port
#[cfg(target_os = "linux")]
static SERVER_PORT: Lazy<Mutex<u16>> = Lazy::new(|| Mutex::new(0));

#[cfg(target_os = "linux")]
#[tauri::command]
fn get_video_server_port() -> u16 {
    *SERVER_PORT.lock().unwrap()
}

#[cfg(not(target_os = "linux"))]
#[tauri::command]
fn get_video_server_port() -> u16 {
    0
}

#[cfg(target_os = "linux")]
fn start_video_server() {
    thread::spawn(move || {
        let server = match tiny_http::Server::http("127.0.0.1:0") {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Failed to start video server: {}", e);
                return;
            }
        };

        let port = match server.server_addr() {
            tiny_http::ListenAddr::IP(addr) => addr.port(),
            _ => {
                eprintln!("Server listening on unknown address type");
                return;
            }
        };
        *SERVER_PORT.lock().unwrap() = port;

        for request in server.incoming_requests() {
            let method = request.method().clone();
            if method == tiny_http::Method::Options {
                let headers = vec![
                    tiny_http::Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
                    tiny_http::Header::from_bytes("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS").unwrap(),
                    tiny_http::Header::from_bytes("Access-Control-Allow-Headers", "*").unwrap(),
                ];
                let mut response = tiny_http::Response::empty(204);
                for header in headers {
                    response = response.with_header(header);
                }
                let _ = request.respond(response);
                continue;
            }

            let url = request.url().to_string();
            
            // Extract the path from the query parameter 
            let path_encoded = if let Some(idx) = url.find("?path=") {
                &url[idx + 6..]
            } else {
                let _ = request.respond(tiny_http::Response::empty(400));
                continue;
            };

            // Decode URL
            let path = match urlencoding::decode(path_encoded) {
                Ok(p) => p.into_owned(),
                Err(_) => {
                    let _ = request.respond(tiny_http::Response::empty(400));
                    continue;
                }
            };

            let file = match File::open(&path) {
                Ok(f) => f,
                Err(e) => {
                    eprintln!("Failed to open file: {}", e);
                    let _ = request.respond(tiny_http::Response::empty(404));
                    continue;
                }
            };

            let len = match file.metadata() {
                Ok(m) => m.len(),
                Err(_) => {
                    let _ = request.respond(tiny_http::Response::empty(500));
                    continue;
                }
            };

            let mime_type = mime_guess::from_path(&path)
                .first_or_octet_stream()
                .to_string();

            // Handle Range Header
            let mut start = 0;
            let mut end = len - 1;
            let mut status_code = 200;

            // Simple range parsing for tiny_http
            for header in request.headers() {
                if header.field.equiv("Range") {
                    let range_value = header.value.as_str();
                    if let Some(range_str) = range_value.strip_prefix("bytes=") {
                        let parts: Vec<&str> = range_str.split('-').collect();
                        if parts.len() >= 1 {
                            if let Ok(s) = parts[0].parse::<u64>() {
                                start = s;
                            }
                            if parts.len() > 1 && !parts[1].is_empty() {
                                if let Ok(e) = parts[1].parse::<u64>() {
                                    end = e;
                                }
                            }
                        }
                        status_code = 206;
                    }
                }
            }

            if start >= len {
                let _ = request.respond(tiny_http::Response::empty(416));
                continue;
            }

            if end >= len {
                end = len - 1;
            }

            // Cap chunk size to 4MB for safety
            let mut chunk_len = (end - start + 1) as usize;
            if status_code == 206 {
                let max_chunk_size = 4 * 1024 * 1024;
                if (end - start + 1) > max_chunk_size {
                    end = start + max_chunk_size - 1;
                    chunk_len = (end - start + 1) as usize;
                }
            }

            let mut file = file;
            if let Err(_) = file.seek(SeekFrom::Start(start)) {
                let _ = request.respond(tiny_http::Response::empty(500));
                continue;
            }

            let reader = file.take(chunk_len as u64);

            // Create Response
            let mut headers = vec![
                tiny_http::Header::from_bytes("Content-Type", mime_type.as_bytes()).unwrap(),
                tiny_http::Header::from_bytes("Accept-Ranges", "bytes").unwrap(),
                tiny_http::Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
            ];

            if status_code == 206 {
                let range_str = format!("bytes {}-{}/{}", start, end, len);
                headers.push(
                    tiny_http::Header::from_bytes("Content-Range", range_str.as_bytes()).unwrap(),
                );
            }

            let response = tiny_http::Response::new(
                tiny_http::StatusCode(status_code),
                headers,
                reader,
                Some(chunk_len),
                None,
            );

            let _ = request.respond(response);
        }
    });
}

#[tauri::command]
fn unpack_analysis_file(archive_path: String, target_dir: String) -> Result<String, String> {
    let file = File::open(&archive_path).map_err(|e| format!("Failed to open archive: {}", e))?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("Failed to read zip: {}", e))?;

    let mut data_json_content = String::new();

    // Ensure foundational directories always exist for the frontend even if the zip is empty
    let base_path = std::path::Path::new(&target_dir);
    fs::create_dir_all(&base_path).map_err(|e| format!("Failed to create base dir: {}", e))?;
    fs::create_dir_all(&base_path.join("audio")).map_err(|e| format!("Failed to create base audio dir: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| format!("Failed to read zip file {}: {}", i, e))?;
        let outpath = match file.enclosed_name() {
            Some(path) => std::path::Path::new(&target_dir).join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| format!("Failed to create dir: {}", e))?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).map_err(|e| format!("Failed to create parent dir: {}", e))?;
                }
            }
            let mut outfile = File::create(&outpath).map_err(|e| format!("Failed to create file {:?}: {}", outpath, e))?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| format!("Failed to extract file {:?}: {}", outpath, e))?;

            // If it's data.json, we also want to return its contents to the frontend
            if file.name() == "data.json" {
                // Re-open to read into string since io::copy exhausts the reader
                let mut re_file = File::open(&outpath).map_err(|e| format!("Failed to re-open data.json: {}", e))?;
                re_file.read_to_string(&mut data_json_content).map_err(|e| format!("Failed to read data.json: {}", e))?;
            }
        }
    }

    if data_json_content.is_empty() {
        return Err("data.json not found in archive".to_string());
    }

    Ok(data_json_content)
}

#[tauri::command]
fn pack_analysis_file(
    save_path: String,
    video_path: String,
    data_json: String,
    audio_paths: HashMap<String, String>,
) -> Result<(), String> {
    let file = File::create(&save_path).map_err(|e| format!("Failed to create save file: {}", e))?;
    let mut zip = zip::ZipWriter::new(file);

    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    // 1. Write data.json
    zip.start_file("data.json", options).map_err(|e| format!("Failed to start data.json: {}", e))?;
    zip.write_all(data_json.as_bytes()).map_err(|e| format!("Failed to write data.json: {}", e))?;

    // 2. Stream video file
    let extension = std::path::Path::new(&video_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("mp4");
    
    zip.start_file(format!("video.{}", extension), options).map_err(|e| format!("Failed to start video file: {}", e))?;
    let mut video_file = File::open(&video_path).map_err(|e| format!("Failed to open video file: {}", e))?;
    std::io::copy(&mut video_file, &mut zip).map_err(|e| format!("Failed to stream video to zip: {}", e))?;

    // 3. Stream audio files
    if !audio_paths.is_empty() {
        zip.add_directory("audio", options).map_err(|e| format!("Failed to add audio dir: {}", e))?;
        for (filename, path) in audio_paths {
            zip.start_file(format!("audio/{}", filename), options).map_err(|e| format!("Failed to start audio file {}: {}", filename, e))?;
            let mut audio_file = File::open(&path).map_err(|e| format!("Failed to open audio file {}: {}", path, e))?;
            std::io::copy(&mut audio_file, &mut zip).map_err(|e| format!("Failed to stream audio file to zip: {}", e))?;
        }
    }

    zip.finish().map_err(|e| format!("Failed to finish zip: {}", e))?;

    Ok(())
}

#[cfg(not(target_os = "linux"))]
fn start_video_server() {}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    start_video_server();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_audio_recorder::init())
        .invoke_handler(tauri::generate_handler![
            get_video_server_port,
            unpack_analysis_file,
            pack_analysis_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
