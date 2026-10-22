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
import {
  Dismiss20Regular, Lightbulb20Regular, Games20Regular, PuzzlePiece20Regular, Globe20Regular, Target20Regular,
  Box20Regular, Rocket20Regular, Pin20Regular, Settings20Regular, Code20Regular, DataBarVertical20Regular,
  Copy16Regular, BookOpen16Regular, Checkmark20Regular, ArrowRight20Regular, DocumentCheckmark20Regular, CheckmarkCircle20Filled,
} from '@fluentui/react-icons';

// Fluent section header: icon + sentence-case semibold title
function Section({ icon, title, tone = 'text-violet-300' }: { icon: JSX.Element; title: string; tone?: string }) {
  return (
    <h3 className="flex items-center gap-2 text-white text-sm font-semibold mb-2.5">
      <span className={tone}>{icon}</span>{title}
    </h3>
  );
}

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Desktop: side panel. Mobile: bottom sheet */}
      <div 
        data-no-pan
        className="fluent-enter fixed inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:absolute md:right-4 md:top-4 md:w-[420px] rounded-t-xl md:rounded-xl border border-white/[0.1] shadow-fluent64 overflow-hidden z-50 max-h-[70vh] md:max-h-[90vh] overflow-y-auto"
        style={{ background: 'rgba(26, 24, 44, 0.9)', backdropFilter: 'blur(40px) saturate(160%)', WebkitBackdropFilter: 'blur(40px) saturate(160%)' }}
        onMouseDown={stopPropagation}
        onMouseMove={stopPropagation}
        onTouchStart={stopPropagation}
        onTouchMove={stopPropagation}
      >
      {/* Mobile swipe hint */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-white/25 rounded-full" />
      </div>

      {/* Header */}
      <div 
        className="p-4 flex items-center gap-3 sticky top-0 z-10 border-b border-white/[0.08]"
        style={{ background: `linear-gradient(180deg, ${color}33, rgba(28, 26, 48, 0.94) 85%)`, backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
      >
        {emoji && (
          <span className="shrink-0 w-12 h-12 rounded-lg grid place-items-center text-2xl" style={{ backgroundColor: `${color}33`, boxShadow: `inset 0 0 0 1px ${color}80` }}>{emoji}</span>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-lg leading-tight">{content.label}</h2>
          <span className="inline-flex items-center gap-1.5 mt-1 px-1.5 py-0.5 rounded-[4px] text-[11px] font-semibold text-white" style={{ backgroundColor: `${color}40`, boxShadow: `inset 0 0 0 1px ${color}80` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {levelLabels[lang][level]}
          </span>
        </div>
        <button 
          onClick={onClose}
          aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
          className="fluent-subtle-btn text-white/70 hover:text-white w-8 h-8 grid place-items-center shrink-0"
        >
          <Dismiss20Regular />
        </button>
      </div>

      {/* Learning Path Progress */}
      {isInPath && path && (
        <div className="px-4 py-2.5 bg-violet-500/10 border-b border-white/[0.08] flex items-center gap-2">
          <span className="text-xs text-violet-200 inline-flex items-center gap-1.5">
            <BookOpen16Regular /> {path.title[lang]}: {lang === 'ru' ? 'Шаг' : 'Step'} {currentStepIndex + 1}/{path.nodeIds.length}
          </span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-violet-400 transition-all"
              style={{ width: `${(pathProgress / path.nodeIds.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Interactive Demo */}
      {showDemo && DemoComponent && (
        <div className="p-4 border-b border-white/[0.07]">
          <Section icon={<Games20Regular />} title={lang === 'ru' ? 'Интерактивное демо' : 'Interactive demo'} />
          <DemoComponent lang={lang} />
        </div>
      )}

      {/* 💡 Simple Analogy */}
      {analogy && (
        <div className="p-4 border-b border-white/[0.07] bg-amber-400/[0.05]">
          <Section icon={<Lightbulb20Regular />} tone="text-amber-300" title={lang === 'ru' ? 'Простая аналогия' : 'Simple analogy'} />
          <p className="text-white/90 text-sm leading-relaxed italic">
            &ldquo;{analogy[lang]}&rdquo;
          </p>
        </div>
      )}
      
      {/* Description */}
      <div className="p-4 border-b border-white/[0.07]">
        <p className="text-white/80 text-sm leading-relaxed">
          <LinkedText text={content.description} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
        </p>
      </div>
      
      {/* Used in tasks */}
      {nodeRecipes.length > 0 && (
        <div className="p-4 border-b border-white/[0.07]">
          <Section icon={<PuzzlePiece20Regular />} title={lang === 'ru' ? 'Применяется в задачах' : 'Used to build'} />
          <div className="flex flex-wrap gap-2">
            {nodeRecipes.map(r => (
              <button
                key={r.id}
                onClick={() => onOpenRecipe?.(r.id)}
                className="px-2.5 py-1 rounded-[4px] text-xs font-medium text-violet-100 bg-violet-500/15 border border-violet-400/30 hover:bg-violet-500/25 transition-colors"
              >
                {r.emoji} {r.title[lang]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Use Cases */}
      {useCases && useCases.length > 0 && (
        <div className="p-4 border-b border-white/[0.07]">
          <Section icon={<Globe20Regular />} title={lang === 'ru' ? 'Где применяется' : 'Real-world use cases'} />
          <div className="flex flex-wrap gap-2">
            {useCases.map((useCase, i) => (
              <span key={i} className="px-2 py-1 bg-white/[0.06] border border-white/[0.08] text-white/80 text-xs rounded-[4px]">
                {useCase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* When to Use */}
      {whenToUse && (
        <div className="p-4 border-b border-white/[0.07]">
          <Section icon={<Target20Regular />} title={lang === 'ru' ? 'Когда брать' : 'When to use'} />
          <p className="text-white/80 text-sm leading-relaxed">
            <LinkedText text={whenToUse} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
          </p>
        </div>
      )}

      {/* Data needed + Try it */}
      {practicalContent && (
        <div className="p-4 border-b border-white/[0.07] space-y-3">
          <div>
            <Section icon={<Box20Regular />} title={lang === 'ru' ? 'Какие нужны данные' : 'Data you need'} />
            <p className="text-white/80 text-sm leading-relaxed">{practicalContent.dataNeeded}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-400/[0.07] border border-emerald-400/25">
            <Section icon={<Rocket20Regular />} tone="text-emerald-300" title={lang === 'ru' ? 'Попробовать за 10 минут' : 'Try it in 10 minutes'} />
            <p className="text-white/90 text-sm leading-relaxed"><InlineCode text={practicalContent.tryIt} /></p>
          </div>
        </div>
      )}

      {/* Key Points */}
      <div className="p-4 border-b border-white/[0.07]">
        <Section icon={<Pin20Regular />} title={lang === 'ru' ? 'Ключевые моменты' : 'Key points'} />
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => (
            <li key={i} className="text-white/80 text-sm leading-relaxed">
              <LinkedText text={point} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
            </li>
          ))}
        </ul>
      </div>
      
      {/* How It Works */}
      <div className="p-4 border-b border-white/[0.07]">
        <Section icon={<Settings20Regular />} title={lang === 'ru' ? 'Как это работает' : 'How it works'} />
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
          <LinkedText text={content.howItWorks} onTermClick={(id) => onNodeNavigate?.(id)} currentNodeId={node.id} />
        </p>
      </div>
      
      {/* Code Example */}
      {content.codeExample && (
        <div className="p-4 border-b border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-white text-sm font-semibold"><span className="text-violet-300"><Code20Regular /></span>{lang === 'ru' ? 'Пример кода' : 'Code example'}</h3>
            <button
              onClick={() => navigator.clipboard.writeText(content.codeExample!.code)}
              className="fluent-subtle-btn inline-flex items-center gap-1.5 px-2 py-1 text-xs text-white/60 hover:text-white"
            >
              <Copy16Regular /> {lang === 'ru' ? 'Копировать' : 'Copy'}
            </button>
          </div>
          <pre className="bg-black/40 border border-white/[0.06] rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-green-400 font-mono whitespace-pre">
              {content.codeExample.code}
            </code>
          </pre>
        </div>
      )}
      
      {/* Comparison Tables */}
      {getComparisonsForNode(node.id).map(comparison => (
        <div key={comparison.id} className="p-4 border-b border-white/[0.07]">
          <Section icon={<DataBarVertical20Regular />} title={comparison.title[lang]} />
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
          <div className="p-4 border-b border-white/[0.07]">
            <button
              onClick={() => onStartExam?.(node.id)}
              className={`w-full px-4 py-2.5 font-semibold text-sm transition-colors ${
                isPassed
                  ? 'rounded-[4px] bg-emerald-400/10 text-emerald-300 border border-emerald-400/25 inline-flex items-center justify-center gap-2'
                  : 'fluent-accent-btn inline-flex items-center justify-center gap-2'
              }`}
            >
              {isPassed ? (
                <><CheckmarkCircle20Filled /> {lang === 'ru' ? `Контрольная сдана (${result.score}%) • +${topicQuiz.xpReward} XP` : `Exam passed (${result.score}%) • +${topicQuiz.xpReward} XP`}</>
              ) : (
                <><DocumentCheckmark20Regular /> {lang === 'ru' ? `Контрольная работа (+${topicQuiz.xpReward} XP)` : `Take Exam (+${topicQuiz.xpReward} XP)`}</>
              )}
            </button>
          </div>
        );
      })()}

      {/* Learning Path Navigation */}
      {isInPath && path && (
        <div className="p-4 bg-black/20">
          <div className="flex gap-2">
            {!isCompleted ? (
              <button
                onClick={() => onMarkComplete?.(node.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-[4px] font-semibold text-sm transition-colors"
              >
                <Checkmark20Regular /> {lang === 'ru' ? 'Изучено' : 'Mark Complete'}
              </button>
            ) : (
              <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-400/10 text-emerald-300 rounded-[4px] font-semibold text-sm border border-emerald-400/25">
                <CheckmarkCircle20Filled /> {lang === 'ru' ? 'Пройдено' : 'Completed'}
              </div>
            )}
            {nextNodeId && (
              <button
                onClick={() => onNavigateNext?.(nextNodeId)}
                className="fluent-accent-btn flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
              >
                {lang === 'ru' ? 'Далее' : 'Next'} <ArrowRight20Regular />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
