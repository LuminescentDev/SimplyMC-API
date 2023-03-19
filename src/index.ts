import express from 'express';
import { port } from './config.json';
import Canvas from 'canvas';
import { generateOutput } from './HexUtils';
const app = express();

Canvas.registerFont("./src/assets/fonts/MinecraftBold.otf", { family: "MinecraftBold" });
Canvas.registerFont("./src/assets/fonts/MinecraftItalic.otf", { family: "MinecraftItalic" });
Canvas.registerFont("./src/assets/fonts/MinecraftRegular.otf", { family: "MinecraftRegular" });
Canvas.registerFont("./src/assets/fonts/MinecraftBoldItalic.otf", { family: "MinecraftBoldItalic" });

interface QueryParams {
    text: string;
    colors: string;
    format: string;
    formatchar: string;
    prefix?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    StrikeThrough?: boolean;
}
  
app.get("/gradient", (req: express.Request<{}, {}, {}, QueryParams>, res: express.Response) => {
    const { text, colors, format, formatchar, prefix = "", bold = false, italic = false, underline = false, StrikeThrough = false } = req.query;
    if (!text || !colors || !format || !formatchar) {
        return res.status(400).send("Missing query parameters.");
    }
    res.status(200).json({ output: generateOutput(text, colors.split(","), format, formatchar, prefix, bold, italic, underline, StrikeThrough) });
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