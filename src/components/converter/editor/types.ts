export type EditorTool = "select" | "colorReplace" | "eraser";

export interface EditorState {
  activeTool: EditorTool;
  selectedColor: string | null;
  zoom: number;
  pan: { x: number; y: number };
  showComparison: boolean;
  showMiniMap: boolean;
}

export interface ColorPaletteOption {
  name: string;
  colors: string[];
  category: "material" | "tailwind" | "flat" | "custom";
}
