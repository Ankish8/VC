import chroma from "chroma-js";

export interface ColorInfo {
  color: string; // Normalized hex color
  count: number; // Number of occurrences
  type: "fill" | "stroke" | "both";
  originalFormats: string[]; // All original color formats found
}

/**
 * Normalize a color to hex format
 */
export function normalizeColor(color: string): string | null {
  if (!color || color === "none" || color === "transparent") {
    return null;
  }

  try {
    return chroma(color).hex();
  } catch {
    return null;
  }
}

/**
 * Extract all colors from an SVG element
 */
export function extractSVGColors(svgElement: SVGElement): ColorInfo[] {
  const colorMap = new Map<string, ColorInfo>();

  // Traverse all elements in the SVG
  const elements = svgElement.querySelectorAll("*");

  elements.forEach((element) => {
    // Check fill attribute
    const fill = element.getAttribute("fill");
    if (fill) {
      const normalizedFill = normalizeColor(fill);
      if (normalizedFill) {
        addColorToMap(colorMap, normalizedFill, fill, "fill");
      }
    }

    // Check stroke attribute
    const stroke = element.getAttribute("stroke");
    if (stroke) {
      const normalizedStroke = normalizeColor(stroke);
      if (normalizedStroke) {
        addColorToMap(colorMap, normalizedStroke, stroke, "stroke");
      }
    }

    // Check computed styles
    if (element instanceof SVGElement) {
      const computedStyle = window.getComputedStyle(element);
      const computedFill = computedStyle.fill;
      const computedStroke = computedStyle.stroke;

      if (computedFill && computedFill !== "none") {
        const normalizedFill = normalizeColor(computedFill);
        if (normalizedFill) {
          addColorToMap(colorMap, normalizedFill, computedFill, "fill");
        }
      }

      if (computedStroke && computedStroke !== "none") {
        const normalizedStroke = normalizeColor(computedStroke);
        if (normalizedStroke) {
          addColorToMap(colorMap, normalizedStroke, computedStroke, "stroke");
        }
      }
    }
  });

  // Convert map to sorted array
  return Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Helper function to add color to the map
 */
function addColorToMap(
  map: Map<string, ColorInfo>,
  normalizedColor: string,
  originalColor: string,
  type: "fill" | "stroke"
) {
  const existing = map.get(normalizedColor);

  if (existing) {
    existing.count++;
    if (!existing.originalFormats.includes(originalColor)) {
      existing.originalFormats.push(originalColor);
    }
    if (existing.type !== type) {
      existing.type = "both";
    }
  } else {
    map.set(normalizedColor, {
      color: normalizedColor,
      count: 1,
      type,
      originalFormats: [originalColor],
    });
  }
}

/**
 * Replace a color in the SVG
 */
export function replaceSVGColor(
  svgElement: SVGElement,
  oldColor: string,
  newColor: string
): void {
  const normalizedOld = normalizeColor(oldColor);

  // Allow transparent/none as new color for eraser functionality
  const normalizedNew = newColor === "transparent" || newColor === "none"
    ? newColor
    : normalizeColor(newColor);

  if (!normalizedOld || !normalizedNew) {
    return;
  }

  const elements = svgElement.querySelectorAll("*");

  elements.forEach((element) => {
    // Replace fill attribute
    const fill = element.getAttribute("fill");
    if (fill && normalizeColor(fill) === normalizedOld) {
      element.setAttribute("fill", normalizedNew);
    }

    // Replace stroke attribute
    const stroke = element.getAttribute("stroke");
    if (stroke && normalizeColor(stroke) === normalizedOld) {
      element.setAttribute("stroke", normalizedNew);
    }

    // Replace style attribute
    if (element instanceof SVGElement) {
      const style = element.getAttribute("style");
      if (style) {
        let newStyle = style;

        // Replace fill in style
        const fillMatch = /fill:\s*([^;]+)/i.exec(style);
        if (fillMatch && normalizeColor(fillMatch[1]) === normalizedOld) {
          newStyle = newStyle.replace(
            /fill:\s*[^;]+/i,
            `fill: ${normalizedNew}`
          );
        }

        // Replace stroke in style
        const strokeMatch = /stroke:\s*([^;]+)/i.exec(style);
        if (strokeMatch && normalizeColor(strokeMatch[1]) === normalizedOld) {
          newStyle = newStyle.replace(
            /stroke:\s*[^;]+/i,
            `stroke: ${normalizedNew}`
          );
        }

        if (newStyle !== style) {
          element.setAttribute("style", newStyle);
        }
      }
    }
  });
}

/**
 * Clone an SVG element
 */
export function cloneSVGElement(svgElement: SVGElement): SVGElement {
  return svgElement.cloneNode(true) as SVGElement;
}

/**
 * Convert SVG element to string
 */
export function svgToString(svgElement: SVGElement): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

/**
 * Convert SVG element to data URL
 */
export function svgToDataURL(svgElement: SVGElement): string {
  const svgString = svgToString(svgElement);
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Create a downloadable blob from SVG element
 */
export function svgToBlob(svgElement: SVGElement): Blob {
  const svgString = svgToString(svgElement);
  return new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
}
