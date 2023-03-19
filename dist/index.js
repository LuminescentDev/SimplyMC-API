"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = require("./config.json");
const canvas_1 = __importDefault(require("canvas"));
const HexUtils_1 = require("./HexUtils");
const app = (0, express_1.default)();
canvas_1.default.registerFont("./src/assets/fonts/MinecraftBold.otf", { family: "MinecraftBold" });
canvas_1.default.registerFont("./src/assets/fonts/MinecraftItalic.otf", { family: "MinecraftItalic" });
canvas_1.default.registerFont("./src/assets/fonts/MinecraftRegular.otf", { family: "MinecraftRegular" });
canvas_1.default.registerFont("./src/assets/fonts/MinecraftBoldItalic.otf", { family: "MinecraftBoldItalic" });
app.get("/gradient", (req, res) => {
    if (Object.keys(req.query).length == 0)
        return res.status(400).send("No query provided.");
    const newData = req.query;
    console.log(newData);
    if (!newData.text)
        return res.status(400).send("No text provided.");
    if (!newData.colors)
        return res.status(400).send("No colors provided.");
    if (!newData.format)
        return res.status(400).send("No format provided.");
    if (!newData.formatchar)
        return res.status(400).send("No formatchar provided.");
    const output = (0, HexUtils_1.generateOutput)(newData.text, newData.colors.split(','), newData.format, newData.formatchar, newData.prefix || '', newData.bold || false, newData.italic || false, newData.underline || false, newData.strikethrough || false);
    res.status(200);
    res.json({
        output: output
    });
});
app.listen(config_json_1.port, null, null);
console.log(`Server started on port ${config_json_1.port}`);
// const applyText = (canvas: Canvas.Canvas, text: string): string => {
//     const context = canvas.getContext('2d');
//     // Declare a base size of the font
//     let fontSize = 70;
//     context.font = `${fontSize -= 1}px MinecraftRegular`;
//     // Compare pixel width of the text to the canvas minus the approximate avatar size
//     // Return the result to use in the actual canvas
//     return context.font;
// };
// function texter(canvas: HTMLCanvasElement, str: string, colors: string[], x: number, y: number, formats: string[]): void {
//     const ctx = canvas.getContext('2d');
//     ctx.font = applyText(canvas, str, formats);
//     for(let i = 0; i <= str.length; ++i) {
//         const hex = colors[i];
//         const ch = str.charAt(i);
//         ctx.fillStyle = '#' + hex;
//         ctx.fillText(ch, x, y);
//         x += ctx.measureText(ch).width;
//         if(x > canvas.width) {
//             throw new Error('Out of bounds');
//         }
//     }
// }
//# sourceMappingURL=index.js.map