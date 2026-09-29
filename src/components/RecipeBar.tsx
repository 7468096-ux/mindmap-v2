'use client';

import { initialNodes, Language } from '@/data/nodes';
import { getRecipeById, getRecipeNodeIds } from '@/data/recipes';

interface Props {
  lang: Language;
  recipeId: string | null;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onOpenRecipe: (recipeId: string) => void;
  onClose: () => void;
}

// Floating strip that walks through the active recipe's components on the map
export default function RecipeBar({ lang, recipeId, selectedNodeId, onNodeClick, onOpenRecipe, onClose }: Props) {
  const recipe = recipeId ? getRecipeById(recipeId) : undefined;
  if (!recipe) return null;
  const nodeIds = getRecipeNodeIds(recipe);

  return (
    <div
      className="fixed z-40 left-4 right-4 top-[250px] md:top-4 md:left-[440px] md:right-[132px] flex md:justify-center pointer-events-none"
      data-no-pan
    >
      <div className="pointer-events-auto max-w-full flex items-center gap-2 bg-gray-950/70 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl px-3 py-2">
        <button
          onClick={() => onOpenRecipe(recipe.id)}
          className="shrink-0 flex items-center gap-1.5 text-xs text-purple-200 hover:text-white"
          title={lang === 'ru' ? 'Открыть рецепт' : 'Open recipe'}
        >
          <span className="text-base">{recipe.emoji}</span>
          <span className="hidden lg:inline font-medium max-w-[180px] truncate">{recipe.title[lang]}</span>
        </button>
        <div className="w-px h-5 bg-white/10 shrink-0" />
        <div className="flex items-center gap-1 overflow-x-auto">
          {nodeIds.map((id, i) => {
            const node = initialNodes.find(n => n.id === id);
            if (!node) return null;
            const isSelected = selectedNodeId === id;
            return (
              <div key={id} className="flex items-center gap-1 shrink-0">
                {i > 0 && <span className="text-gray-600 text-xs">→</span>}
                <button
                  onClick={() => onNodeClick(id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                    isSelected ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span>{node.data.emoji}</span>
                  <span className="whitespace-nowrap">{node.data[lang].label}</span>
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/[0.08]"
          title={lang === 'ru' ? 'Закрыть рецепт' : 'Close recipe'}
        >
          ×
        </button>
      </div>
    </div>
  );
}
