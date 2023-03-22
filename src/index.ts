import express from 'express';
import { port } from './config.json';
import { generateOutput, generateAnimationOutput, createPreview } from './utils/GradientUtils';
const app = express();

interface QueryParams {
    name?: string;
    text: string;
    type?: number;
    speed?: number;
    colors: string;
    format: string;
    formatchar: string;
    outputFormat?: string;
    prefix?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    length?: number;
}

app.get("/", async (req: express.Request<{}, {}, {}, QueryParams>, res: express.Response) => {
  res.status(200).json("UR Mom")
});

app.get("/gradient", async (req: express.Request<{}, {}, {}, QueryParams>, res: express.Response) => {
    const { text, colors, format, formatchar, prefix = "", bold = false, italic = false, underline = false, strikethrough = false } = req.query;
    console.log(colors)
    if (!text || !colors || !format || !formatchar) {
        return res.status(400).send("Missing query parameters.");
    }
    res.status(200).json({ 
        output: generateOutput(text, colors.split(","), format, formatchar, prefix, bold, italic, underline, strikethrough),
        preview: createPreview(colors.split(","), text, bold, italic, underline, strikethrough),
    });
});
app.get("/animation", async (req: express.Request<{}, {}, {}, QueryParams>, res: express.Response) => {
  const { colors, name, text, type = 1, speed = 50, format = "&#$1$2$3$4$5$6$f$c", formatchar = "&", outputFormat = "%name%:\n  change-interval: %speed%\n  texts:\n%output%", bold = false, italic = false, underline = false, strikethrough = false, length = 1 } = req.query;
  console.log(colors.split(","))
  if (!colors || !name || !text) {
      return res.status(400).send("Missing query parameters.");
  }
  res.status(200).json({
      output: generateAnimationOutput(colors.split(","), name, text, type, speed, format, formatchar, outputFormat, bold, italic, underline, strikethrough, length),
  });
});

app.listen(port, null, null);
console.log(`Server started on port ${port}`);