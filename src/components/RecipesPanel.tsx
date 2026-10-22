'use client';

import { useEffect } from 'react';
import { initialNodes, Language, AbstractionLevel } from '@/data/nodes';
import { recipes, getRecipeById, tierLabels, categoryLabels, Recipe, RecipeCategory } from '@/data/recipes';

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
    close: 'Close',
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
    close: 'Закрыть',
    showOnMap: 'Показать рецепт на карте',
  },
};

const nodeById = (id: string) => initialNodes.find(n => n.id === id);

const starSize: Record<AbstractionLevel, number> = { field: 10, theory: 8, method: 6, algorithm: 5, implementation: 4 };

// Line icons per task category (1.5px stroke, inherits color)
function CategoryIcon({ category }: { category: RecipeCategory }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (category) {
    case 'text':
      return <svg {...common}><path d="M4 6h16M4 10h16M4 14h10M4 18h7" /></svg>;
    case 'vision':
      return <svg {...common}><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'data':
      return <svg {...common}><rect x="3.5" y="4.5" width="17" height="15" rx="1" /><path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15" /></svg>;
    default:
      return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M6.3 17.7l2.4-2.4M15.3 8.7l2.4-2.4" /></svg>;
  }
}

// Filled / empty marks for a 1–3 scale
function Meter({ value, label }: { value: number; label: string }) {
  return (
    <span aria-label={`${label}: ${value}/3`} className="inline-flex gap-[3px] align-middle">
      {[1, 2, 3].map(i => (
        <span key={i} className={`w-[7px] h-[7px] rounded-full ${i <= value ? 'bg-atlas-chalk' : 'border border-atlas-grid'}`} />
      ))}
    </span>
  );
}

function RecipeMeta({ recipe, lang }: { recipe: Recipe; lang: Language }) {
  const t = texts[lang];
  return (
    <dl className="grid grid-cols-[auto_auto_auto] justify-start gap-x-6 gap-y-0.5 text-xs">
      <dt className="text-atlas-mist">{t.difficulty}</dt>
      <dt className="text-atlas-mist">{t.cost}</dt>
      <dt className="text-atlas-mist">{t.mvp}</dt>
      <dd><Meter value={recipe.difficulty} label={t.difficulty} /></dd>
      <dd><Meter value={recipe.cost} label={t.cost} /></dd>
      <dd className="text-atlas-chalk">{recipe.timeToMvp[lang]}</dd>
    </dl>
  );
}

function NodeChip({ nodeId, lang, onClick }: { nodeId: string; lang: Language; onClick: () => void }) {
  const node = nodeById(nodeId);
  if (!node) return null;
  const d = starSize[node.data.level];
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] text-sm text-atlas-chalk border border-atlas-grid hover:border-atlas-mist transition-colors"
    >
      <span className="rounded-full bg-atlas-chalk shrink-0" style={{ width: d, height: d }} />
      <span className="font-atlas italic">{node.data[lang].label}</span>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-atlas italic text-lg text-atlas-chalk mb-2">{children}</h3>;
}

const categoryOrder: RecipeCategory[] = ['text', 'vision', 'data', 'generation'];

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
    <div data-no-pan>
      {/* Mobile: dim the map under the sheet */}
      <div className="fixed inset-0 z-[55] bg-atlas-sky/70 md:hidden" onClick={onClose} />
      <aside
        aria-label={t.title}
        className="fixed z-[60] inset-x-0 bottom-0 max-h-[85vh] rounded-t-[10px] border-t md:z-30 md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:max-h-none md:w-[400px] md:rounded-none md:border-t-0 md:border-l border-atlas-grid bg-atlas-pocket flex flex-col"
      >
        <div className="md:hidden flex justify-center pt-2"><span className="w-10 h-1 rounded-full bg-atlas-grid" /></div>
        {/* Header */}
        <header className="px-5 pt-3 pb-4 md:pt-6 md:pr-28 border-b border-atlas-grid flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {recipe ? (
              <>
                <button onClick={() => onSelectRecipe(null)} className="text-sm text-atlas-mist hover:text-atlas-chalk mb-1.5">
                  {t.back}
                </button>
                <h2 className="font-atlas italic text-[26px] leading-tight text-atlas-chalk">{recipe.title[lang]}</h2>
              </>
            ) : (
              <>
                <h2 className="font-atlas italic text-[26px] leading-tight text-atlas-chalk">{t.title}</h2>
                <p className="text-atlas-mist text-sm mt-1 leading-relaxed">{t.subtitle}</p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t.close}
            className="text-atlas-mist hover:text-atlas-chalk text-2xl leading-none w-8 h-8 flex items-center justify-center shrink-0"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!recipe ? (
            /* Task catalogue, grouped by category */
            <div className="pb-6">
              {categoryOrder.map(cat => {
                const list = recipes.filter(r => r.category === cat);
                if (list.length === 0) return null;
                return (
                  <section key={cat} className="pt-5">
                    <h3 className="px-5 flex items-center gap-2 text-atlas-mist font-atlas italic text-lg">
                      <CategoryIcon category={cat} />
                      {categoryLabels[cat][lang]}
                    </h3>
                    <ul className="mt-1">
                      {list.map(r => (
                        <li key={r.id} className="border-b border-atlas-grid/70 last:border-b-0">
                          <button
                            onClick={() => onSelectRecipe(r.id)}
                            className="w-full text-left px-5 py-3.5 hover:bg-atlas-sky/50 transition-colors group"
                          >
                            <span className="block text-atlas-chalk font-medium text-[15px] group-hover:text-atlas-brass transition-colors">{r.title[lang]}</span>
                            <span className="block text-atlas-mist text-sm mt-1 leading-relaxed">{r.problem[lang]}</span>
                            <span className="block mt-2.5"><RecipeMeta recipe={r} lang={lang} /></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Recipe details */
            <div className="px-5 py-5 space-y-7">
              <div>
                <p className="text-atlas-chalk text-[15px] leading-relaxed">{recipe.problem[lang]}</p>
                <div className="mt-3"><RecipeMeta recipe={recipe} lang={lang} /></div>
              </div>

              <section>
                <SectionTitle>{t.examples}</SectionTitle>
                <p className="text-atlas-mist text-sm leading-relaxed">{recipe.examples[lang].join(', ')}</p>
              </section>

              <section>
                <SectionTitle>{t.pipeline}</SectionTitle>
                <ol className="space-y-4 mt-3">
                  {recipe.pipeline.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="w-6 h-6 shrink-0 rounded-full border border-atlas-mist text-atlas-chalk text-xs flex items-center justify-center">{i + 1}</span>
                        {i < recipe.pipeline.length - 1 && <span className="flex-1 w-px bg-atlas-grid mt-1" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="text-atlas-chalk text-sm font-medium">{step.label[lang]}</div>
                        <p className="text-atlas-mist text-sm leading-relaxed mt-0.5">{step.detail[lang]}</p>
                        {step.nodeId && (
                          <div className="mt-2">
                            <NodeChip nodeId={step.nodeId} lang={lang} onClick={() => onOpenNode(step.nodeId!, recipe.id)} />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <SectionTitle>{t.options}</SectionTitle>
                <div className="divide-y divide-atlas-grid border-y border-atlas-grid">
                  {recipe.options.map(opt => {
                    const tier = tierLabels[opt.tier];
                    return (
                      <div key={opt.tier} className="py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-atlas-chalk text-sm font-medium">{tier.title[lang]}</span>
                          <span className="text-xs text-atlas-mist text-right">{tier.hint[lang]}</span>
                        </div>
                        <p className="text-atlas-mist text-sm leading-relaxed mt-1">{opt.summary[lang]}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {opt.tools.map(tool => (
                            <span key={tool} className="px-1.5 py-0.5 text-xs rounded-[3px] bg-atlas-sky text-atlas-chalk">{tool}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <SectionTitle>{t.data}</SectionTitle>
                <p className="text-atlas-mist text-sm leading-relaxed">{recipe.dataNeeded[lang]}</p>
              </section>

              <section>
                <SectionTitle>{t.pitfalls}</SectionTitle>
                <ul className="space-y-2">
                  {recipe.pitfalls[lang].map(p => (
                    <li key={p} className="text-atlas-mist text-sm leading-relaxed pl-3 border-l border-atlas-grid">{p}</li>
                  ))}
                </ul>
              </section>

              {recipe.relatedNodes && recipe.relatedNodes.length > 0 && (
                <section>
                  <SectionTitle>{t.related}</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {recipe.relatedNodes.map(id => (
                      <NodeChip key={id} nodeId={id} lang={lang} onClick={() => onOpenNode(id, recipe.id)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {recipe && (
          <div className="px-5 py-4 border-t border-atlas-grid">
            <button
              onClick={() => onShowOnMap(recipe.id)}
              className="w-full px-4 py-2.5 rounded-[4px] font-medium text-sm bg-atlas-brass text-atlas-sky hover:bg-[#E0B96E] transition-colors"
            >
              {t.showOnMap}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
