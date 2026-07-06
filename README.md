# CropGuard AI — crop

This is a lightweight product-style crop for CropGuard AI (leaf disease detection and advisory).

Quick preview

- Open directly in Chrome: `crop/index.html` — works as a zero-install crop for most features.
- Serve locally (recommended):

  Python HTTP server (works cross-platform):

  ```bash
  python -m http.server 8000
  ```

  Then open: http://localhost:8000/crop/index.html

- Windows quick start (included): double-click `crop/start-crop.bat`.

Features in this crop

- Big scan area with drag & drop and camera capture support.
- Animated AI scan phases: "Analyzing leaf texture…", "Checking disease patterns…", "Generating treatment…".
- Visual results: confidence percentage circle, severity bar, infected-area highlights on the image.
- Weather-aware suggestions and a simple AI advisory chat with quick-question chips.
- crop `History` with thumbnails and timestamps, and a dashboard layout with sidebar and topbar.
- Theme toggle (dark/light), small animations, and speech playback for chat answers.

Notes & privacy

- This is a crop: usernames are stored in `localStorage` and passwords (if entered) are not secure. Do not enter real credentials.
- No backend is required to run the crop — everything runs in the browser.

Next steps

- Commit changes and publish the `crop/` folder to GitHub Pages or a static host to share the prototype.
- Replace crop classifier with a real model or connect to the backend when ready.

Troubleshooting

- If images or camera capture behave oddly when opening the file directly, serve via `python -m http.server` and open the crop through `http://localhost:8000/crop/index.html`.

Enjoy the prototype! If you want, I can commit these changes and add a short `crop.md` for presentations.
