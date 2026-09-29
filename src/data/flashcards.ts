// Flashcard data + SM-2 spaced repetition algorithm

export interface Flashcard {
  id: string;
  front: { en: string; ru: string };
  back: { en: string; ru: string };
  emoji: string;
}

// SM-2 card state
export interface CardState {
  easeFactor: number; // ≥ 1.3
  interval: number; // days
  repetitions: number;
  nextReview: number; // timestamp ms
  lastReview: number; // timestamp ms
}

const SM2_KEY = 'mindmap-v2-sm2';

export function loadSM2(): Record<string, CardState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SM2_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveSM2(states: Record<string, CardState>): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(SM2_KEY, JSON.stringify(states)); } catch {}
}

export function getDefaultCardState(): CardState {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: 0,
    lastReview: 0,
  };
}

// SM-2 algorithm: quality 0-5
export function sm2(state: CardState, quality: number): CardState {
  const q = Math.max(0, Math.min(5, quality));
  let { easeFactor, interval, repetitions } = state;
  
  if (q < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }
  
  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);
  
  const now = Date.now();
  return {
    easeFactor,
    interval,
    repetitions,
    lastReview: now,
    nextReview: now + interval * 24 * 60 * 60 * 1000,
  };
}

export function isDue(state: CardState): boolean {
  if (!state.nextReview) return true;
  return Date.now() >= state.nextReview;
}

export function getDueCount(cards: Flashcard[], states: Record<string, CardState>): number {
  return cards.filter(c => {
    const s = states[c.id];
    return !s || isDue(s);
  }).length;
}

// All flashcards
export const flashcardsData: Flashcard[] = [
  {
    id: 'linear-reg', emoji: '📈',
    front: { en: 'Linear Regression', ru: 'Линейная регрессия' },
    back: { en: 'Simplest algorithm for predicting continuous values: y = wx + b. Minimizes MSE.', ru: 'Простейший алгоритм предсказания: y = wx + b. Минимизирует MSE.' }
  },
  {
    id: 'decision-tree', emoji: '🌳',
    front: { en: 'Decision Tree', ru: 'Дерево решений' },
    back: { en: 'Splits data through if-else conditions. Leaves = prediction.', ru: 'Разбивает данные через if-else условия. Листья = предсказание.' }
  },
  {
    id: 'random-forest', emoji: '🌲',
    front: { en: 'Random Forest', ru: 'Random Forest' },
    back: { en: 'Ensemble of 100-1000 trees voting for result. Robust to overfitting.', ru: 'Ансамбль из 100-1000 деревьев голосующих за результат.' }
  },
  {
    id: 'svm', emoji: '⚔️',
    front: { en: 'SVM', ru: 'SVM' },
    back: { en: 'Finds optimal hyperplane to separate classes. Kernel trick for nonlinear.', ru: 'Находит оптимальную гиперплоскость. Kernel trick для нелинейных границ.' }
  },
  {
    id: 'kmeans', emoji: '🎯',
    front: { en: 'K-Means', ru: 'K-Means' },
    back: { en: 'Groups data into K clusters by proximity to centroids. Iterative.', ru: 'Группирует данные в K кластеров. Итеративно: назначить → пересчитать.' }
  },
  {
    id: 'pca', emoji: '📉',
    front: { en: 'PCA', ru: 'PCA' },
    back: { en: 'Dimensionality reduction preserving maximum variance.', ru: 'Снижение размерности с сохранением максимума вариации.' }
  },
  {
    id: 'nn', emoji: '🔮',
    front: { en: 'Neural Networks', ru: 'Нейронные сети' },
    back: { en: 'Connected neurons: weighted sum + activation. Training via backprop.', ru: 'Нейроны: взвешенная сумма + активация. Обучение через backpropagation.' }
  },
  {
    id: 'cnn', emoji: '👁️',
    front: { en: 'CNN', ru: 'CNN' },
    back: { en: 'Convolutional: sliding filters over images. Edges → shapes → objects.', ru: 'Свёрточные: скользящие фильтры. Края → формы → объекты.' }
  },
  {
    id: 'rnn', emoji: '🔁',
    front: { en: 'RNN', ru: 'RNN' },
    back: { en: 'Recurrent: processes sequences with memory. Vanishing gradient problem.', ru: 'Рекуррентные: обработка последовательностей с памятью. Проблема затухания градиентов.' }
  },
  {
    id: 'lstm', emoji: '🧠',
    front: { en: 'LSTM', ru: 'LSTM' },
    back: { en: '3 gates (forget, input, output) solve vanishing gradient.', ru: '3 ворот (forget, input, output) решают затухание градиентов.' }
  },
  {
    id: 'transformer', emoji: '⚡',
    front: { en: 'Transformer', ru: 'Transformer' },
    back: { en: 'Self-attention: each token sees all others. Parallel processing. Foundation of LLMs.', ru: 'Self-attention: каждый токен видит все другие. Параллельная обработка. Основа LLM.' }
  },
  {
    id: 'attention', emoji: '👁️',
    front: { en: 'Attention Mechanism', ru: 'Механизм Attention' },
    back: { en: 'Computes Query, Key, Value. Dynamic weights to focus on relevant parts.', ru: 'Вычисляет Query, Key, Value. Динамические веса для фокуса на релевантном.' }
  },
  {
    id: 'gan', emoji: '🎭',
    front: { en: 'GAN', ru: 'GAN' },
    back: { en: 'Generator creates fakes, Discriminator detects. Zero-sum game.', ru: 'Генератор создаёт фейки, Дискриминатор проверяет. Игра с нулевой суммой.' }
  },
  {
    id: 'vae', emoji: '🎲',
    front: { en: 'VAE', ru: 'VAE' },
    back: { en: 'Encoder → latent space (μ, σ) → Decoder. Generates new samples.', ru: 'Encoder → latent space (μ, σ) → Decoder. Генерирует новое.' }
  },
  {
    id: 'diffusion', emoji: '🌫️',
    front: { en: 'Diffusion Models', ru: 'Диффузионные модели' },
    back: { en: 'Gradually remove noise from pure noise → high-quality images.', ru: 'Постепенно убирают шум из чистого шума → качественные изображения.' }
  },
  {
    id: 'resnet', emoji: '🏗️',
    front: { en: 'ResNet', ru: 'ResNet' },
    back: { en: 'Skip connections: F(x) + x. Enables very deep networks (152+ layers).', ru: 'Skip connections: F(x) + x. Позволяет очень глубокие сети (152+ слоёв).' }
  },
  {
    id: 'vit', emoji: '🔲',
    front: { en: 'Vision Transformer', ru: 'Vision Transformer' },
    back: { en: 'Image → 16×16 patches → tokens. Self-attention between patches.', ru: 'Изображение → патчи 16×16 → токены. Self-attention между патчами.' }
  },
  {
    id: 'llm', emoji: '🗣️',
    front: { en: 'LLM', ru: 'LLM' },
    back: { en: 'Massive transformers, billions of params. Emergent abilities at scale.', ru: 'Масштабные трансформеры, миллиарды параметров. Emergent abilities при масштабе.' }
  },
  {
    id: 'embeddings', emoji: '📐',
    front: { en: 'Embeddings', ru: 'Embeddings' },
    back: { en: 'Words as vectors. Similar meanings = nearby vectors in space.', ru: 'Слова как векторы. Похожие значения = близкие векторы.' }
  },
  {
    id: 'tokenization', emoji: '✂️',
    front: { en: 'Tokenization', ru: 'Токенизация' },
    back: { en: 'BPE: merges frequent character pairs. Rare words → subwords.', ru: 'BPE: объединяет частые пары. Редкие слова → подслова.' }
  },
  {
    id: 'gpt', emoji: '💬',
    front: { en: 'GPT', ru: 'GPT' },
    back: { en: 'Decoder-only transformer. Predicts next token. Fine-tuned with RLHF.', ru: 'Decoder-only трансформер. Предсказывает следующий токен. RLHF.' }
  },
  {
    id: 'bert', emoji: '🔤',
    front: { en: 'BERT', ru: 'BERT' },
    back: { en: 'Encoder-only, bidirectional. Sees context from both sides.', ru: 'Encoder-only, двунаправленный. Видит контекст с обеих сторон.' }
  },
  {
    id: 'clip', emoji: '🔗',
    front: { en: 'CLIP', ru: 'CLIP' },
    back: { en: 'Connects images and text in shared space. Zero-shot classification.', ru: 'Связывает изображения и текст. Zero-shot классификация.' }
  },
  {
    id: 'xgboost', emoji: '🚀',
    front: { en: 'XGBoost', ru: 'XGBoost' },
    back: { en: 'Gradient boosting: trees fix previous errors. Fast & parallel.', ru: 'Gradient boosting: деревья исправляют ошибки предыдущих. Быстрый.' }
  },
  {
    id: 'dropout', emoji: '🎲',
    front: { en: 'Dropout', ru: 'Dropout' },
    back: { en: 'Randomly drops neurons during training (20-50%). Prevents overfitting.', ru: 'Случайно отключает нейроны (20-50%). Предотвращает переобучение.' }
  },
  {
    id: 'word2vec', emoji: '📝',
    front: { en: 'Word2Vec', ru: 'Word2Vec' },
    back: { en: 'CBOW + Skip-gram. "king - man + woman ≈ queen".', ru: 'CBOW + Skip-gram. "king - man + woman ≈ queen".' }
  },
  {
    id: 'qlearning', emoji: '🎰',
    front: { en: 'Q-Learning', ru: 'Q-Learning' },
    back: { en: 'Learns action-value Q(s,a) without environment model. ε-greedy exploration.', ru: 'Учит Q(s,a) без модели среды. ε-greedy для исследования.' }
  },
  {
    id: 'logreg', emoji: '📊',
    front: { en: 'Logistic Regression', ru: 'Логистическая регрессия' },
    back: { en: 'Sigmoid σ(wx+b) → probability [0,1]. For classification.', ru: 'Сигмоида σ(wx+b) → вероятность [0,1]. Для классификации.' }
  },
  {
    id: 'autoencoder', emoji: '🗜️',
    front: { en: 'Autoencoder', ru: 'Автоэнкодер' },
    back: { en: 'Encoder compresses → bottleneck → Decoder reconstructs. Learns representations.', ru: 'Encoder сжимает → бутылочное горлышко → Decoder восстанавливает.' }
  },
  {
    id: 'yolo', emoji: '⚡',
    front: { en: 'YOLO', ru: 'YOLO' },
    back: { en: 'You Only Look Once. Single pass = detect all objects. Real-time.', ru: 'You Only Look Once. Один проход = все объекты. Реальное время.' }
  },
];
