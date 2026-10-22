'use client';

import { Language } from '@/data/nodes';

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div className="flex p-0.5 gap-0.5 rounded-md bg-black/25 border border-white/[0.08]" role="group">
      <button
        onClick={() => onChange('ru')}
        aria-pressed={lang === 'ru'}
        className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
          lang === 'ru' 
            ? 'bg-white/[0.12] text-white shadow-fluent4' 
            : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => onChange('en')}
        aria-pressed={lang === 'en'}
        className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
          lang === 'en' 
            ? 'bg-white/[0.12] text-white shadow-fluent4' 
            : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
