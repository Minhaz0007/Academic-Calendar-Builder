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

// Width (in `ch` units) for the date-range column, sized to fit its own text
// instead of a fixed fraction of the row — so the colon sits right after the
// date instead of stranded partway across a wide fixed column, leaving the
// description more room to fit on one line.
export function dateColumnWidth(dateRange: string): string {
  return `${Math.min(24, Math.max(5, dateRange.length + 1))}ch`;
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
