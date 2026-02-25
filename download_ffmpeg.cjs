const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const platforms = {
  "win32-x64": "ffmpeg-x86_64-pc-windows-msvc.exe",
  "linux-x64": "ffmpeg-x86_64-unknown-linux-gnu",
  "darwin-x64": "ffmpeg-x86_64-apple-darwin",
  "darwin-arm64": "ffmpeg-aarch64-apple-darwin",
};

if (!fs.existsSync("src-tauri/binaries")) {
  fs.mkdirSync("src-tauri/binaries", { recursive: true });
}

async function downloadAll() {
  for (const [p, filename] of Object.entries(platforms)) {
    const url = `https://github.com/eugeneware/ffmpeg-static/releases/download/b4.4/${p}`;
    const dest = path.join("src-tauri", "binaries", filename);

    console.log(`Downloading ${p} from eugeneware/ffmpeg-static...`);
    const response = await fetch(url, { redirect: "follow" });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    await fsPromises.writeFile(dest, Buffer.from(arrayBuffer));

    // Make executable
    await fsPromises.chmod(dest, 0o755);
    console.log(`Successfully saved to ${dest}\n`);
  }
}

downloadAll().catch((err) => {
  console.error("Download failed:", err);
  process.exit(1);
});
