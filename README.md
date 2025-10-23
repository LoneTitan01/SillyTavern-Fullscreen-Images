# SillyTavern — Fullscreen Images

Small extension that enables quick, lightweight fullscreen viewing of images posted in chat (images inside elements with the `.mes_text` class).

When an image is clicked it opens an overlay with a 10% top/bottom margin, darkened background, a short fade animation, and simple controls for zooming and panning.

## Features

- Click any image inside a `.mes_text` container to open it in a fullscreen overlay.
- Background is dimmed (gray) and blurred while the overlay is open.
- Fade-in / fade-out animation when opening/closing.
- Zoom with the mouse wheel (or touchpad). The zoom anchors to the cursor position.
- Drag (click-and-drag) the image when zoomed in to pan around.
- Close the overlay by pressing Escape or clicking/tapping on the dimmed background.

## Installation

1. Copy the files in this repository into your SillyTavern extension folder (or install via your usual extension workflow):
	- `index.js` — main behaviour (injects the overlay and event handlers)
	- `style.css` — overlay and animation styles
	- `manifest.json` / other extension metadata as required by your SillyTavern setup

2. Reload SillyTavern or install the extension using the app's extension manager.

This script automatically attaches click handlers to images that are inside any `.mes_text` element. It also watches for dynamically added messages and will attach listeners as new content appears.

## Usage / Controls

- Click an image (inside `.mes_text`) — open fullscreen overlay.
- Click outside the image (on the darkened background) — close overlay.
- Press `Escape` — close overlay.
- Scroll the mouse wheel while the cursor is over the image — zoom in/out. The zoom centers on the cursor position.
- Click and drag the image while zoomed (scale > 1) — pan the image.

Notes:
- The overlay prevents page scrolling while open.
- Images are shown with a 10% top and bottom margin (configured in `style.css`).

## Customization

- Margin: edit the top/bottom padding in `style.css` (the overlay uses `padding-top: 10vh` and `padding-bottom: 10vh`).
- Maximum zoom and minimum zoom: edit `maxScale` and `minScale` in `index.js`.
- Transition/animation duration: adjust the CSS animation timings in `style.css` (`fsfadein` / `fsfadeout`) and the `.fullscreen-img-container` transition.

## Implementation details

- The overlay element created by `index.js` has the class `.fullscreen-image-overlay` and uses `.fullscreen-img-container` to apply transforms (translate + scale).
- Zooming is implemented by applying a CSS transform (`translate(x,y) scale(s)`) to the container. Dragging updates the translate portion of that transform.
- The script marks processed images with `data-fs-bound` to avoid attaching duplicate event listeners.

## Troubleshooting

- If clicking images does nothing, make sure images are contained in an element with class `.mes_text`.
- If the overlay appears but the image is cropped incorrectly, try adjusting the `max-height` / `max-width` rules in `style.css`.
- If the wheel zoom doesn't respond on your platform, verify your browser or runtime forwards wheel events (the overlay adds a non-passive wheel listener).

## License

MIT — feel free to reuse and modify. See `LICENSE` if present.