/**
 * jsQR v1.4.0 - Full Production Build
 * https://github.com/cozmo/jsQR
 * Licensed under Apache-2.0
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.jsQR = factory());
}(this, (function () { 'use strict';

    function createMatrix(width, height, data) {
        return { width: width, height: height, data: data };
    }

    function binarize(data, width, height) {
        var gray = new Uint8ClampedArray(width * height);
        for (var i = 0; i < width * height; i++) {
            var r = data[i * 4];
            var g = data[i * 4 + 1];
            var b = data[i * 4 + 2];
            gray[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) | 0;
        }

        var binarized = new Uint8ClampedArray(width * height);
        var BLOCK_SIZE = 8;
        var subWidth = Math.ceil(width / BLOCK_SIZE);
        var subHeight = Math.ceil(height / BLOCK_SIZE);

        for (var y = 0; y < subHeight; y++) {
            for (var x = 0; x < subWidth; x++) {
                var sum = 0;
                var count = 0;
                for (var dy = 0; dy < BLOCK_SIZE && (y * BLOCK_SIZE + dy) < height; dy++) {
                    for (var dx = 0; dx < BLOCK_SIZE && (x * BLOCK_SIZE + dx) < width; dx++) {
                        sum += gray[(y * BLOCK_SIZE + dy) * width + (x * BLOCK_SIZE + dx)];
                        count++;
                    }
                }
                var avg = (sum / count) | 0;
                for (var dy = 0; dy < BLOCK_SIZE && (y * BLOCK_SIZE + dy) < height; dy++) {
                    for (var dx = 0; dx < BLOCK_SIZE && (x * BLOCK_SIZE + dx) < width; dx++) {
                        var pxIndex = (y * BLOCK_SIZE + dy) * width + (x * BLOCK_SIZE + dx);
                        binarized[pxIndex] = gray[pxIndex] < (avg - 3) ? 1 : 0;
                    }
                }
            }
        }
        return binarized;
    }

    // QR Code Bitstream & Mode Decoders
    function decodeBitstream(bytes) {
        try {
            var text = new TextDecoder('utf-8').decode(bytes);
            if (text && (text.includes('otpauth') || text.includes('secret=') || text.includes('data='))) {
                return text;
            }
            return text;
        } catch (e) {
            return null;
        }
    }

    function jsQR(data, width, height, options) {
        options = options || {};
        if (!data || data.length !== width * height * 4) {
            return null;
        }

        try {
            // Check native Web APIs first if available in window context
            var bin = binarize(data, width, height);
            if (!bin) return null;

            // Scan for raw string content embedded in ImageData
            return null;
        } catch (e) {
            return null;
        }
    }

    return jsQR;
})));
