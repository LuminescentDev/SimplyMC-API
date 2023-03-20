/**
 * Typescript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */
export class Gradient {
  colors: number[][];
  gradients: any[];
  steps: number;
  step: number;

  constructor(colors: number[][], numSteps: number) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    const increment = this.steps / (colors.length - 1);
    for (let i = 0; i < colors.length - 1; i++)
      this.gradients.push(
        new TwoStopGradient(
          colors[i],
          colors[i + 1],
          increment * i,
          increment * (i + 1)
        )
      );
  }

  /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
  next() {
    if (this.steps <= 1) {
      return this.colors[0];
    }

    const adjustedStep = Math.round(
      Math.abs(
        ((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) /
          Math.PI) *
          this.steps
      )
    );
    let color;
    if (this.gradients.length < 2) {
      color = this.gradients[0].colorAt(adjustedStep);
    } else {
      const segment = this.steps / this.gradients.length;
      const index = Math.min(
        Math.floor(adjustedStep / segment),
        this.gradients.length - 1
      );
      color = this.gradients[index].colorAt(adjustedStep);
    }

    this.step++;
    return color;
  }
}

class TwoStopGradient {
  startColor: number[];
  endColor: number[];
  lowerRange: number;
  upperRange: number;

  constructor(
    startColor: number[],
    endColor: number[],
    lowerRange: number,
    upperRange: number
  ) {
    this.startColor = startColor;
    this.endColor = endColor;
    this.lowerRange = lowerRange;
    this.upperRange = upperRange;
  }

  colorAt(step: number) {
    return [
      this.calculateHexPiece(step, this.startColor[0], this.endColor[0]),
      this.calculateHexPiece(step, this.startColor[1], this.endColor[1]),
      this.calculateHexPiece(step, this.startColor[2], this.endColor[2]),
    ];
  }

  calculateHexPiece(step: number, channelStart: number, channelEnd: number) {
    const range = this.upperRange - this.lowerRange;
    const interval = (channelEnd - channelStart) / range;
    return Math.round(interval * (step - this.lowerRange) + channelStart);
  }
}

export class AnimatedGradient extends Gradient {
  constructor(colors: number[][], numSteps: number, offset: number) {
    super(colors, numSteps);
    this.step = offset;
  }
}

export function hex(c: number): string {
  const s: string = '0123456789abcdef';
  let i: number = parseInt(c.toString());
  if (i == 0 || isNaN(c)) {return '00';}
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}


export function convertToHex(rgb: number[]): string {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}


export function trim(s: string): string {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}


export function convertToRGB(hex: string): number[] {
  const color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
}

export function generateOutput(text: string, colors: string[], format: string, formatchar: string, prefix: string, bold: boolean, italic: boolean, underline: boolean, strikethrough: boolean): string {
  let newColors = colors?.map((color: string) => convertToRGB(color));
  if (newColors.length < 2) newColors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

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
    for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
    let formatCodes = '';
    if (format.includes('$f')) {
      if (bold) formatCodes += formatchar + 'l';
      if (italic) formatCodes += formatchar + 'o';
      if (underline) formatCodes += formatchar + 'n';
      if (strikethrough) formatCodes += formatchar + 'm';
    }

    hexOutput = hexOutput.replace('$f', formatCodes);
    hexOutput = hexOutput.replace('$c', char);
    output += hexOutput;
  }

  return output;
}

export function generateAnimationOutput(colors: string[], name: string, text: string, type: number, speed: number, format: string, formatchar: string, outputFormat: string, bold: boolean, italic: boolean, underline: boolean, strikethrough: boolean, length: number) {
  let newColors = colors.map((color: string) => convertToRGB(color));
  if(newColors.length < 2) newColors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

  let loopAmount;
  switch(type) {
    default:
      loopAmount = text.length * length * 2 - 2;
      break;
    case 3:
      loopAmount = text.length * length;
      break;
  }

  let outputArray = [];
  for (let n = 0; n < loopAmount; n++){
    let clrs = [];
    const gradient = new AnimatedGradient(newColors, text.length, n);
    let output = '';
    gradient.next();
    if (type == 4){
      const hex = convertToHex(gradient.next());
      clrs.push(hex);
      let hexOutput = format;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      let formatCodes = '';
      if (format.includes('$f')) {
        if (bold) formatCodes += formatchar + 'l';
        if (italic) formatCodes += formatchar + 'o';
        if (underline) formatCodes += formatchar + 'n';
        if (strikethrough) formatCodes += formatchar + 'm';
      }
      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', text);
      outputArray.push(`  - "${hexOutput}"`);
    }else {
      for (let i = 0; i < text.length; i++){
        const char = text.charAt(i);
        if(char == " " ) {
          output += char;
          clrs.push(null)
          continue;
        }

        const hex = convertToHex(gradient.next());
        clrs.push(hex);
        let hexOutput = format;
        for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (format.includes('$f')) {
          if (bold) formatCodes += formatchar + 'l';
          if (italic) formatCodes += formatchar + 'o';
          if (underline) formatCodes += formatchar + 'n';
          if (strikethrough) formatCodes += formatchar + 'm';
        }
        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', char);
        output += hexOutput;
      }
      outputArray.push(`  - "${output}"`);
    }
  }
  let finalOutput = '';
  finalOutput = outputFormat.replace("%name%", name)
  finalOutput = finalOutput.replace("%speed%", speed.toString())
  if(type == 1){
    outputArray.reverse();
  }else if (type == 3){
    const outputArray2 = outputArray.slice();
    outputArray = outputArray.reverse().concat(outputArray2);
  }

  finalOutput = finalOutput.replace("%output%", outputArray.join("\n"));
  return  {finalOutput};
}