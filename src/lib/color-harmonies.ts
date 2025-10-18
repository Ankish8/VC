/**
 * Color harmony generation utilities
 * Generates complementary, analogous, triadic, and other color schemes
 */

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface ColorHarmony {
  name: string;
  description: string;
  colors: string[];
}

/**
 * Generate complementary colors (opposite on color wheel)
 */
export function generateComplementary(baseColor: string): ColorHarmony {
  const hsl = hexToHSL(baseColor);
  const complementHue = (hsl.h + 180) % 360;

  return {
    name: "Complementary",
    description: "Colors opposite on the color wheel",
    colors: [
      baseColor,
      hslToHex(complementHue, hsl.s, hsl.l),
    ],
  };
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
export function generateAnalogous(baseColor: string): ColorHarmony {
  const hsl = hexToHSL(baseColor);

  return {
    name: "Analogous",
    description: "Colors adjacent on the color wheel",
    colors: [
      hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      baseColor,
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    ],
  };
}

/**
 * Generate triadic colors (evenly spaced on color wheel)
 */
export function generateTriadic(baseColor: string): ColorHarmony {
  const hsl = hexToHSL(baseColor);

  return {
    name: "Triadic",
    description: "Three colors evenly spaced on the color wheel",
    colors: [
      baseColor,
      hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    ],
  };
}

/**
 * Generate split complementary colors
 */
export function generateSplitComplementary(baseColor: string): ColorHarmony {
  const hsl = hexToHSL(baseColor);
  const complementHue = (hsl.h + 180) % 360;

  return {
    name: "Split Complementary",
    description: "Base color plus two colors adjacent to its complement",
    colors: [
      baseColor,
      hslToHex((complementHue - 30 + 360) % 360, hsl.s, hsl.l),
      hslToHex((complementHue + 30) % 360, hsl.s, hsl.l),
    ],
  };
}

/**
 * Generate tetradic (square) colors
 */
export function generateTetradic(baseColor: string): ColorHarmony {
  const hsl = hexToHSL(baseColor);

  return {
    name: "Tetradic",
    description: "Four colors evenly spaced on the color wheel",
    colors: [
      baseColor,
      hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
    ],
  };
}

/**
 * Generate monochromatic colors (same hue, different lightness)
 */
export function generateMonochromatic(baseColor: string): ColorHarmony {
  const hsl = hexToHSL(baseColor);

  return {
    name: "Monochromatic",
    description: "Different shades and tints of the same color",
    colors: [
      hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
      hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 15)),
      baseColor,
      hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 15)),
      hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30)),
    ],
  };
}

/**
 * Generate all harmonies for a base color
 */
export function generateAllHarmonies(baseColor: string): ColorHarmony[] {
  return [
    generateComplementary(baseColor),
    generateAnalogous(baseColor),
    generateTriadic(baseColor),
    generateSplitComplementary(baseColor),
    generateTetradic(baseColor),
    generateMonochromatic(baseColor),
  ];
}
