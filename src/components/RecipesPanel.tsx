'use client';

import { useEffect } from 'react';
import { initialNodes, Language, levelColors } from '@/data/nodes';
import { recipes, getRecipeById, tierLabels, categoryLabels, Recipe, RecipeCategory } from '@/data/recipes';
import {
  PuzzlePiece24Regular, Dismiss20Regular, ArrowLeft20Regular, Map20Regular, Gauge16Regular, Money16Regular, Clock16Regular,
  TextBulletListSquare24Regular, Eye24Regular, Table24Regular, Sparkle24Regular,
  Globe20Regular, Flowchart20Regular, Wrench20Regular, Database20Regular, Warning20Regular, Link20Regular,
} from '@fluentui/react-icons';

interface Props {
  lang: Language;
  isOpen: boolean;
  recipeId: string | null;
  onSelectRecipe: (id: string | null) => void;
  onClose: () => void;
  onOpenNode: (nodeId: string, recipeId: string) => void;
  onShowOnMap: (recipeId: string) => void;
}

const texts = {
  en: {
    title: 'Solve a task with AI',
    subtitle: 'Pick what you want to build — see which components it takes and how to assemble them',
    back: 'All tasks',
    examples: 'Already works like this',
    pipeline: 'How it is built',
    openNode: 'Open on map',
    options: 'Three ways to build it',
    data: 'Data you need',
    pitfalls: 'Common pitfalls',
    related: 'Also useful',
    difficulty: 'Difficulty',
    cost: 'Cost',
    mvp: 'MVP',
    showOnMap: 'Show recipe on the map',
  },
  ru: {
    title: 'Решить задачу с AI',
    subtitle: 'Выбери, что хочешь сделать, — увидишь, из каких компонентов это собирается и как',
    back: 'Все задачи',
    examples: 'Где уже так работает',
    pipeline: 'Из чего собирается',
    openNode: 'Открыть на карте',
    options: 'Три пути реализации',
    data: 'Какие нужны данные',
    pitfalls: 'Типичные ошибки',
    related: 'Полезно также',
    difficulty: 'Сложность',
    cost: 'Стоимость',
    mvp: 'MVP',
    showOnMap: 'Показать рецепт на карте',
  },
};

const nodeById = (id: string) => initialNodes.find(n => n.id === id);

const categoryIcon: Record<RecipeCategory, JSX.Element> = {
  text: <TextBulletListSquare24Regular />,
  vision: <Eye24Regular />,
  data: <Table24Regular />,
  generation: <Sparkle24Regular />,
};
const categoryTint: Record<RecipeCategory, string> = {
  text: '#60a5fa', vision: '#34d399', data: '#fbbf24', generation: '#f472b6',
};

// Fluent rating-style meter: three short bars
function Meter({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-label={`${label}: ${value}/3`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`w-2.5 h-1.5 rounded-sm ${i <= value ? 'bg-violet-300' : 'bg-white/15'}`} />
      ))}
    </span>
  );
}

function RecipeMeta({ recipe, lang }: { recipe: Recipe; lang: Language }) {
  const t = texts[lang];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/70">
      <span className="inline-flex items-center gap-1.5" title={t.difficulty}><Gauge16Regular className="text-white/50" />{t.difficulty} <Meter value={recipe.difficulty} label={t.difficulty} /></span>
      <span className="inline-flex items-center gap-1.5" title={t.cost}><Money16Regular className="text-white/50" />{t.cost} <Meter value={recipe.cost} label={t.cost} /></span>
      <span className="inline-flex items-center gap-1.5" title={t.mvp}><Clock16Regular className="text-white/50" />{t.mvp}: {recipe.timeToMvp[lang]}</span>
    </div>
  );
}

function CategoryBadge({ category, lang }: { category: RecipeCategory; lang: Language }) {
  const c = categoryTint[category];
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-semibold" style={{ color: c, backgroundColor: `${c}1f`, boxShadow: `inset 0 0 0 1px ${c}40` }}>
      {categoryLabels[category][lang]}
    </span>
  );
}

function SectionTitle({ icon, children, tone }: { icon: JSX.Element; children: React.ReactNode; tone?: string }) {
  return (
    <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${tone ?? 'text-white'}`}>
      <span className={tone ? '' : 'text-violet-300'}>{icon}</span>
      {children}
    </h3>
  );
}

function NodeChip({ nodeId, lang, onClick }: { nodeId: string; lang: Language; onClick: () => void }) {
  const node = nodeById(nodeId);
  if (!node) return null;
  const color = levelColors[node.data.level];
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium text-white/90 border transition-colors hover:text-white hover:brightness-125"
      style={{ borderColor: `${color}59`, backgroundColor: `${color}1f` }}
    >
      <span>{node.data.emoji}</span>
      <span>{node.data[lang].label}</span>
    </button>
  );
}

export default function RecipesPanel({ lang, isOpen, recipeId, onSelectRecipe, onClose, onOpenNode, onShowOnMap }: Props) {
  const t = texts[lang];
  const recipe = recipeId ? getRecipeById(recipeId) : undefined;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" data-no-pan>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className="fluent-enter relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl border border-white/[0.1] shadow-fluent64"
        style={{ background: 'rgba(26, 24, 44, 0.86)', backdropFilter: 'blur(40px) saturate(160%)', WebkitBackdropFilter: 'blur(40px) saturate(160%)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/[0.08] flex items-start gap-3" style={{ background: 'rgba(28, 26, 48, 0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
          <div className="flex-1 min-w-0">
            {recipe ? (
              <>
                <button onClick={() => onSelectRecipe(null)} className="fluent-subtle-btn -ml-2 mb-1.5 inline-flex items-center gap-1.5 px-2 py-1 text-xs text-violet-300 hover:text-violet-200">
                  <ArrowLeft20Regular className="w-4 h-4" />{t.back}
                </button>
                <h2 className="text-white font-semibold text-lg sm:text-xl flex items-center gap-3">
                  <span className="shrink-0 w-10 h-10 rounded-lg grid place-items-center text-xl" style={{ backgroundColor: `${categoryTint[recipe.category]}24`, boxShadow: `inset 0 0 0 1px ${categoryTint[recipe.category]}55` }}>{recipe.emoji}</span>
                  <span>{recipe.title[lang]}</span>
                </h2>
              </>
            ) : (
              <>
                <h2 className="text-white font-semibold text-lg sm:text-xl flex items-center gap-3">
                  <span className="shrink-0 w-10 h-10 rounded-lg grid place-items-center text-white bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-fluent4"><PuzzlePiece24Regular /></span>
                  {t.title}
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mt-2">{t.subtitle}</p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
            className="fluent-subtle-btn text-white/70 hover:text-white w-8 h-8 grid place-items-center shrink-0 -mr-1"
          >
            <Dismiss20Regular />
          </button>
        </div>

        {!recipe ? (
          /* Task list */
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipes.map(r => (
              <button
                key={r.id}
                onClick={() => onSelectRecipe(r.id)}
                className="text-left p-4 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] active:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.16] shadow-fluent4 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-11 h-11 rounded-lg grid place-items-center text-2xl" style={{ backgroundColor: `${categoryTint[r.category]}24`, boxShadow: `inset 0 0 0 1px ${categoryTint[r.category]}50` }}>{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4" style={{ color: categoryTint[r.category] }}>{categoryIcon[r.category]}</span>
                      <CategoryBadge category={r.category} lang={lang} />
                    </div>
                    <h3 className="text-white font-semibold text-[15px] leading-snug">{r.title[lang]}</h3>
                    <p className="text-white/65 text-[13px] mt-1 leading-relaxed">{r.problem[lang]}</p>
                    <div className="mt-3"><RecipeMeta recipe={r} lang={lang} /></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Recipe details */
          <div className="p-4 sm:p-5 space-y-6">
            <div>
              <div className="mb-2"><CategoryBadge category={recipe.category} lang={lang} /></div>
              <p className="text-white/85 text-sm leading-relaxed">{recipe.problem[lang]}</p>
              <div className="mt-3"><RecipeMeta recipe={recipe} lang={lang} /></div>
            </div>

            <section>
              <SectionTitle icon={<Globe20Regular />}>{t.examples}</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {recipe.examples[lang].map(ex => (
                  <span key={ex} className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] text-white/80 text-xs rounded-[4px]">{ex}</span>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle icon={<Flowchart20Regular />}>{t.pipeline}</SectionTitle>
              <ol className="relative space-y-3">
                {recipe.pipeline.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-7 h-7 shrink-0 rounded-full text-xs font-semibold flex items-center justify-center" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>{i + 1}</span>
                      {i < recipe.pipeline.length - 1 && <span className="flex-1 w-px bg-white/15 mt-1" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-white text-sm font-semibold">{step.label[lang]}</div>
                      <p className="text-white/65 text-[13px] leading-relaxed mt-0.5">{step.detail[lang]}</p>
                      {step.nodeId && (
                        <div className="mt-1.5">
                          <NodeChip nodeId={step.nodeId} lang={lang} onClick={() => onOpenNode(step.nodeId!, recipe.id)} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <SectionTitle icon={<Wrench20Regular />}>{t.options}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recipe.options.map(opt => {
                  const tier = tierLabels[opt.tier];
                  return (
                    <div key={opt.tier} className="p-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-fluent4">
                      <div className="text-white text-sm font-semibold">{tier.emoji} {tier.title[lang]}</div>
                      <div className="text-xs text-violet-300 mt-0.5">{tier.hint[lang]}</div>
                      <p className="text-white/65 text-[13px] leading-relaxed mt-2">{opt.summary[lang]}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {opt.tools.map(tool => (
                          <span key={tool} className="px-1.5 py-0.5 text-[11px] rounded-[4px] bg-black/30 border border-white/[0.06] text-white/80">{tool}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionTitle icon={<Database20Regular />}>{t.data}</SectionTitle>
              <p className="text-white/75 text-sm leading-relaxed">{recipe.dataNeeded[lang]}</p>
            </section>

            <section>
              <div className="rounded-lg p-4 border border-amber-400/25 bg-amber-400/[0.07]">
                <SectionTitle icon={<Warning20Regular />} tone="text-amber-300">{t.pitfalls}</SectionTitle>
                <ul className="space-y-1.5 -mt-1">
                  {recipe.pitfalls[lang].map(p => (
                    <li key={p} className="text-white/80 text-sm leading-relaxed flex gap-2">
                      <span className="text-amber-300/80">•</span><span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {recipe.relatedNodes && recipe.relatedNodes.length > 0 && (
              <section>
                <SectionTitle icon={<Link20Regular />}>{t.related}</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {recipe.relatedNodes.map(id => (
                    <NodeChip key={id} nodeId={id} lang={lang} onClick={() => onOpenNode(id, recipe.id)} />
                  ))}
                </div>
              </section>
            )}

            <button
              onClick={() => onShowOnMap(recipe.id)}
              className="fluent-accent-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
            >
              <Map20Regular />{t.showOnMap}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
