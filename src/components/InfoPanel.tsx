'use client';

import { AINode, levelColors, levelLabels, Language } from '@/data/nodes';
import { hasDemo, getDemo } from './demos';
import { getComparisonsForNode } from '@/data/comparisons';
import ComparisonTable from './ComparisonTable';
import { getPathById } from '@/data/learningPaths';
import { getQuizForNode, loadQuizResults } from '@/data/topicQuizzes';
import LinkedText from './LinkedText';
import { getPractical } from '@/data/practical';
import { getRecipesForNode } from '@/data/recipes';

// Render `code` spans inside plain text
function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 === 1
          ? <code key={i} className="px-1 py-0.5 rounded bg-gray-950 text-emerald-300 font-mono text-[12px] break-words">{part}</code>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

interface InfoPanelProps {
  node: AINode | null;
  lang: Language;
  onClose: () => void;
  activePath?: string | null;
  completedNodes?: string[];
  onMarkComplete?: (nodeId: string) => void;
  onNavigateNext?: (nodeId: string) => void;
  onStartExam?: (nodeId: string) => void;
  onNodeNavigate?: (nodeId: string) => void;
  onOpenRecipe?: (recipeId: string) => void;
}

export default function InfoPanel({ node, lang, onClose, activePath, completedNodes = [], onMarkComplete, onNavigateNext, onStartExam, onNodeNavigate, onOpenRecipe }: InfoPanelProps) {
  if (!node) return null;

  const { emoji, level } = node.data;
  const content = node.data[lang];
  const analogy = node.data.analogy;
  const practicalContent = getPractical(node.id, lang);
  const useCases = practicalContent?.useCases ?? content.useCases;
  const whenToUse = practicalContent?.whenToUse ?? content.whenToUse;
  const nodeRecipes = getRecipesForNode(node.id);
  const color = levelColors[level];
  
  const DemoComponent = getDemo(node.id);
  const showDemo = hasDemo(node.id);

  // Learning path navigation
  const path = activePath ? getPathById(activePath) : null;
  const isInPath = path ? path.nodeIds.includes(node.id) : false;
  const isCompleted = completedNodes.includes(node.id);
  const currentStepIndex = path ? path.nodeIds.indexOf(node.id) : -1;
  const nextNodeId = path && currentStepIndex >= 0 && currentStepIndex < path.nodeIds.length - 1
    ? path.nodeIds[currentStepIndex + 1]
    : null;
  const pathProgress = path ? completedNodes.filter(id => path.nodeIds.includes(id)).length : 0;

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Desktop: side panel. Mobile: bottom sheet */}
      <div 
        data-no-pan
        className="fixed inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:absolute md:right-4 md:top-4 md:w-[420px] bg-gray-900 md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden z-50 max-h-[70vh] md:max-h-[90vh] overflow-y-auto"
        onMouseDown={stopPropagation}
        onMouseMove={stopPropagation}
        onTouchStart={stopPropagation}
        onTouchMove={stopPropagation}
      >
      {/* Mobile swipe hint */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-gray-600 rounded-full" />
      </div>

      {/* Header */}
      <div 
        className="p-4 flex items-center gap-3 sticky top-0 z-10"
        style={{ backgroundColor: color }}
      >
        {emoji && <span className="text-3xl">{emoji}</span>}
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{content.label}</h2>
          <span className="text-white/70 text-xs uppercase tracking-wide">
            {levelLabels[lang][level]}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center bg-black/20 rounded-full leading-none transition-colors"
        >
          ×
        </button>
      </div>

      {/* Learning Path Progress */}
      {isInPath && path && (
        <div className="px-4 py-2 bg-purple-900/30 border-b border-purple-700/30 flex items-center gap-2">
          <span className="text-xs text-purple-300">
            📚 {path.title[lang]}: {lang === 'ru' ? 'Шаг' : 'Step'} {currentStepIndex + 1}/{path.nodeIds.length}
          </span>
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${(pathProgress / path.nodeIds.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Interactive Demo */}
      {showDemo && DemoComponent && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
            🎮 {lang === 'ru' ? 'Интерактивное демо' : 'Interactive Demo'}
          </h3>
          <DemoComponent lang={lang} />
        </div>
      )}

      {/* 💡 Simple Analogy */}
      {analogy && (
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-amber-900/10 to-transparent">
          <h3 className="text-amber-400 text-xs uppercase tracking-wide mb-2">
            💡 {lang === 'ru' ? 'Простая аналогия' : 'Simple Analogy'}
          </h3>
          <p className="text-gray-200 text-sm leading-relaxed italic">
            &ldquo;{analogy[lang]}&rdquo;
          </p>
        </div>
      )}
      
      {/* Description */}
      <div className="p-4 border-b border-gray-800">
        <p className="text-gray-300 text-sm leading-relaxed">
          <LinkedText text={content.description} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
        </p>
      </div>
      
      {/* Used in tasks */}
      {nodeRecipes.length > 0 && (
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-transparent">
          <h3 className="text-purple-300 text-xs uppercase tracking-wide mb-2">
            🧩 {lang === 'ru' ? 'Применяется в задачах' : 'Used to build'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {nodeRecipes.map(r => (
              <button
                key={r.id}
                onClick={() => onOpenRecipe?.(r.id)}
                className="px-2.5 py-1 rounded-lg text-xs text-purple-100 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/40 transition-colors"
              >
                {r.emoji} {r.title[lang]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Use Cases */}
      {useCases && useCases.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
            🌍 {lang === 'ru' ? 'Где применяется' : 'Real-World Use Cases'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {useCases.map((useCase, i) => (
              <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                {useCase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* When to Use */}
      {whenToUse && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
            🎯 {lang === 'ru' ? 'Когда брать' : 'When to Use'}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            <LinkedText text={whenToUse} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
          </p>
        </div>
      )}

      {/* Data needed + Try it */}
      {practicalContent && (
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div>
            <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-1.5">
              📦 {lang === 'ru' ? 'Какие нужны данные' : 'Data You Need'}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{practicalContent.dataNeeded}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-900/15 border border-emerald-700/30">
            <h3 className="text-emerald-400 text-xs uppercase tracking-wide mb-1.5">
              🚀 {lang === 'ru' ? 'Попробовать за 10 минут' : 'Try It in 10 Minutes'}
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed"><InlineCode text={practicalContent.tryIt} /></p>
          </div>
        </div>
      )}

      {/* Key Points */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
          📌 {lang === 'ru' ? 'Ключевые моменты' : 'Key Points'}
        </h3>
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => (
            <li key={i} className="text-gray-300 text-sm leading-relaxed">
              <LinkedText text={point} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
            </li>
          ))}
        </ul>
      </div>
      
      {/* How It Works */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
          ⚙️ {lang === 'ru' ? 'Как это работает' : 'How It Works'}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
          <LinkedText text={content.howItWorks} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
        </p>
      </div>
      
      {/* Code Example */}
      {content.codeExample && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-400 text-xs uppercase tracking-wide">
              💻 {lang === 'ru' ? 'Пример кода' : 'Code Example'}
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(content.codeExample!.code)}
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              📋 {lang === 'ru' ? 'Копировать' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-950 rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400 font-mono whitespace-pre">
              {content.codeExample.code}
            </code>
          </pre>
        </div>
      )}
      
      {/* Comparison Tables */}
      {getComparisonsForNode(node.id).map(comparison => (
        <div key={comparison.id} className="p-4 border-b border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
            📊 {comparison.title[lang]}
          </h3>
          <ComparisonTable comparison={comparison} currentNodeId={node.id} lang={lang} />
        </div>
      ))}

      {/* Topic Exam Button */}
      {(() => {
        const topicQuiz = getQuizForNode(node.id);
        if (!topicQuiz) return null;
        const results = loadQuizResults();
        const result = results[node.id];
        const isPassed = result?.passed;
        return (
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={() => onStartExam?.(node.id)}
              className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                isPassed
                  ? 'bg-green-900/20 text-green-400 border border-green-700/30'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
              }`}
            >
              {isPassed ? (
                <>✅ {lang === 'ru' ? `Контрольная сдана (${result.score}%) • +${topicQuiz.xpReward} XP` : `Exam passed (${result.score}%) • +${topicQuiz.xpReward} XP`}</>
              ) : (
                <>📝 {lang === 'ru' ? `Контрольная работа (+${topicQuiz.xpReward} XP)` : `Take Exam (+${topicQuiz.xpReward} XP)`}</>
              )}
            </button>
          </div>
        );
      })()}

      {/* Learning Path Navigation */}
      {isInPath && path && (
        <div className="p-4 bg-gray-800/50">
          <div className="flex gap-2">
            {!isCompleted ? (
              <button
                onClick={() => onMarkComplete?.(node.id)}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm transition-colors"
              >
                ✅ {lang === 'ru' ? 'Изучено' : 'Mark Complete'}
              </button>
            ) : (
              <div className="flex-1 px-4 py-2.5 bg-green-900/30 text-green-400 rounded-lg font-medium text-sm text-center border border-green-700/30">
                ✓ {lang === 'ru' ? 'Пройдено' : 'Completed'}
              </div>
            )}
            {nextNodeId && (
              <button
                onClick={() => onNavigateNext?.(nextNodeId)}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-colors"
              >
                → {lang === 'ru' ? 'Далее' : 'Next'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
