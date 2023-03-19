"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOutput = exports.convertToRGB = exports.trim = exports.convertToHex = exports.hex = exports.AnimatedGradient = exports.Gradient = void 0;
/**
 * Typescript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */
class Gradient {
    constructor(colors, numSteps) {
        this.colors = colors;
        this.gradients = [];
        this.steps = numSteps - 1;
        this.step = 0;
        const increment = this.steps / (colors.length - 1);
        for (let i = 0; i < colors.length - 1; i++)
            this.gradients.push(new TwoStopGradient(colors[i], colors[i + 1], increment * i, increment * (i + 1)));
    }
    /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
    next() {
        if (this.steps <= 1) {
            return this.colors[0];
        }
        const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) /
            Math.PI) *
            this.steps));
        let color;
        if (this.gradients.length < 2) {
            color = this.gradients[0].colorAt(adjustedStep);
        }
        else {
            const segment = this.steps / this.gradients.length;
            const index = Math.min(Math.floor(adjustedStep / segment), this.gradients.length - 1);
            color = this.gradients[index].colorAt(adjustedStep);
        }
        this.step++;
        return color;
    }
}
exports.Gradient = Gradient;
class TwoStopGradient {
    constructor(startColor, endColor, lowerRange, upperRange) {
        this.startColor = startColor;
        this.endColor = endColor;
        this.lowerRange = lowerRange;
        this.upperRange = upperRange;
    }
    colorAt(step) {
        return [
            this.calculateHexPiece(step, this.startColor[0], this.endColor[0]),
            this.calculateHexPiece(step, this.startColor[1], this.endColor[1]),
            this.calculateHexPiece(step, this.startColor[2], this.endColor[2]),
        ];
    }
    calculateHexPiece(step, channelStart, channelEnd) {
        const range = this.upperRange - this.lowerRange;
        const interval = (channelEnd - channelStart) / range;
        return Math.round(interval * (step - this.lowerRange) + channelStart);
    }
}
class AnimatedGradient extends Gradient {
    constructor(colors, numSteps, offset) {
        super(colors, numSteps);
        this.step = offset;
    }
}
exports.AnimatedGradient = AnimatedGradient;
function hex(c) {
    const s = '0123456789abcdef';
    let i = parseInt(c.toString());
    if (i == 0 || isNaN(c)) {
        return '00';
    }
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}
exports.hex = hex;
function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}
exports.convertToHex = convertToHex;
function trim(s) {
    return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}
exports.trim = trim;
function convertToRGB(hex) {
    const color = [];
    color[0] = parseInt((trim(hex)).substring(1, 3), 16);
    color[1] = parseInt((trim(hex)).substring(3, 5), 16);
    color[2] = parseInt((trim(hex)).substring(5, 7), 16);
    return color;
}
exports.convertToRGB = convertToRGB;
function generateOutput(text, colors, format, formatchar, prefix, bold, italic, underline, strikethrough) {
    let newColors = colors.map((color) => convertToRGB(color));
    if (newColors.length < 2)
        newColors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];
    let output = prefix;
    const gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char == ' ') {
            output += char;
            continue;
        }
        const hex = convertToHex(gradient.next());
        let hexOutput = format;
        for (let n = 1; n <= 6; n++)
            hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (format.includes('$f')) {
            if (bold)
                formatCodes += formatchar + 'l';
            if (italic)
                formatCodes += formatchar + 'o';
            if (underline)
                formatCodes += formatchar + 'n';
            if (strikethrough)
                formatCodes += formatchar + 'm';
        }
        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', char);
        output += hexOutput;
    }
    return output;
}
exports.generateOutput = generateOutput;
//# sourceMappingURL=HexUtils.js.map