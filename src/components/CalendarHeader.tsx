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
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="flex flex-col items-center justify-center mb-8 gap-4 print:mb-1 font-serif">
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-6 w-full mb-1">
          <div 
            className="relative w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white overflow-hidden group print:border-none print:w-16 print:h-16"
            onClick={() => !logoUrl && fileInputRef.current?.click()}
          >
            {logoUrl ? (
              <>
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUrl(null);
                  }}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-2 text-gray-400">
                <Upload className="mx-auto mb-1" size={20} />
                <span className="text-xs">Upload Logo</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/svg+xml" 
              onChange={handleLogoUpload}
            />
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="INSTITUTION NAME"
              className="text-4xl md:text-5xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-300 print:border-none w-full text-center uppercase tracking-wide font-serif print:text-3xl print:leading-tight"
            />
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Address, Phone, Website"
              className="text-sm md:text-base text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-300 print:border-none w-full text-center italic font-serif mt-0 print:text-xs"
            />
          </div>
          
          {/* Spacer to balance logo on left if needed, or just keep centered */}
          <div className="w-24 hidden md:block print:w-16"></div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 print:hidden">
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-24 p-1 border rounded text-3xl font-bold text-center font-serif"
            />
            <span className="text-3xl font-bold text-gray-800 font-serif">/ {startYear + 1}</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 hidden print:inline font-serif">
            {startYear}/{startYear + 1}
          </span>
        </div>
      </div>
    </header>
  );
};
