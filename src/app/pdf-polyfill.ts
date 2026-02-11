// Polyfill for Web Worker environment to support pdfMake
const mockWindow = self as any;

// 1. Polyfill window
try {
    if (!mockWindow.window) {
        mockWindow.window = mockWindow;
    }
} catch (e) {
    console.warn('Worker Polyfill: Could not set window property', e);
}

// 2. Polyfill document
if (!mockWindow.document) {
    mockWindow.document = {
        createElement: function(name: string) {
            // pdfMake uses canvas for text measurement (width calculation)
            if (name === 'canvas') {
                return {
                    getContext: function(type: string) {
                        return {
                            measureText: function(text: string) {
                                return { width: (text || '').length * 7 };
                            },
                            fillText: function() {},
                            strokeText: function() {},
                            save: function() {},
                            restore: function() {},
                            scale: function() {},
                            rotate: function() {},
                            translate: function() {},
                            transform: function() {},
                            beginPath: function() {},
                            moveTo: function() {},
                            lineTo: function() {},
                            bezierCurveTo: function() {},
                            quadraticCurveTo: function() {},
                            closePath: function() {},
                            clip: function() {},
                            clearRect: function() {},
                            fill: function() {},
                            stroke: function() {},
                            createPattern: function() {},
                            createLinearGradient: function() { return { addColorStop: function() {} }; },
                        };
                    },
                    toDataURL: function() { return ''; },
                    width: 0,
                    height: 0
                };
            }
            return {
                setAttribute: function() {},
                getAttribute: function() { return ''; },
                style: {}
            };
        },
        createElementNS: function() { return {}; },
        documentElement: {
            style: {}
        }
    };
}

// 3. Polyfill navigator mostly exists, but ensure userAgent
if (!mockWindow.navigator) {
    mockWindow.navigator = {
        userAgent: 'Worker'
    };
}

// 4. Polyfill requestAnimationFrame (common source of hangs in workers)
if (!mockWindow.requestAnimationFrame) {
    mockWindow.requestAnimationFrame = (callback: any) => {
        return setTimeout(() => {
            callback(self.performance ? self.performance.now() : Date.now());
        }, 16);
    };
}
if (!mockWindow.cancelAnimationFrame) {
    mockWindow.cancelAnimationFrame = (id: any) => {
        clearTimeout(id);
    };
}

// 5. Polyfill performance
if (!mockWindow.performance) {
    mockWindow.performance = {
        now: () => Date.now()
    };
}

// 6. Polyfill global (some libs check for global in node-like environments)
if (typeof (self as any).global === 'undefined') {
    (self as any).global = self;
}

// 7. Polyfill setImmediate (used by some promise polyfills or scheduling)
if (!mockWindow.setImmediate) {
    mockWindow.setImmediate = (callback: any) => setTimeout(callback, 0);
}
if (!mockWindow.clearImmediate) {
    mockWindow.clearImmediate = (id: any) => clearTimeout(id);
}

// 8. Polyfill Image (pdfmake often checks for this)
if (typeof (self as any).Image === 'undefined') {
    (self as any).Image = function() {
        return {
            src: '',
            onload: null,
            onerror: null
        };
    };
}

// 9. Polyfill HTML elements for instanceof checks
if (typeof (self as any).HTMLElement === 'undefined') { (self as any).HTMLElement = function() {}; }
if (typeof (self as any).HTMLCanvasElement === 'undefined') { (self as any).HTMLCanvasElement = function() {}; }
if (typeof (self as any).HTMLImageElement === 'undefined') { (self as any).HTMLImageElement = function() {}; }

console.error('Worker Polyfill: window, document, and DOM constructors shimmed successfully.');

export {}; // Ensure this file is treated as a module
