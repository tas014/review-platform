use once_cell::sync::Lazy;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::sync::Mutex;
use std::thread;

// Global storage for the server port
static SERVER_PORT: Lazy<Mutex<u16>> = Lazy::new(|| Mutex::new(0));

#[tauri::command]
fn get_video_server_port() -> u16 {
    *SERVER_PORT.lock().unwrap()
}

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
        eprintln!("Video server listening on http://127.0.0.1:{}", port);

        for request in server.incoming_requests() {
            let url = request.url().to_string();
            // Tiny_http URL includes the leading slash, e.g., "/home/user/..."
            // We need to parse it correctly.

            // Decode URL
            let path = match urlencoding::decode(&url) {
                Ok(p) => p.into_owned(),
                Err(_) => {
                    let _ = request.respond(tiny_http::Response::empty(400));
                    continue;
                }
            };

            // Handle path (windows vs linux)
            #[cfg(target_os = "windows")]
            let path = path.trim_start_matches('/');

            #[cfg(not(target_os = "windows"))]
            let path = &path; // On Linux, the URL path IS the file path if it starts with /

            let file = match File::open(path) {
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

            let mime_type = mime_guess::from_path(path)
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
            let max_chunk_size = 4 * 1024 * 1024;
            if (end - start + 1) > max_chunk_size {
                end = start + max_chunk_size - 1;
            }

            let chunk_len = (end - start + 1) as usize;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    start_video_server();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_audio_recorder::init())
        .invoke_handler(tauri::generate_handler![get_video_server_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
