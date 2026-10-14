import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRif?: boolean;
  inverted?: boolean;
}

export const CondoLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showRif = true,
  inverted = false,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: { title: 'text-sm', sub: 'text-[9px]', rif: 'text-[9px]' },
    md: { title: 'text-lg', sub: 'text-xs', rif: 'text-[10px]' },
    lg: { title: 'text-2xl', sub: 'text-sm', rif: 'text-xs' },
    xl: { title: 'text-4xl', sub: 'text-base', rif: 'text-sm' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} id="condo-official-logo">
      {/* 5-petal flower icon matching the receipt */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Petal 1: Top Red */}
          <path
            d="M 50 15 C 38 18 32 35 44 46 C 47 48 53 48 56 46 C 68 35 62 18 50 15 Z"
            fill="#e11d48"
          />
          {/* Petal 2: Top-Right Orange */}
          <path
            d="M 80 38 C 76 26 59 25 52 38 C 50 41 52 47 55 49 C 70 54 84 49 80 38 Z"
            fill="#ea580c"
          />
          {/* Petal 3: Bottom-Right Yellow */}
          <path
            d="M 72 75 C 80 64 70 48 57 48 C 53 48 49 52 50 56 C 53 71 63 85 72 75 Z"
            fill="#eab308"
          />
          {/* Petal 4: Bottom-Left Green */}
          <path
            d="M 28 75 C 37 85 47 71 50 56 C 51 52 47 48 43 48 C 30 48 20 64 28 75 Z"
            fill="#22c55e"
          />
          {/* Petal 5: Top-Left Cyan/Blue */}
          <path
            d="M 20 38 C 16 49 30 54 45 49 C 48 47 50 41 48 38 C 41 25 24 26 20 38 Z"
            fill="#0284c7"
          />
          {/* Center core */}
          <circle cx="50" cy="48" r="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-heading font-extrabold tracking-tight ${
            inverted ? 'text-white' : 'text-slate-900'
          } ${textSizes[size].title}`}
        >
          Florencia
        </span>
        <span
          className={`font-medium tracking-wide uppercase ${
            inverted ? 'text-slate-200' : 'text-slate-600'
          } ${textSizes[size].sub}`}
        >
          Conjunto Residencial
        </span>
        {showRif && (
          <span
            className={`font-mono font-semibold tracking-wider ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            } ${textSizes[size].rif}`}
          >
            RIF: J-00332379-9
          </span>
        )}
      </div>
    </div>
  );
};
