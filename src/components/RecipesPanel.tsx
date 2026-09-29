'use client';

import { useEffect } from 'react';
import { initialNodes, Language, levelColors } from '@/data/nodes';
import { recipes, getRecipeById, tierLabels, categoryLabels, Recipe } from '@/data/recipes';

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
    back: '← All tasks',
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
    showOnMap: '🗺️ Show recipe on the map',
  },
  ru: {
    title: 'Решить задачу с AI',
    subtitle: 'Выбери, что хочешь сделать, — увидишь, из каких компонентов это собирается и как',
    back: '← Все задачи',
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
    showOnMap: '🗺️ Показать рецепт на карте',
  },
};

const nodeById = (id: string) => initialNodes.find(n => n.id === id);

function Meter({ value, symbol }: { value: number; symbol: string }) {
  return (
    <span className="tracking-tight">
      {[1, 2, 3].map(i => (
        <span key={i} className={i <= value ? 'opacity-100' : 'opacity-20'}>{symbol}</span>
      ))}
    </span>
  );
}

function RecipeMeta({ recipe, lang }: { recipe: Recipe; lang: Language }) {
  const t = texts[lang];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
      <span>{t.difficulty}: <Meter value={recipe.difficulty} symbol="●" /></span>
      <span>{t.cost}: <Meter value={recipe.cost} symbol="$" /></span>
      <span>⏱ {t.mvp}: {recipe.timeToMvp[lang]}</span>
    </div>
  );
}

function NodeChip({ nodeId, lang, onClick }: { nodeId: string; lang: Language; onClick: () => void }) {
  const node = nodeById(nodeId);
  if (!node) return null;
  const color = levelColors[node.data.level];
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-200 border transition-colors hover:text-white"
      style={{ borderColor: `${color}66`, backgroundColor: `${color}1f` }}
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-gray-950/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 bg-gray-950/95 backdrop-blur-xl border-b border-white/[0.06] flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {recipe ? (
              <>
                <button onClick={() => onSelectRecipe(null)} className="text-xs text-purple-300 hover:text-purple-200 mb-1">
                  {t.back}
                </button>
                <h2 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                  <span className="text-2xl">{recipe.emoji}</span>
                  <span>{recipe.title[lang]}</span>
                </h2>
              </>
            ) : (
              <>
                <h2 className="text-white font-bold text-lg sm:text-xl">🧩 {t.title}</h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{t.subtitle}</p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] shrink-0"
          >
            ×
          </button>
        </div>

        {!recipe ? (
          /* Task list */
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipes.map(r => (
              <button
                key={r.id}
                onClick={() => onSelectRecipe(r.id)}
                className="text-left p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-purple-400/80 mb-0.5">{categoryLabels[r.category][lang]}</div>
                    <h3 className="text-white font-semibold text-sm group-hover:text-purple-200">{r.title[lang]}</h3>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{r.problem[lang]}</p>
                    <div className="mt-2"><RecipeMeta recipe={r} lang={lang} /></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Recipe details */
          <div className="p-4 sm:p-5 space-y-6">
            <div>
              <p className="text-gray-200 text-sm leading-relaxed">{recipe.problem[lang]}</p>
              <div className="mt-2"><RecipeMeta recipe={recipe} lang={lang} /></div>
            </div>

            <section>
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-2">🌍 {t.examples}</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.examples[lang].map(ex => (
                  <span key={ex} className="px-2.5 py-1 bg-white/[0.05] text-gray-300 text-xs rounded-full">{ex}</span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">🔧 {t.pipeline}</h3>
              <ol className="relative space-y-3">
                {recipe.pipeline.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-7 h-7 shrink-0 rounded-full bg-purple-600/80 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      {i < recipe.pipeline.length - 1 && <span className="flex-1 w-px bg-purple-500/30 mt-1" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-white text-sm font-medium">{step.label[lang]}</div>
                      <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{step.detail[lang]}</p>
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
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">🛣️ {t.options}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recipe.options.map(opt => {
                  const tier = tierLabels[opt.tier];
                  return (
                    <div key={opt.tier} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="text-white text-sm font-semibold">{tier.emoji} {tier.title[lang]}</div>
                      <div className="text-[11px] text-purple-300/80 mt-0.5">{tier.hint[lang]}</div>
                      <p className="text-gray-400 text-xs leading-relaxed mt-2">{opt.summary[lang]}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {opt.tools.map(tool => (
                          <span key={tool} className="px-1.5 py-0.5 text-[10px] rounded bg-gray-800 text-gray-300 font-mono">{tool}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-2">📦 {t.data}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{recipe.dataNeeded[lang]}</p>
            </section>

            <section>
              <h3 className="text-amber-400/90 text-xs uppercase tracking-wide mb-2">⚠️ {t.pitfalls}</h3>
              <ul className="space-y-1.5">
                {recipe.pitfalls[lang].map(p => (
                  <li key={p} className="text-gray-300 text-sm leading-relaxed flex gap-2">
                    <span className="text-amber-400/80">•</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>

            {recipe.relatedNodes && recipe.relatedNodes.length > 0 && (
              <section>
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-2">🔗 {t.related}</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.relatedNodes.map(id => (
                    <NodeChip key={id} nodeId={id} lang={lang} onClick={() => onOpenNode(id, recipe.id)} />
                  ))}
                </div>
              </section>
            )}

            <button
              onClick={() => onShowOnMap(recipe.id)}
              className="w-full px-4 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-lg transition-all"
            >
              {t.showOnMap}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
