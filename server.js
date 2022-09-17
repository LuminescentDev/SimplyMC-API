const express = require('express');
const config = require("./config.json")
const app = express();
const Canvas = require('canvas');

Canvas.registerFont("./assets/fonts/MinecraftBold.otf", { family: "MinecraftBold" });
Canvas.registerFont("./assets/fonts/MinecraftItalic.otf", { family: "MinecraftItalic" });
Canvas.registerFont("./assets/fonts/MinecraftRegular.otf", { family: "MinecraftRegular" });
Canvas.registerFont("./assets/fonts/MinecraftBoldItalic.otf", { family: "MinecraftBoldItalic" });

app.get("/gradient/:preset", (req, res) => {
    try{
        const preset = decodePreset(req.params.preset);
        const preview = createPreview(preset.colors, preset.text, preset.formats);
        const output = createPresetOutput(preset.colors, preset.text, preset.formats);
        res.status(200);
        res.json({
            Preview: preview,
            Output: output,
        });
    }catch(e){
        res.status(400);
        res.json({
            Error: "Error while parsing preset"
        });
    }
});

app.get("/gradient", (req, res) => {
    if(!req.query.colors) return res.status(400).json({ Error: "Missing colors" });
    if(!req.query.text) return res.status(400).json({ Error: "Missing text" });
    const colors = req.query.colors.split(',');
    const text = req.query.text;
    const formatting = decompress(req.query.formatting || 0, 4);
    const format = req.query.format || "&#$1$2$3$4$5$6$f$c";
    const formatChar = req.query.formatChar || "&";
    const output = createOutput(colors, text, formatting, format, formatChar);
    const preview = createPreview(colors, text, formatting);
    res.status(200);
    res.json({
        Preview: preview,
        Output: output,
    });
});

// app.post('/AnimTAB', (req, res) => {
//     const preset = decodeAnimTAB(req.body.preset);
//     const preview = createPreviewGIF(preset.colors, preset.text, preset.speed, preset.type, preset.formats);
//     const output = createOutput(preset.colors, preset.text, preset.formats);
//     res.status(200);
//     res.json({
//         // Image: preview,
//         Output: output,
//     });
// });

app.listen(config.port, null, null);
console.log('Server started on port ' + config.port);

function fromBinary(encoded) {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

function decodePreset(preset) {
    preset = fromBinary(preset);
    preset = JSON.parse(preset);
    const version = preset.version;
    const colors = preset.colors;
    const text = preset.text;
    const formats = decompress(preset.formats, 4);
    return { version, colors, text, formats };
}

function decodeAnimTAB(preset) {
    const string = fromBinary(preset);
    const data = string.split(':-:');
    const colors = data[0].split(',');
    const text = data[1];
    const speed = data[2];
    const type = data[3];
    const formats = decompress(data[4], 4);
    return { colors, text, speed, type, formats };
}

// Takes a number and turns it into an array of boolean values
// Second parameter is how many values to parse out of the number
function decompress(input, expectedValues) {
    const values = [];
    for (let i = 0; i < expectedValues; i++) {
        const value = !!((input >> i) & 1);
        values.push(value);
    }
    return values;
}

function hex(c) {
    const s = '0123456789abcdef';
    let i = parseInt(c);
    if (i == 0 || isNaN(c)) {return '00';}
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Remove '#' in color hex string */
function trim(s) {
    return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
    const color = [];
    color[0] = parseInt((trim(hex)).substring(0, 2), 16);
    color[1] = parseInt((trim(hex)).substring(2, 4), 16);
    color[2] = parseInt((trim(hex)).substring(4, 6), 16);
    return color;
}

/**
 * JavaScript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */
class Gradient {
    constructor(colors, numSteps) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    const increment = this.steps / (colors.length - 1);
    for (let i = 0; i < colors.length - 1; i++) {this.gradients.push(new TwoStopGradient(colors[i], colors[i + 1], increment * i, increment * (i + 1)));}
    }

    /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
    next() {
    if (this.steps <= 1) {return this.colors[0];}

    const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps));
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

class AnimatedGradient extends Gradient {
    constructor(colors, numSteps, offset) {
        super(colors, numSteps);
        this.step = offset;
    }
}

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

const applyText = (canvas, text, formats) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 70;

    let font = "MinecraftRegular";

    if (formats[0] === true) {
        if(formats[1] === true) {
            font = "MinecraftBoldItalic";
        }
else{
            font = "MinecraftBold";
        }
    }
else if(formats[1] === true) {
        font = "MinecraftItalic";
    }

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `${fontSize -= 1}px ${font}`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size

    } while (context.measureText(text).width > canvas.width - 50);

    // Return the result to use in the actual canvas
    return context.font;
};

function texter(canvas, str, colors, x, y, formats) {
    const ctx = canvas.getContext('2d');
    ctx.font = applyText(canvas, str, formats);
    for(let i = 0; i <= str.length; ++i) {
        const hex = colors[i];
        const ch = str.charAt(i);
        ctx.fillStyle = '#' + hex;
        ctx.fillText(ch, x, y);
        const { width } = ctx.measureText(ch);
        if(formats[2] === true) ctx.fillRect(x, y * 1.05, width, width / 6);
        if(formats[3] === true) ctx.fillRect(x, y / 1.25, width, width / 6);
        x += ctx.measureText(ch).width;
    }
}

function createPreview(colors, text, formats) {
    const newColors = [];
    for(let i = 0; i < colors.length; ++i) {
        newColors.push(convertToRGB(colors[i]));
    }
    const gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    const outputColors = [];
    for (let i = 0; i < text.length; i++) {
        const hex = convertToHex(gradient.next());
        outputColors.push(hex);
    }
    const canvas = Canvas.createCanvas(700, 250);
    texter(canvas, text, outputColors, 10, 60, formats);
    return canvas.toDataURL();
}

// function createPreviewGIF(colors, text, speed, type, formats) {
//     const encoder = new GIFEncoder(700, 250);
//     encoder.setRepeat(0);
//     encoder.setDelay(speed);
//     encoder.setQuality(50);
//     encoder.setTransparent();
//     encoder.start();

//     const newColors = [];
//     for(let i = 0; i < colors.length; ++i) {
//         newColors.push(convertToRGB(colors[i]));
//     }
//     const canvas = Canvas.createCanvas(700, 250);
//     const ctx = canvas.getContext('2d');
//     ctx.fillRect();
//     const length = text.length * 2 - 2;
//     for (let n = length; n > 0; n--) {
//         // ctx.fillStyle = "#3A3A3A";
//         // ctx.fillRect(0, 0, 0, canvas.width);
//         const gradient = new AnimatedGradient(newColors, text.length, n);
//         const outputColors = [];
//         for (let i = 0; i < text.length; i++) {
//             const hex = convertToHex(gradient.next());
//             outputColors.push(hex);
//         }
//         texter(canvas, text, outputColors, 10, 60, formats);
//         encoder.addFrame(ctx);
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }
//     encoder.finish();
//     return encoder.out.getData();
// }

function createOutput(colors, text, formatting, format, formatChar){
    const newColors = [];
    for(let i = 0; i < colors.length; ++i) {
        newColors.push(convertToRGB(colors[i]));
    }
    const gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    let output = "";
    const charColors = [];
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char == ' ') {
          output += char;
          charColors.push(null);
          continue;
        }
        const hex = convertToHex(gradient.next());
        charColors.push(hex);
        let hexOutput = format;
        for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (formatChar) {
    
            if (formatting[0]) formatCodes += formatChar + 'l';
            if (formatting[1]) formatCodes += formatChar + 'o';
            if (formatting[2]) formatCodes += formatChar + 'n';
            if (formatting[3]) formatCodes += formatChar + 'm';
        }
        hexOutput = hexOutput.replace("$f", formatCodes);
        hexOutput = hexOutput.replace("$c", char);
        output += hexOutput;
    }
    return output;
}

function createPresetOutput(colors, text, formats) {
    const newColors = [];
    for(let i = 0; i < colors.length; ++i) {
        newColors.push(convertToRGB(colors[i]));
    }
    const gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    const output = [];
    for (let i = 0; i < text.length; i++) {
        let format = "";
        if (formats[0]) format += '&l';
        if (formats[1]) format += '&o';
        if (formats[2]) format += '&n';
        if (formats[3]) format += '&m';
        const hex = convertToHex(gradient.next());
        const char = text.charAt(i);
        output.push(`&#${hex}${format}${char}`);
    }
    return output.join('');
}