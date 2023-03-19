import express from 'express';
import { port } from './config.json';
import Canvas from 'canvas';
import { generateOutput } from './HexUtils';
const app = express();

Canvas.registerFont("./src/assets/fonts/MinecraftBold.otf", { family: "MinecraftBold" });
Canvas.registerFont("./src/assets/fonts/MinecraftItalic.otf", { family: "MinecraftItalic" });
Canvas.registerFont("./src/assets/fonts/MinecraftRegular.otf", { family: "MinecraftRegular" });
Canvas.registerFont("./src/assets/fonts/MinecraftBoldItalic.otf", { family: "MinecraftBoldItalic" });

declare interface data {
    text: string;
    colors: string;
    format: string;
    formatchar: string;
    prefix?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
}

app.get("/gradient", (req, res) => {
    if(Object.keys(req.query).length == 0) return res.status(400).send("No query provided.");

    const newData = req.query as unknown as data;
    console.log(newData);
    if(!newData.text) return res.status(400).send("No text provided.");
    if(!newData.colors) return res.status(400).send("No colors provided.");
    if(!newData.format) return res.status(400).send("No format provided.");
    if(!newData.formatchar) return res.status(400).send("No formatchar provided.");

    const output = generateOutput(newData.text, newData.colors.split(','), newData.format, newData.formatchar, newData.prefix || '', newData.bold || false, newData.italic || false, newData.underline || false, newData.strikethrough || false);
    res.status(200)
    res.json({
        output: output
    })
});

app.listen(port, null, null);
console.log(`Server started on port ${port}`);

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