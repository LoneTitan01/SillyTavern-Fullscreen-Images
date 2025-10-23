// Fullscreen image viewer for images inside .mes_text
(() => {
	const MARGIN_VH = 10; // 10% margin top and bottom

	// Create overlay element
	const overlay = document.createElement('div');
	overlay.className = 'fullscreen-image-overlay';
	overlay.style.display = 'none';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-hidden', 'true');

	// Inner container to allow transforms separate from overlay
	const imgContainer = document.createElement('div');
	imgContainer.className = 'fullscreen-img-container';
	imgContainer.style.cursor = 'grab';
	imgContainer.style.touchAction = 'none';
	imgContainer.style.userSelect = 'none';

	// Image element that will be reused for any clicked image
	const fsImg = document.createElement('img');
	fsImg.className = 'fullscreen-img';
	fsImg.alt = '';

	imgContainer.appendChild(fsImg);
	overlay.appendChild(imgContainer);
	document.body.appendChild(overlay);

	// State
	let scale = 1;
	let minScale = 0.2;
	let maxScale = 5;
	let originX = 0; // for transform-origin
	let originY = 0;
	let translateX = 0;
	let translateY = 0;
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let translateStart = { x: 0, y: 0 };

	function resetState() {
		scale = 1;
		translateX = 0;
		translateY = 0;
		originX = 50;
		originY = 50;
		fsImg.style.transform = '';
		imgContainer.style.transform = '';
		imgContainer.style.left = '';
		imgContainer.style.top = '';
	}

	function showOverlay(img) {
		fsImg.src = img.src;
		fsImg.alt = img.alt || '';
		overlay.style.display = 'flex';
		overlay.setAttribute('aria-hidden', 'false');
		document.body.classList.add('fullscreen-image-open');
		// small fade-in
		overlay.classList.remove('fade-out');
		overlay.classList.add('fade-in');
		resetState();
		ensureFit();
	}

	function hideOverlay() {
		overlay.classList.remove('fade-in');
		overlay.classList.add('fade-out');
		overlay.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('fullscreen-image-open');
		// wait for animation then hide
		setTimeout(() => {
			if (overlay.classList.contains('fade-out')) overlay.style.display = 'none';
		}, 200);
	}

	function ensureFit() {
		// Ensure image fits within margins when scale=1
		fsImg.style.maxHeight = (100 - 2 * MARGIN_VH) + 'vh';
		fsImg.style.maxWidth = '100%';
		fsImg.style.width = 'auto';
		fsImg.style.height = 'auto';
		// reset transforms
		fsImg.style.transformOrigin = '50% 50%';
		imgContainer.style.transform = `translate(0px, 0px) scale(1)`;
	}

	// Wheel zoom handler
	function onWheel(e) {
		if (overlay.style.display === 'none') return;
		e.preventDefault();
		// Determine wheel direction
		const delta = -e.deltaY || -e.wheelDelta || e.detail;
		const rect = fsImg.getBoundingClientRect();
		// cursor position relative to image
		const cx = ((e.clientX - rect.left) / rect.width) * 100;
		const cy = ((e.clientY - rect.top) / rect.height) * 100;
		const zoomFactor = delta > 0 ? 1.12 : 0.88;
		const newScale = Math.min(maxScale, Math.max(minScale, scale * zoomFactor));
		// adjust translate so point under cursor stays in place
		const prevScale = scale;
		const sRatio = newScale / prevScale;
		// compute offsets
		const imgCenterX = rect.left + rect.width / 2;
		const imgCenterY = rect.top + rect.height / 2;
		// Convert cursor to offset from center
		const offsetX = e.clientX - imgCenterX;
		const offsetY = e.clientY - imgCenterY;
		// Update translate to keep cursor anchored
		translateX = (translateX - offsetX) * sRatio + offsetX;
		translateY = (translateY - offsetY) * sRatio + offsetY;
		scale = newScale;
		updateTransform();
	}

	function updateTransform() {
		imgContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
	}

	// Mouse drag handlers
	function onPointerDown(e) {
		if (overlay.style.display === 'none') return;
		if (scale <= 1) return; // only allow drag when zoomed
		isDragging = true;
		imgContainer.style.cursor = 'grabbing';
		dragStart = { x: e.clientX, y: e.clientY };
		translateStart = { x: translateX, y: translateY };
		e.preventDefault();
	}

	function onPointerMove(e) {
		if (!isDragging) return;
		const dx = e.clientX - dragStart.x;
		const dy = e.clientY - dragStart.y;
		translateX = translateStart.x + dx;
		translateY = translateStart.y + dy;
		updateTransform();
	}

	function onPointerUp() {
		if (!isDragging) return;
		isDragging = false;
		imgContainer.style.cursor = 'grab';
	}

	// Close on background click
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			hideOverlay();
		}
	});

	// Prevent clicks on image from closing
	imgContainer.addEventListener('click', (e) => e.stopPropagation());

	// Wheel on overlay
	overlay.addEventListener('wheel', onWheel, { passive: false });

	// Pointer events for dragging
	imgContainer.addEventListener('pointerdown', onPointerDown);
	window.addEventListener('pointermove', onPointerMove);
	window.addEventListener('pointerup', onPointerUp);

	// Escape key to close
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			if (overlay.style.display !== 'none') hideOverlay();
		}
	});

	// Attach click handlers to images within .mes_text
	function attachListeners(root = document) {
		const parents = root.querySelectorAll('.mes_text');
		parents.forEach(parent => {
			parent.querySelectorAll('img').forEach(img => {
				if (img.dataset.fsBound) return;
				img.dataset.fsBound = '1';
				img.style.cursor = 'zoom-in';
				img.addEventListener('click', (e) => {
					showOverlay(e.currentTarget);
				});
			});
		});
	}

	// Run on load and also observe for dynamically added messages
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => attachListeners(document));
	} else {
		attachListeners(document);
	}

	// MutationObserver to attach to future nodes
	const mo = new MutationObserver((mutations) => {
		for (const m of mutations) {
			if (m.addedNodes && m.addedNodes.length) {
				attachListeners();
				break;
			}
		}
	});
	mo.observe(document.body, { childList: true, subtree: true });

})();
