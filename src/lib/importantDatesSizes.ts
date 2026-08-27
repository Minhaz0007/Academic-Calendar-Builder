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

export function getImportantDatesSizes(fontSize: number): ImportantDatesSizes {
  const fs = fontSize;
  return {
    titleSize: Math.round(fs * 1.65),
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
