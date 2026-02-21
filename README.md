# Game Review App

This is a project made to help gamers review their games and theorize about creative solutions to their everyday in-game problems. Review your gameplay, use the analysis tools to better visualize your thoughts, and export them as analysis files to keep them or share with friends or coaches!

## Required Dependencies

- [nodejs and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Visual Studio IDE](https://visualstudio.microsoft.com/downloads/):
  - This app uses Tauri and Vue, and it needs some of the Visual Studio C++ dependencies in order to compile and build both the test environment and the build.

## Running the app

### Installing

Clone the repository, run one of the following:

- npm install (or npm i)
- pnpm install (or pnpm i)
- yarn install (or yarn)

Once dependencies are installed, run one of the following for a test environment:

- npm run tauri dev
- pnpm run tauri dev
- yarn tauri dev

Or run the build command with one of:

- npm tauri build
- pnpm tauri build
- yarn tauri build

### Usage

There's not a whole lot yet, there's only basic playback and file selection as well as basic mode switching. None of the Analysis tools do anything yet, it's just a template for future development. This app is intended to be used as a desktop application, so make sure you run a tauri dev environment or build instead of viewing it in the local browser port vue creates, since the file uploading won't work there.
