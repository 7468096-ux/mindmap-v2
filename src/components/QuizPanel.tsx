'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/data/nodes';

interface QuizQuestion {
  id: string;
  question: {
    en: string;
    ru: string;
  };
  options: {
    en: string[];
    ru: string[];
  };
  correctIndex: number;
  explanation: {
    en: string;
    ru: string;
  };
  category: string;
}

interface Props {
  lang: Language;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCorrectAnswer?: () => void;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'ML Basics',
    question: {
      en: 'What type of learning uses labeled data?',
      ru: 'Какой тип обучения использует размеченные данные?',
    },
    options: {
      en: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
      ru: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Supervised Learning uses labeled data (input-output pairs) to train models, like classification or regression tasks.',
      ru: 'Supervised Learning использует размеченные данные (пары вход-выход) для обучения моделей, например для классификации или регрессии.',
    },
  },
  {
    id: 'q2',
    category: 'Deep Learning',
    question: {
      en: 'Which architecture primarily uses the attention mechanism?',
      ru: 'Какая архитектура в основе использует механизм внимания (attention)?',
    },
    options: {
      en: ['CNN', 'RNN', 'Transformer', 'GAN'],
      ru: ['CNN', 'RNN', 'Transformer', 'GAN'],
    },
    correctIndex: 2,
    explanation: {
      en: 'Transformer architecture is built on self-attention mechanism, allowing parallel processing of sequences.',
      ru: 'Архитектура Transformer построена на механизме self-attention, позволяющем обрабатывать последовательности параллельно.',
    },
  },
  {
    id: 'q3',
    category: 'Computer Vision',
    question: {
      en: 'What does CNN stand for?',
      ru: 'Что означает CNN?',
    },
    options: {
      en: ['Central Neural Network', 'Convolutional Neural Network', 'Complex Neural Network', 'Cascading Neural Network'],
      ru: ['Central Neural Network', 'Convolutional Neural Network', 'Complex Neural Network', 'Cascading Neural Network'],
    },
    correctIndex: 1,
    explanation: {
      en: 'CNN stands for Convolutional Neural Network, designed for processing grid-structured data like images.',
      ru: 'CNN означает Convolutional Neural Network (свёрточная нейронная сеть), предназначенная для обработки данных с сеточной структурой, таких как изображения.',
    },
  },
  {
    id: 'q4',
    category: 'ML Basics',
    question: {
      en: 'Which algorithm splits data using if-else conditions?',
      ru: 'Какой алгоритм разбивает данные используя if-else условия?',
    },
    options: {
      en: ['Linear Regression', 'Decision Tree', 'K-Means', 'PCA'],
      ru: ['Linear Regression', 'Decision Tree', 'K-Means', 'PCA'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Decision Tree splits data through a sequence of conditions (if-else), with each node representing a split condition.',
      ru: 'Decision Tree разбивает данные через последовательность условий (if-else), каждый узел представляет условие разбиения.',
    },
  },
  {
    id: 'q5',
    category: 'Deep Learning',
    question: {
      en: 'What problem does LSTM solve compared to basic RNN?',
      ru: 'Какую проблему решает LSTM по сравнению с обычным RNN?',
    },
    options: {
      en: ['Slow training', 'Vanishing gradient', 'High memory usage', 'Poor accuracy'],
      ru: ['Медленное обучение', 'Затухание градиентов', 'Высокое использование памяти', 'Плохая точность'],
    },
    correctIndex: 1,
    explanation: {
      en: 'LSTM uses gates (forget, input, output) to solve the vanishing gradient problem, enabling memory of hundreds of steps.',
      ru: 'LSTM использует ворота (forget, input, output) для решения проблемы затухания градиентов, позволяя помнить сотни шагов.',
    },
  },
  {
    id: 'q6',
    category: 'NLP',
    question: {
      en: 'What is the main advantage of BERT over GPT?',
      ru: 'Главное преимущество BERT перед GPT?',
    },
    options: {
      en: ['Faster training', 'Bidirectional context', 'Smaller model size', 'Better generation'],
      ru: ['Быстрое обучение', 'Двунаправленный контекст', 'Меньший размер модели', 'Лучшая генерация'],
    },
    correctIndex: 1,
    explanation: {
      en: 'BERT is bidirectional, meaning it sees context from both sides (left and right) of each token during training.',
      ru: 'BERT двунаправленный, то есть видит контекст с обеих сторон (слева и справа) от каждого токена во время обучения.',
    },
  },
  {
    id: 'q7',
    category: 'Computer Vision',
    question: {
      en: 'What technique do ResNet skip connections solve?',
      ru: 'Какую проблему решают skip connections в ResNet?',
    },
    options: {
      en: ['Overfitting', 'Vanishing gradient in deep networks', 'Slow inference', 'High compute cost'],
      ru: ['Переобучение', 'Затухание градиентов в глубоких сетях', 'Медленный вывод', 'Высокие вычисления'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Skip connections allow gradients to flow directly through the network, solving vanishing gradient in very deep networks.',
      ru: 'Skip connections позволяют градиентам проходить напрямую через сеть, решая проблему затухания градиентов в очень глубоких сетях.',
    },
  },
  {
    id: 'q8',
    category: 'Generative Models',
    question: {
      en: 'In GANs, what is the role of the discriminator?',
      ru: 'Какова роль дискриминатора в GAN?',
    },
    options: {
      en: ['Generate fake images', 'Distinguish real from fake', 'Compress data', 'Cluster samples'],
      ru: ['Генерировать фальшивые изображения', 'Отличать реальное от фальшивого', 'Сжимать данные', 'Кластеризовать примеры'],
    },
    correctIndex: 1,
    explanation: {
      en: 'The discriminator tries to distinguish real samples from fake ones generated by the generator.',
      ru: 'Дискриминатор пытается отличить реальные примеры от фальшивых, созданных генератором.',
    },
  },
  {
    id: 'q9',
    category: 'ML Basics',
    question: {
      en: 'Which metric is commonly used for classification tasks?',
      ru: 'Какая метрика часто используется для задач классификации?',
    },
    options: {
      en: ['MSE (Mean Squared Error)', 'RMSE', 'Accuracy / F1-Score', 'R²'],
      ru: ['MSE (Mean Squared Error)', 'RMSE', 'Accuracy / F1-Score', 'R²'],
    },
    correctIndex: 2,
    explanation: {
      en: 'Accuracy and F1-Score are classification metrics, while MSE/RMSE/R² are for regression.',
      ru: 'Accuracy и F1-Score — это метрики классификации, а MSE/RMSE/R² — для регрессии.',
    },
  },
  {
    id: 'q10',
    category: 'Computer Vision',
    question: {
      en: 'What does YOLO stand for?',
      ru: 'Что означает YOLO?',
    },
    options: {
      en: ['Yet Another Learning Optimizer', 'You Only Look Once', 'Yield Optimized Large Objects', 'Year of Learning Outcomes'],
      ru: ['Yet Another Learning Optimizer', 'You Only Look Once', 'Yield Optimized Large Objects', 'Year of Learning Outcomes'],
    },
    correctIndex: 1,
    explanation: {
      en: 'YOLO (You Only Look Once) is a fast real-time object detection algorithm that processes the entire image in a single pass.',
      ru: 'YOLO (You Only Look Once) — быстрый алгоритм детекции объектов реального времени, обрабатывающий всё изображение за один проход.',
    },
  },
  {
    id: 'q11',
    category: 'Regularization',
    question: {
      en: 'What is the purpose of Dropout?',
      ru: 'Какова цель Dropout?',
    },
    options: {
      en: ['Speed up training', 'Prevent overfitting', 'Normalize data', 'Increase model capacity'],
      ru: ['Ускорить обучение', 'Предотвратить переобучение', 'Нормализовать данные', 'Увеличить ёмкость модели'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Dropout randomly drops neurons during training to prevent overfitting and force the network to be more robust.',
      ru: 'Dropout случайно отключает нейроны во время обучения, чтобы предотвратить переобучение и заставить сеть быть более устойчивой.',
    },
  },
  {
    id: 'q12',
    category: 'Ensemble Methods',
    question: {
      en: 'How does Random Forest reduce overfitting?',
      ru: 'Как Random Forest уменьшает переобучение?',
    },
    options: {
      en: ['Using only one tree', 'Averaging predictions from multiple trees', 'Pruning all trees', 'Using linear models'],
      ru: ['Используя только одно дерево', 'Усредняя предсказания нескольких деревьев', 'Обрезая все деревья', 'Используя линейные модели'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Random Forest creates many decision trees on random data samples and averages their predictions, reducing overfitting.',
      ru: 'Random Forest создаёт много деревьев решений на случайных выборках данных и усредняет их предсказания, уменьшая переобучение.',
    },
  },
  {
    id: 'q13',
    category: 'NLP',
    question: {
      en: 'What does BPE tokenization do?',
      ru: 'Что делает BPE токенизация?',
    },
    options: {
      en: ['Removes stop words', 'Merges most frequent character pairs', 'Splits by spaces only', 'Converts to lowercase'],
      ru: ['Удаляет стоп-слова', 'Объединяет самые частые пары символов', 'Разбивает только по пробелам', 'Переводит в нижний регистр'],
    },
    correctIndex: 1,
    explanation: {
      en: 'BPE (Byte Pair Encoding) merges the most frequent character pairs, allowing rare words to split into subwords.',
      ru: 'BPE (Byte Pair Encoding) объединяет самые частые пары символов, позволяя редким словам разбиваться на подслова.',
    },
  },
  {
    id: 'q14',
    category: 'Reinforcement Learning',
    question: {
      en: 'What does Q in Q-Learning represent?',
      ru: 'Что обозначает Q в Q-Learning?',
    },
    options: {
      en: ['Quality of data', 'Action-value function', 'Quantum state', 'Query result'],
      ru: ['Качество данных', 'Функция ценности действий', 'Квантовое состояние', 'Результат запроса'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Q(s,a) is the action-value function that estimates the expected reward for taking action a in state s.',
      ru: 'Q(s,a) — это функция ценности действий, которая оценивает ожидаемую награду за выполнение действия a в состоянии s.',
    },
  },
  {
    id: 'q15',
    category: 'Embeddings',
    question: {
      en: 'What property makes embeddings useful?',
      ru: 'Какое свойство делает embeddings полезными?',
    },
    options: {
      en: ['They are always 1-dimensional', 'Similar concepts have nearby vectors', 'They require no training', 'They are binary'],
      ru: ['Они всегда одномерные', 'Похожие концепции имеют близкие векторы', 'Они не требуют обучения', 'Они бинарные'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Embeddings map concepts to vectors where similar meanings are close together in multidimensional space.',
      ru: 'Embeddings отображают концепции в векторы, где похожие значения находятся близко друг к другу в многомерном пространстве.',
    },
  },
  {
    id: 'q16',
    category: 'Dimensionality Reduction',
    question: {
      en: 'What does PCA preserve when reducing dimensions?',
      ru: 'Что сохраняет PCA при снижении размерности?',
    },
    options: {
      en: ['All original features', 'Maximum variance', 'Class labels', 'Nearest neighbors'],
      ru: ['Все исходные признаки', 'Максимальную дисперсию', 'Метки классов', 'Ближайших соседей'],
    },
    correctIndex: 1,
    explanation: {
      en: 'PCA finds principal components that preserve maximum variance (information) in the data.',
      ru: 'PCA находит главные компоненты, которые сохраняют максимальную дисперсию (информацию) в данных.',
    },
  },
  {
    id: 'q17',
    category: 'Clustering',
    question: {
      en: 'What is K in K-Means clustering?',
      ru: 'Что означает K в K-Means кластеризации?',
    },
    options: {
      en: ['Number of features', 'Number of clusters', 'Number of iterations', 'Kernel type'],
      ru: ['Число признаков', 'Число кластеров', 'Число итераций', 'Тип ядра'],
    },
    correctIndex: 1,
    explanation: {
      en: 'K is the predefined number of clusters that K-Means will group the data into.',
      ru: 'K — это заданное число кластеров, на которые K-Means разделит данные.',
    },
  },
  {
    id: 'q18',
    category: 'Generative Models',
    question: {
      en: 'How do Diffusion Models generate images?',
      ru: 'Как Diffusion Models генерируют изображения?',
    },
    options: {
      en: ['By compressing images', 'By gradually removing noise', 'By discriminating real vs fake', 'By clustering pixels'],
      ru: ['Сжимая изображения', 'Постепенно убирая шум', 'Отличая реальное от фальшивого', 'Кластеризуя пиксели'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Diffusion models learn to gradually remove noise, starting from pure noise to generate high-quality images.',
      ru: 'Diffusion models учатся постепенно убирать шум, начиная с чистого шума для генерации высококачественных изображений.',
    },
  },
  {
    id: 'q19',
    category: 'Computer Vision',
    question: {
      en: 'What does Vision Transformer (ViT) split images into?',
      ru: 'На что Vision Transformer (ViT) разбивает изображения?',
    },
    options: {
      en: ['Pixels', 'Patches', 'Layers', 'Channels'],
      ru: ['Пиксели', 'Патчи (patches)', 'Слои', 'Каналы'],
    },
    correctIndex: 1,
    explanation: {
      en: 'ViT splits images into patches (typically 16×16), treating them as tokens for the transformer.',
      ru: 'ViT разбивает изображения на патчи (обычно 16×16), обрабатывая их как токены для трансформера.',
    },
  },
  {
    id: 'q20',
    category: 'Multimodal',
    question: {
      en: 'What does CLIP connect in a shared space?',
      ru: 'Что связывает CLIP в общем пространстве?',
    },
    options: {
      en: ['Audio and video', 'Images and text', 'Text and code', 'Video and text'],
      ru: ['Аудио и видео', 'Изображения и текст', 'Текст и код', 'Видео и текст'],
    },
    correctIndex: 1,
    explanation: {
      en: 'CLIP (Contrastive Language-Image Pre-training) connects images and text in a shared embedding space.',
      ru: 'CLIP (Contrastive Language-Image Pre-training) связывает изображения и текст в общем пространстве embeddings.',
    },
  },
];

const STORAGE_KEY = 'mindmap-v2-quiz';

interface QuizState {
  currentQuestion: number;
  selectedAnswer: number | null;
  showExplanation: boolean;
  score: number;
  wrongAnswers: number[];
  isFinished: boolean;
  shuffledQuestions: QuizQuestion[];
}

export default function QuizPanel({ lang, isOpen, onOpenChange, onCorrectAnswer }: Props) {
  const [bestScore, setBestScore] = useState<number | null>(null);
  
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswer: null,
    showExplanation: false,
    score: 0,
    wrongAnswers: [],
    isFinished: false,
    shuffledQuestions: [],
  });

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBestScore(data.bestScore || null);
      } catch (e) {
        console.error('Failed to load quiz score:', e);
      }
    }
  }, []);

  // Initialize shuffled questions when opening
  useEffect(() => {
    if (isOpen && state.shuffledQuestions.length === 0) {
      startQuiz();
    }
  }, [isOpen]);

  const startQuiz = () => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    setState({
      currentQuestion: 0,
      selectedAnswer: null,
      showExplanation: false,
      score: 0,
      wrongAnswers: [],
      isFinished: false,
      shuffledQuestions: shuffled,
    });
  };

  const handleAnswerSelect = (index: number) => {
    if (state.showExplanation) return;
    
    const currentQ = state.shuffledQuestions[state.currentQuestion];
    const isCorrect = index === currentQ.correctIndex;
    
    setState(prev => ({
      ...prev,
      selectedAnswer: index,
      showExplanation: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      wrongAnswers: isCorrect ? prev.wrongAnswers : [...prev.wrongAnswers, prev.currentQuestion],
    }));
    if (isCorrect && onCorrectAnswer) onCorrectAnswer();
  };

  const handleNext = () => {
    if (state.currentQuestion < state.shuffledQuestions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        showExplanation: false,
      }));
    } else {
      // Quiz finished
      const finalScore = state.score;
      const percentage = Math.round((finalScore / state.shuffledQuestions.length) * 100);
      
      // Save best score
      if (bestScore === null || percentage > bestScore) {
        setBestScore(percentage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestScore: percentage }));
      }
      
      setState(prev => ({ ...prev, isFinished: true }));
    }
  };

  const texts = {
    en: {
      title: 'Mini-Quiz',
      subtitle: 'Test your AI knowledge',
      question: 'Question',
      of: 'of',
      next: 'Next',
      finish: 'Finish',
      tryAgain: 'Try Again',
      reviewWrong: 'Review Wrong Answers',
      score: 'Your Score',
      correct: 'correct',
      best: 'Best',
      excellent: 'Excellent! 🎉',
      good: 'Good job! 👍',
      keepStudying: 'Keep studying! 📚',
      wrongAnswersTitle: 'Review Your Mistakes',
      backToResults: 'Back to Results',
      explanation: 'Explanation',
      yourAnswer: 'Your answer',
      correctAnswer: 'Correct answer',
    },
    ru: {
      title: 'Мини-тест',
      subtitle: 'Проверь знания AI',
      question: 'Вопрос',
      of: 'из',
      next: 'Далее',
      finish: 'Завершить',
      tryAgain: 'Попробовать снова',
      reviewWrong: 'Разобрать ошибки',
      score: 'Твой результат',
      correct: 'правильно',
      best: 'Лучший',
      excellent: 'Отлично! 🎉',
      good: 'Хорошо! 👍',
      keepStudying: 'Продолжай учить! 📚',
      wrongAnswersTitle: 'Разбор ошибок',
      backToResults: 'Назад к результатам',
      explanation: 'Объяснение',
      yourAnswer: 'Твой ответ',
      correctAnswer: 'Правильный ответ',
    },
  };
  const t = texts[lang];

  const currentQ = state.shuffledQuestions[state.currentQuestion];
  const totalQuestions = state.shuffledQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((state.score / totalQuestions) * 100) : 0;

  const getPerformanceMessage = () => {
    if (percentage >= 80) return t.excellent;
    if (percentage >= 60) return t.good;
    return t.keepStudying;
  };

  const [reviewMode, setReviewMode] = useState(false);

  const renderResults = () => (
    <div className="p-4 md:p-6 text-center">
      <div className="text-5xl md:text-6xl mb-3 md:mb-4">
        {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📚'}
      </div>
      <h3 className="text-white text-xl md:text-2xl font-bold mb-2">{t.score}</h3>
      <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
        {state.score}/{totalQuestions}
      </div>
      <div className="text-xl md:text-2xl text-gray-300 mb-3 md:mb-4">{percentage}%</div>
      <p className="text-base md:text-lg text-gray-400 mb-4 md:mb-6">{getPerformanceMessage()}</p>
      
      {bestScore !== null && (
        <div className="mb-6 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
          <div className="text-purple-300 text-sm">
            {t.best}: <span className="font-bold text-lg">{bestScore}%</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={startQuiz}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all"
        >
          🔄 {t.tryAgain}
        </button>
        
        {state.wrongAnswers.length > 0 && (
          <button
            onClick={() => setReviewMode(true)}
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
          >
            📖 {t.reviewWrong} ({state.wrongAnswers.length})
          </button>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-base md:text-lg font-bold">{t.wrongAnswersTitle}</h3>
        <button
          onClick={() => setReviewMode(false)}
          className="text-gray-400 hover:text-white text-xs md:text-sm"
        >
          ← {t.backToResults}
        </button>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        {state.wrongAnswers.map((qIndex) => {
          const question = state.shuffledQuestions[qIndex];
          return (
            <div key={qIndex} className="bg-gray-800/50 rounded-lg p-3 md:p-4 border border-red-900/30">
              <div className="text-white font-medium mb-3 text-sm md:text-base">{question.question[lang]}</div>
              <div className="space-y-2 mb-3">
                {question.options[lang].map((option, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-xs md:text-sm ${
                      i === question.correctIndex
                        ? 'bg-green-900/30 border border-green-700/50 text-green-300'
                        : 'bg-gray-900/50 text-gray-400'
                    }`}
                  >
                    {i === question.correctIndex && '✓ '}{option}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 bg-gray-900/50 p-2 md:p-3 rounded">
                <strong>{t.explanation}:</strong> {question.explanation[lang]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div className="fixed md:absolute inset-x-2 bottom-2 md:bottom-auto md:inset-x-auto md:right-4 md:top-[180px] md:w-[500px] bg-gray-900/95 backdrop-blur rounded-xl shadow-2xl overflow-hidden border border-gray-700 max-h-[80vh] md:max-h-[90vh] overflow-y-auto z-40">
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur z-10">
            <h2 className="text-white font-bold text-base md:text-lg">{t.title}</h2>
            <p className="text-gray-400 text-xs md:text-sm">{t.subtitle}</p>
          </div>

          {/* Content */}
          {state.isFinished ? (
            reviewMode ? renderReview() : renderResults()
          ) : currentQ ? (
            <div className="p-4 md:p-6">
              {/* Progress */}
              <div className="flex justify-between text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                <span>
                  {t.question} {state.currentQuestion + 1} {t.of} {totalQuestions}
                </span>
                <span className="text-purple-400">
                  ⭐ {state.score}/{totalQuestions}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-4 md:mb-6">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((state.currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="mb-4 md:mb-6">
                <div className="text-xs text-purple-400 mb-2 uppercase tracking-wide">
                  {currentQ.category}
                </div>
                <h3 className="text-white text-base md:text-lg font-medium leading-relaxed">
                  {currentQ.question[lang]}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {currentQ.options[lang].map((option, index) => {
                  const isSelected = state.selectedAnswer === index;
                  const isCorrect = index === currentQ.correctIndex;
                  const showResult = state.showExplanation;

                  let className = 'w-full p-3 md:p-4 rounded-lg text-left transition-all border-2 text-sm md:text-base ';
                  
                  if (showResult) {
                    if (isCorrect) {
                      className += 'bg-green-900/20 border-green-600 text-green-300';
                    } else if (isSelected) {
                      className += 'bg-red-900/20 border-red-600 text-red-300';
                    } else {
                      className += 'bg-gray-800/50 border-gray-700 text-gray-400';
                    }
                  } else {
                    className += isSelected
                      ? 'bg-purple-900/30 border-purple-600 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={state.showExplanation}
                      className={className}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <span className="text-xs md:text-sm font-bold mt-0.5">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && isCorrect && <span className="text-lg md:text-xl">✓</span>}
                        {showResult && isSelected && !isCorrect && <span className="text-lg md:text-xl">✗</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {state.showExplanation && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    {t.explanation}
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                    {currentQ.explanation[lang]}
                  </p>
                </div>
              )}

              {/* Next button */}
              {state.showExplanation && (
                <button
                  onClick={handleNext}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all text-sm md:text-base"
                >
                  {state.currentQuestion < totalQuestions - 1 ? t.next : t.finish} →
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
