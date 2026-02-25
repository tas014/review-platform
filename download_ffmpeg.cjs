const ffbinaries = require("ffbinaries");
const fs = require("fs");
const path = require("path");
const os = require("os");

const platforms = {
  "linux-64": "ffmpeg-x86_64-unknown-linux-gnu",
  "windows-64": "ffmpeg-x86_64-pc-windows-msvc.exe",
  "mac-64": "ffmpeg-x86_64-apple-darwin",
  "mac-arm-64": "ffmpeg-aarch64-apple-darwin",
};

if (!fs.existsSync("src-tauri/binaries")) {
  fs.mkdirSync("src-tauri/binaries", { recursive: true });
}

async function downloadAll() {
  for (const [p, filename] of Object.entries(platforms)) {
    const tempDir = path.join(os.tmpdir(), "ffbinaries", p);
    await new Promise((resolve, reject) => {
      ffbinaries.downloadBinaries(
        ["ffmpeg"],
        { platform: p, destination: tempDir },
        (err, data) => {
          if (err) {
            console.error("Failed on " + p, err);
            return reject(err);
          }
          const src = path.join(
            tempDir,
            p === "windows-64" ? "ffmpeg.exe" : "ffmpeg",
          );
          const dest = path.join("src-tauri", "binaries", filename);
          fs.copyFileSync(src, dest);
          fs.chmodSync(dest, 0o755);
          console.log("Successfully saved to " + dest);
          resolve();
        },
      );
    });
  }
}

downloadAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
