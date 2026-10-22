'use client';

import { Language } from '@/data/nodes';

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div className="flex border border-atlas-grid rounded-[4px] text-xs">
      <button
        onClick={() => onChange('ru')}
        aria-pressed={lang === 'ru'}
        className={`px-2 py-1 font-medium transition-colors ${
          lang === 'ru' 
            ? 'bg-atlas-chalk text-atlas-sky' 
            : 'text-atlas-mist hover:text-atlas-chalk'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => onChange('en')}
        aria-pressed={lang === 'en'}
        className={`px-2 py-1 font-medium transition-colors ${
          lang === 'en' 
            ? 'bg-atlas-chalk text-atlas-sky' 
            : 'text-atlas-mist hover:text-atlas-chalk'
        }`}
      >
        EN
      </button>
    </div>
  );
}
