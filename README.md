# Creative! App

This is a project made to help gamers review their games and theorize about creative solutions to their everyday in-game problems. Review your gameplay, use the analysis tools to better visualize your thoughts, and export them as analysis files to keep them or share with friends or coaches!

## Running the app

Go to the releases section and download your preferred method of installing depending on your Operative system. This app works for Linux, MacOS and Windows!

**On macOS:**
This application is not signed, so macOS will quarantine it by default and display an error message. In order to run the app on mac, run the following command:
`sudo xattr -r -d com.apple.quarantine /path/to/YourApp.app`

## Installing for developement

### Required Dependencies

- [nodejs and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Visual Studio IDE C++ dev dependencies](https://visualstudio.microsoft.com/downloads/):
  - This app uses Tauri and Vue, and it needs some of the Visual Studio C++ dependencies in order to compile and build both the test environment and the build.

Clone the repository, run one of the following:

- `npm install` (or `npm i`)
- `pnpm install` (or `pnpm i`)
- `yarn install` (or `yarn`)

Once dependencies are installed, run one of the following for a test environment:

- `npm run tauri dev`
- `pnpm run tauri dev`
- `yarn tauri dev`

Or run the build command with one of:

- `npm tauri build`
- `pnpm tauri build`
- `yarn tauri build`

### Usage

Select a video file to review or load an existing .an file, this will enable the playback controls and allow you to create breakpoints across the video timeline while in analysis mode. each breakpoint can have drawings, text and voice notes for you to visualize, explain and eventually store or share your gameplay analysis! In order to export an analysis file, simply create a breakpoint and click "export analysis file", and you will be prompted to save a .an file that will keep all the data you used for your gameplay analysis exactly as you made it!

## Programming Interface
For now the app handles video playback via tauri's handling of HTML's native video tag, altough the next step in developement invovles migrating the entire video playback interface to Rust in order to smoothly control faster playback and rewinding and have it be consistent across all Operative Systems.

### Video Playback State
This is handled by a custom useVideo hook. You will find a typescript file containing the type definitions of the useVideo hook in the /interfaces folder, and the actual state handling and method definitions in the useVideo file itself.

### Breakpoint State
Just like for the useVideo hook, there's a file containing the hook types in /interfaces. You can check the state management and method implementation in the useBreakpoint custom hook definition in /src/components/hooks.

### UI
The UI is handled as you would expect from a component based app. you will find most of the larger functions in src/assets/utils, and the function binding + component structure and styling within the component itself. Most of the styles are handled using CSS custom properties so that if you wanted to modify the color pallette, you can easily do so from the src/assets/globalVars.css file.
