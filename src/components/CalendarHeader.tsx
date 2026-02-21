import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

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
  setLogoUrl,
  accentColor = '#a5f3fc',
  headerTextColor = '#000000',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="mb-6 print:mb-2 font-serif">
      {/* ── Banner ── */}
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-lg print:rounded-none print:px-4 print:py-2"
        style={{ backgroundColor: accentColor }}
      >
        {/* Logo — left */}
        <div
          className="relative w-16 h-16 flex-shrink-0 rounded-full border-2 border-white/50 flex items-center justify-center cursor-pointer overflow-hidden bg-white/20 group print:w-12 print:h-12 print:border print:border-white/30"
          onClick={() => !logoUrl && fileInputRef.current?.click()}
          title={logoUrl ? '' : 'Upload logo'}
        >
          {logoUrl ? (
            <>
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              <button
                onClick={(e) => { e.stopPropagation(); setLogoUrl(null); }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity print:hidden rounded-full"
              >
                <X size={16} className="text-white" />
              </button>
            </>
          ) : (
            <div className="text-center print:hidden" style={{ color: headerTextColor, opacity: 0.7 }}>
              <Upload className="mx-auto mb-0.5" size={16} />
              <span className="text-[9px] leading-none">Logo</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleLogoUpload}
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
          <div className="text-[10px] uppercase tracking-wider opacity-75 print:text-[8px]">
            Academic Calendar
          </div>
          <div className="flex items-baseline gap-1 justify-end mt-0.5">
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-16 bg-transparent border-none outline-none text-right font-bold text-2xl print:text-xl print:hidden"
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
