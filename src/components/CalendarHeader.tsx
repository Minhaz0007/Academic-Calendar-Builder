import React from 'react';

// Embedded default logo — replace src with the actual logo path once saved to public/logo.png
const DEFAULT_LOGO_SRC = '/logo.png';

interface HeaderProps {
  institutionName: string;
  setInstitutionName: (name: string) => void;
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
  startYear: number;
  setStartYear: (year: number) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  accentColor?: string;
  headerTextColor?: string;
}

export const CalendarHeader: React.FC<HeaderProps> = ({
  institutionName,
  setInstitutionName,
  subtitle,
  setSubtitle,
  startYear,
  setStartYear,
  logoUrl,
  accentColor = '#a5f3fc',
  headerTextColor = '#000000',
}) => {
  // Use Supabase-stored logo if user uploaded one, otherwise fall back to the embedded default
  const effectiveLogo = logoUrl || DEFAULT_LOGO_SRC;

  return (
    <header className="mb-6 print:mb-2 font-serif">
      {/* ── Banner ── */}
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-lg print:rounded-none print:px-4 print:py-2"
        style={{ backgroundColor: accentColor }}
      >
        {/* Logo — left (fixed, no upload button) */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 print:w-12 print:h-12">
          <img
            src={effectiveLogo}
            alt="School Logo"
            className="w-full h-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Name + address — center */}
        <div className="flex-1 text-center min-w-0">
          <input
            type="text"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder="INSTITUTION NAME"
            className="w-full bg-transparent border-none outline-none text-center font-bold uppercase tracking-widest text-3xl print:text-2xl leading-tight placeholder-white/50 print:border-none"
            style={{ color: headerTextColor }}
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Address · Phone · Website"
            className="w-full bg-transparent border-none outline-none text-center text-[11px] print:text-[9px] italic mt-0.5 placeholder-white/50"
            style={{ color: headerTextColor, opacity: 0.85 }}
          />
        </div>

        {/* Year — right */}
        <div className="text-right flex-shrink-0" style={{ color: headerTextColor }}>
          {/* "Academic Calendar" — same size and weight as the year */}
          <div className="font-bold text-2xl print:text-xl leading-tight uppercase tracking-wide">
            Academic Calendar
          </div>
          <div className="flex items-baseline gap-1 justify-end">
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-20 bg-transparent border-none outline-none text-right font-bold text-2xl print:text-xl print:hidden"
              style={{ color: headerTextColor }}
            />
            <span className="font-bold text-2xl print:hidden" style={{ color: headerTextColor }}>
              – {startYear + 1}
            </span>
            {/* Print-only year */}
            <span className="hidden print:inline font-bold text-xl" style={{ color: headerTextColor }}>
              {startYear} – {startYear + 1}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
