/**
 * BitsKee - Pixelate Engine
 * Handles image-to-pixelated conversion logic.
 */

const Pixelator = {
    // Color palettes for limited color modes
    palettes: {
        '16': [
            [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
            [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
            [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
            [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255]
        ],
        '8': [
            [0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255],
            [255, 255, 0], [255, 0, 255], [0, 255, 255], [255, 255, 255]
        ],
        'grayscale': null, // Special handling
        '1bit': [[0, 0, 0], [255, 255, 255]]
    },

    /**
     * Pixelate an image.
     * @param {HTMLImageElement} image - The source image.
     * @param {Object} options - Pixelation options.
     * @param {number} options.pixelSize - Size of each pixel block.
     * @param {string} options.colorMode - Color mode (full, 16, 8, grayscale, 1bit).
     * @param {boolean} options.showGrid - Whether to show grid lines.
     * @param {HTMLCanvasElement} targetCanvas - Canvas to render to.
     * @returns {HTMLCanvasElement} The rendered canvas.
     */
    pixelate(image, options, targetCanvas) {
        const pixelSize = options.pixelSize || 8;
        const colorMode = options.colorMode || 'full';
        const showGrid = options.showGrid || false;

        // Calculate output dimensions
        const scaledWidth = Math.floor(image.width / pixelSize);
        const scaledHeight = Math.floor(image.height / pixelSize);

        // Set canvas size to maintain aspect ratio but cap at reasonable size
        const maxSize = 400;
        const scale = Math.min(maxSize / scaledWidth, maxSize / scaledHeight, pixelSize);
        const canvasWidth = Math.floor(scaledWidth * scale);
        const canvasHeight = Math.floor(scaledHeight * scale);

        targetCanvas.width = canvasWidth;
        targetCanvas.height = canvasHeight;

        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Create temp canvas to sample pixels
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;

        // Draw scaled down image
        tempCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

        // Get pixel data
        const imageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);
        const pixels = imageData.data;

        // Calculate pixel block size in output
        const blockW = canvasWidth / scaledWidth;
        const blockH = canvasHeight / scaledHeight;

        // Draw pixelated version
        for (let y = 0; y < scaledHeight; y++) {
            for (let x = 0; x < scaledWidth; x++) {
                const i = (y * scaledWidth + x) * 4;
                let r = pixels[i];
                let g = pixels[i + 1];
                let b = pixels[i + 2];

                // Apply color mode
                [r, g, b] = this.applyColorMode(r, g, b, colorMode);

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(
                    Math.floor(x * blockW),
                    Math.floor(y * blockH),
                    Math.ceil(blockW),
                    Math.ceil(blockH)
                );
            }
        }

        // Draw grid if enabled
        if (showGrid && blockW >= 3 && blockH >= 3) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;

            for (let x = 0; x <= scaledWidth; x++) {
                ctx.beginPath();
                ctx.moveTo(Math.floor(x * blockW) + 0.5, 0);
                ctx.lineTo(Math.floor(x * blockW) + 0.5, canvasHeight);
                ctx.stroke();
            }

            for (let y = 0; y <= scaledHeight; y++) {
                ctx.beginPath();
                ctx.moveTo(0, Math.floor(y * blockH) + 0.5);
                ctx.lineTo(canvasWidth, Math.floor(y * blockH) + 0.5);
                ctx.stroke();
            }
        }

        return targetCanvas;
    },

    /**
     * Apply color mode reduction.
     * @param {number} r - Red value.
     * @param {number} g - Green value.
     * @param {number} b - Blue value.
     * @param {string} mode - Color mode.
     * @returns {number[]} Adjusted [r, g, b] values.
     */
    applyColorMode(r, g, b, mode) {
        if (mode === 'full') {
            return [r, g, b];
        }

        if (mode === 'grayscale') {
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            return [gray, gray, gray];
        }

        // Find nearest color in palette
        const palette = this.palettes[mode];
        if (!palette) return [r, g, b];

        let nearestColor = palette[0];
        let minDistance = Infinity;

        for (const color of palette) {
            const distance = Math.sqrt(
                Math.pow(r - color[0], 2) +
                Math.pow(g - color[1], 2) +
                Math.pow(b - color[2], 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestColor = color;
            }
        }

        return nearestColor;
    },

    /**
     * Load an image from a File object.
     * @param {File} file - Image file.
     * @returns {Promise<HTMLImageElement>} Loaded image element.
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
};

// Export for use in other modules
window.Pixelator = Pixelator;
