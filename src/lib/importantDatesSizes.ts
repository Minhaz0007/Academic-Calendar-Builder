// Shared sizing formulas for the Important Dates sidebar, used by both the
// live editor (ImportantDates.tsx) and the print output (PrintView.tsx) so
// the two stay pixel-identical instead of drifting apart independently.

export interface ImportantDatesSizes {
  titleSize: number;    // section title "Important Dates"
  monthSize: number;    // month-group header
  legendTitle: number;  // "Color Legend" title
  legendLabel: number;  // legend item labels
  squareSize: number;   // legend color square (px)
  entryMb: number;      // margin-bottom per entry — tightens as fs grows
  headerMt: number;     // margin-top for month headers — tightens as fs grows
  legendGap: number;    // gap between legend rows
  legendTopMargin: number; // margin-top above the Color Legend divider
}

// Measures the actual rendered pixel width of text in a given CSS font
// shorthand (e.g. "400 14px 'Times New Roman', Georgia, serif"), via an
// offscreen canvas — far more accurate than approximating with `ch` units,
// whose width is based on the '0' glyph and doesn't match the serif font's
// actual (narrower, variable-width) characters.
let measureCanvas: HTMLCanvasElement | null = null;
export function measureTextWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return 0;
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}

// Pixel width for the date-range column, sized to its own rendered text (plus
// a small caret allowance) instead of a fixed fraction of the row — so the
// colon sits immediately after the date instead of leaving a visible gap.
export function dateColumnWidth(text: string, fontSize: number, fontFamily: string): number {
  const width = measureTextWidth(text, `${fontSize}px ${fontFamily}`);
  return Math.max(20, Math.ceil(width) + 2);
}

export function getImportantDatesSizes(fontSize: number): ImportantDatesSizes {
  const fs = fontSize;
  return {
    // Same size as the event text itself (just rendered bold) so the header
    // doesn't eat into the vertical space available for event listings.
    titleSize: fs,
    monthSize: Math.round(fs * 1.2),
    legendTitle: Math.round(fs * 1.35),
    legendLabel: Math.round(fs * 1.1),
    squareSize: Math.round(fs * 2),
    // Spacing tightens as font size grows so larger event text still fits
    // the panel instead of pushing listings past the layout.
    entryMb: Math.max(1, Math.round(3 - (fs - 6) * 0.25)),
    headerMt: Math.max(2, Math.round(6 - (fs - 6) * 0.375)),
    legendGap: Math.max(2, Math.round(fs * 0.3)),
    legendTopMargin: Math.round(fs * 0.4),
  };
}
