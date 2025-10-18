import { ColorPaletteOption } from "@/components/converter/editor/types";

// Material Design Color Palettes
export const materialPalettes: ColorPaletteOption[] = [
  {
    name: "Material Red",
    category: "material",
    colors: ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"],
  },
  {
    name: "Material Pink",
    category: "material",
    colors: ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#EC407A", "#E91E63", "#D81B60", "#C2185B", "#AD1457", "#880E4F"],
  },
  {
    name: "Material Purple",
    category: "material",
    colors: ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "#AB47BC", "#9C27B0", "#8E24AA", "#7B1FA2", "#6A1B9A", "#4A148C"],
  },
  {
    name: "Material Blue",
    category: "material",
    colors: ["#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2", "#1565C0", "#0D47A1"],
  },
  {
    name: "Material Green",
    category: "material",
    colors: ["#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50", "#43A047", "#388E3C", "#2E7D32", "#1B5E20"],
  },
  {
    name: "Material Orange",
    category: "material",
    colors: ["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#F57C00", "#EF6C00", "#E65100"],
  },
];

// Tailwind CSS Color Palettes
export const tailwindPalettes: ColorPaletteOption[] = [
  {
    name: "Tailwind Slate",
    category: "tailwind",
    colors: ["#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a"],
  },
  {
    name: "Tailwind Sky",
    category: "tailwind",
    colors: ["#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"],
  },
  {
    name: "Tailwind Emerald",
    category: "tailwind",
    colors: ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
  },
  {
    name: "Tailwind Rose",
    category: "tailwind",
    colors: ["#fff1f2", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337"],
  },
  {
    name: "Tailwind Amber",
    category: "tailwind",
    colors: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
  },
  {
    name: "Tailwind Violet",
    category: "tailwind",
    colors: ["#faf5ff", "#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87"],
  },
];

// Flat UI Color Palettes
export const flatUIPalettes: ColorPaletteOption[] = [
  {
    name: "Flat Ocean",
    category: "flat",
    colors: ["#ECF0F1", "#BDC3C7", "#95A5A6", "#7F8C8D", "#34495E", "#2C3E50", "#1ABC9C", "#16A085", "#27AE60", "#2ECC71"],
  },
  {
    name: "Flat Sunset",
    category: "flat",
    colors: ["#FFF5E4", "#FFE5CC", "#FFD6A0", "#FFC266", "#E67E22", "#D35400", "#E74C3C", "#C0392B", "#F39C12", "#F1C40F"],
  },
  {
    name: "Flat Berry",
    category: "flat",
    colors: ["#FCE4EC", "#F8BBD0", "#F48FB1", "#EC407A", "#E91E63", "#C2185B", "#9C27B0", "#8E24AA", "#673AB7", "#5E35B1"],
  },
  {
    name: "Flat Nature",
    category: "flat",
    colors: ["#E8F8F5", "#D1F2EB", "#A3E4D7", "#76D7C4", "#48C9B0", "#1ABC9C", "#16A085", "#138D75", "#117A65", "#0E6655"],
  },
  {
    name: "Flat Contrast",
    category: "flat",
    colors: ["#FFFFFF", "#ECF0F1", "#BDC3C7", "#95A5A6", "#7F8C8D", "#34495E", "#2C3E50", "#1A1A1A", "#000000", "#E74C3C"],
  },
];

// Trending & Popular Palettes
export const trendingPalettes: ColorPaletteOption[] = [
  {
    name: "Pastel Dream",
    category: "custom",
    colors: ["#FFE5E5", "#FFEEBB", "#FFFFDD", "#E5FFEE", "#E5F5FF", "#F5E5FF", "#FFE5F5", "#FFF0E5", "#E5FFFF", "#FFF5E5"],
  },
  {
    name: "Vibrant Pop",
    category: "custom",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7B731", "#5F27CD", "#00D2D3", "#FF9FF3", "#54A0FF"],
  },
  {
    name: "Monochrome Pro",
    category: "custom",
    colors: ["#FFFFFF", "#F5F5F5", "#E0E0E0", "#BDBDBD", "#9E9E9E", "#757575", "#616161", "#424242", "#212121", "#000000"],
  },
  {
    name: "Retro Wave",
    category: "custom",
    colors: ["#FE4A49", "#FED766", "#009FB7", "#696773", "#EFF1F3", "#2AB7CA", "#FE4A49", "#272727", "#E6F9AF", "#F4B942"],
  },
];

export const allPalettes = [
  ...materialPalettes,
  ...tailwindPalettes,
  ...flatUIPalettes,
  ...trendingPalettes,
];

export function getPalettesByCategory(category: string): ColorPaletteOption[] {
  return allPalettes.filter((p) => p.category === category);
}
