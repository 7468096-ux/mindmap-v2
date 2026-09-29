// Topic-specific quizzes — XP is earned ONLY by passing these
// Each node branch has its own quiz

import { Language } from './nodes';

export interface TopicQuestion {
  question: { en: string; ru: string };
  options: { en: string[]; ru: string[] };
  correctIndex: number;
  explanation: { en: string; ru: string };
  difficulty: 'recall' | 'understand' | 'apply'; // Bloom's taxonomy
}

export interface TopicQuiz {
  nodeId: string; // which node this quiz belongs to
  title: { en: string; ru: string };
  passingScore: number; // percentage to pass (e.g. 70)
  xpReward: number;
  questions: TopicQuestion[];
}

export const topicQuizzes: TopicQuiz[] = [
  // === ML BASICS ===
  {
    nodeId: 'ml',
    title: { en: 'Machine Learning Basics', ru: 'Основы машинного обучения' },
    passingScore: 70,
    xpReward: 30,
    questions: [
      {
        question: { en: 'What is the main difference between AI and ML?', ru: 'Главное отличие AI от ML?' },
        options: {
          en: ['ML is a subset of AI that learns from data', 'AI is a subset of ML', 'They are the same thing', 'ML only works with images'],
          ru: ['ML — подмножество AI, обучающееся на данных', 'AI — подмножество ML', 'Это одно и то же', 'ML работает только с изображениями'],
        },
        correctIndex: 0,
        explanation: { en: 'ML is a subset of AI focused on learning from data rather than explicit programming.', ru: 'ML — подмножество AI, фокусирующееся на обучении из данных, а не на явном программировании.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'Which type of learning uses labeled data?', ru: 'Какой тип обучения использует размеченные данные?' },
        options: {
          en: ['Unsupervised', 'Supervised', 'Reinforcement', 'Self-supervised'],
          ru: ['Без учителя', 'С учителем', 'С подкреплением', 'Самоконтролируемое'],
        },
        correctIndex: 1,
        explanation: { en: 'Supervised learning uses labeled input-output pairs.', ru: 'Обучение с учителем использует размеченные пары вход-выход.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'You have 10,000 customer records with no labels. Which approach?', ru: 'Есть 10,000 записей клиентов без меток. Какой подход?' },
        options: {
          en: ['Supervised — regression', 'Unsupervised — clustering', 'Reinforcement learning', 'Linear regression'],
          ru: ['С учителем — регрессия', 'Без учителя — кластеризация', 'С подкреплением', 'Линейная регрессия'],
        },
        correctIndex: 1,
        explanation: { en: 'No labels → unsupervised. Clustering groups similar records together.', ru: 'Нет меток → без учителя. Кластеризация группирует похожие записи.' },
        difficulty: 'apply',
      },
    ],
  },
  // === SUPERVISED LEARNING ===
  {
    nodeId: 'supervised',
    title: { en: 'Supervised Learning', ru: 'Обучение с учителем' },
    passingScore: 70,
    xpReward: 25,
    questions: [
      {
        question: { en: 'Linear regression predicts...', ru: 'Линейная регрессия предсказывает...' },
        options: {
          en: ['Categories', 'Continuous values', 'Clusters', 'Probabilities only'],
          ru: ['Категории', 'Непрерывные значения', 'Кластеры', 'Только вероятности'],
        },
        correctIndex: 1,
        explanation: { en: 'Linear regression outputs continuous values (y = wx + b).', ru: 'Линейная регрессия выдаёт непрерывные значения (y = wx + b).' },
        difficulty: 'recall',
      },
      {
        question: { en: 'Decision Tree splits data using...', ru: 'Дерево решений разбивает данные через...' },
        options: {
          en: ['Distance to centroids', 'If-else conditions', 'Gradient descent', 'Random sampling'],
          ru: ['Расстояние до центроидов', 'If-else условия', 'Градиентный спуск', 'Случайную выборку'],
        },
        correctIndex: 1,
        explanation: { en: 'Decision trees use if-else conditions at each node.', ru: 'Деревья решений используют if-else условия в каждом узле.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'You need to predict house prices. Best first model?', ru: 'Нужно предсказать цены на дома. Лучший первый выбор?' },
        options: {
          en: ['K-Means', 'Linear Regression', 'GAN', 'LSTM'],
          ru: ['K-Means', 'Линейная регрессия', 'GAN', 'LSTM'],
        },
        correctIndex: 1,
        explanation: { en: 'House prices are continuous → start with linear regression as baseline.', ru: 'Цены непрерывные → начни с линейной регрессии как базовой модели.' },
        difficulty: 'apply',
      },
    ],
  },
  // === DEEP LEARNING ===
  {
    nodeId: 'dl',
    title: { en: 'Deep Learning', ru: 'Глубокое обучение' },
    passingScore: 70,
    xpReward: 35,
    questions: [
      {
        question: { en: 'What makes a neural network "deep"?', ru: 'Что делает нейросеть "глубокой"?' },
        options: {
          en: ['Large dataset', 'Multiple hidden layers', 'High accuracy', 'Many parameters'],
          ru: ['Большой датасет', 'Много скрытых слоёв', 'Высокая точность', 'Много параметров'],
        },
        correctIndex: 1,
        explanation: { en: 'Deep = multiple hidden layers between input and output.', ru: 'Deep = много скрытых слоёв между входом и выходом.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'CNN is best suited for...', ru: 'CNN лучше всего подходит для...' },
        options: {
          en: ['Text generation', 'Image processing', 'Time series', 'Tabular data'],
          ru: ['Генерации текста', 'Обработки изображений', 'Временных рядов', 'Табличных данных'],
        },
        correctIndex: 1,
        explanation: { en: 'CNN uses convolutions optimized for grid-structured data like images.', ru: 'CNN использует свёртки, оптимизированные для сеточных данных (изображения).' },
        difficulty: 'understand',
      },
      {
        question: { en: 'LSTM solves which RNN problem?', ru: 'LSTM решает какую проблему RNN?' },
        options: {
          en: ['Slow training', 'Vanishing gradient', 'Overfitting', 'Large model size'],
          ru: ['Медленное обучение', 'Затухание градиентов', 'Переобучение', 'Большой размер модели'],
        },
        correctIndex: 1,
        explanation: { en: 'LSTM gates prevent gradient vanishing on long sequences.', ru: 'Ворота LSTM предотвращают затухание градиентов на длинных последовательностях.' },
        difficulty: 'understand',
      },
      {
        question: { en: 'You have sequential sensor data (temperature every minute). Best architecture?', ru: 'Есть последовательные данные с датчиков (температура каждую минуту). Лучшая архитектура?' },
        options: {
          en: ['CNN', 'Linear Regression', 'LSTM / Transformer', 'K-Means'],
          ru: ['CNN', 'Линейная регрессия', 'LSTM / Transformer', 'K-Means'],
        },
        correctIndex: 2,
        explanation: { en: 'Sequential data → RNN/LSTM or Transformer for temporal patterns.', ru: 'Последовательные данные → RNN/LSTM или Transformer для временных паттернов.' },
        difficulty: 'apply',
      },
    ],
  },
  // === TRANSFORMER ===
  {
    nodeId: 'transformer',
    title: { en: 'Transformer & Attention', ru: 'Transformer и Attention' },
    passingScore: 70,
    xpReward: 40,
    questions: [
      {
        question: { en: 'What mechanism allows Transformer to process sequences in parallel?', ru: 'Какой механизм позволяет Transformer обрабатывать последовательности параллельно?' },
        options: {
          en: ['Recurrence', 'Self-Attention', 'Convolution', 'Pooling'],
          ru: ['Рекуррентность', 'Self-Attention', 'Свёртка', 'Пулинг'],
        },
        correctIndex: 1,
        explanation: { en: 'Self-attention computes all token relationships simultaneously.', ru: 'Self-attention вычисляет все связи между токенами одновременно.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'In attention, Q, K, V stand for...', ru: 'В attention Q, K, V означают...' },
        options: {
          en: ['Quality, Knowledge, Value', 'Query, Key, Value', 'Quantize, Kernel, Vector', 'Queue, Keep, Validate'],
          ru: ['Quality, Knowledge, Value', 'Query, Key, Value', 'Quantize, Kernel, Vector', 'Queue, Keep, Validate'],
        },
        correctIndex: 1,
        explanation: { en: 'Query asks "what am I looking for?", Key says "what do I contain?", Value is the actual content.', ru: 'Query спрашивает "что я ищу?", Key говорит "что я содержу?", Value — собственно контент.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'Why does Transformer need positional encoding?', ru: 'Почему Transformer нужно позиционное кодирование?' },
        options: {
          en: ['To reduce memory', 'Because attention has no inherent notion of order', 'To speed up training', 'To prevent overfitting'],
          ru: ['Для экономии памяти', 'Потому что attention не имеет понятия порядка', 'Для ускорения обучения', 'Для предотвращения переобучения'],
        },
        correctIndex: 1,
        explanation: { en: 'Attention is permutation-invariant — positional encoding adds order information.', ru: 'Attention инвариантен к перестановкам — позиционное кодирование добавляет информацию о порядке.' },
        difficulty: 'understand',
      },
    ],
  },
  // === NLP ===
  {
    nodeId: 'nlp',
    title: { en: 'NLP & Language Models', ru: 'NLP и языковые модели' },
    passingScore: 70,
    xpReward: 35,
    questions: [
      {
        question: { en: 'What does tokenization do?', ru: 'Что делает токенизация?' },
        options: {
          en: ['Encrypts text', 'Splits text into processing units', 'Translates text', 'Compresses text'],
          ru: ['Шифрует текст', 'Разбивает текст на единицы обработки', 'Переводит текст', 'Сжимает текст'],
        },
        correctIndex: 1,
        explanation: { en: 'Tokenization splits text into tokens (subwords, words, or characters).', ru: 'Токенизация разбивает текст на токены (подслова, слова или символы).' },
        difficulty: 'recall',
      },
      {
        question: { en: 'GPT is a ___-only transformer', ru: 'GPT — это ___-only трансформер' },
        options: {
          en: ['Encoder', 'Decoder', 'Encoder-Decoder', 'Attention'],
          ru: ['Encoder', 'Decoder', 'Encoder-Decoder', 'Attention'],
        },
        correctIndex: 1,
        explanation: { en: 'GPT uses decoder-only architecture for autoregressive text generation.', ru: 'GPT использует decoder-only архитектуру для авторегрессивной генерации текста.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'What makes embeddings useful for search?', ru: 'Почему embeddings полезны для поиска?' },
        options: {
          en: ['They are binary', 'Similar meanings = nearby vectors', 'They compress to 1 dimension', 'They are always exact'],
          ru: ['Они бинарные', 'Похожие значения = близкие векторы', 'Они сжимают до 1 измерения', 'Они всегда точные'],
        },
        correctIndex: 1,
        explanation: { en: 'Embeddings map semantically similar text to nearby points in vector space.', ru: 'Embeddings отображают семантически близкий текст в близкие точки векторного пространства.' },
        difficulty: 'understand',
      },
    ],
  },
  // === COMPUTER VISION ===
  {
    nodeId: 'cv',
    title: { en: 'Computer Vision', ru: 'Компьютерное зрение' },
    passingScore: 70,
    xpReward: 30,
    questions: [
      {
        question: { en: 'What does a convolution filter detect in an image?', ru: 'Что обнаруживает свёрточный фильтр в изображении?' },
        options: {
          en: ['Colors only', 'Local patterns (edges, textures)', 'Image resolution', 'File format'],
          ru: ['Только цвета', 'Локальные паттерны (края, текстуры)', 'Разрешение изображения', 'Формат файла'],
        },
        correctIndex: 1,
        explanation: { en: 'Convolution filters slide over images detecting local patterns like edges and textures.', ru: 'Свёрточные фильтры скользят по изображению, обнаруживая локальные паттерны — края и текстуры.' },
        difficulty: 'understand',
      },
      {
        question: { en: 'YOLO is special because it...', ru: 'YOLO особенный тем, что...' },
        options: {
          en: ['Uses only CPU', 'Detects all objects in one pass', 'Works only with faces', 'Requires no training'],
          ru: ['Использует только CPU', 'Находит все объекты за один проход', 'Работает только с лицами', 'Не требует обучения'],
        },
        correctIndex: 1,
        explanation: { en: 'YOLO (You Only Look Once) processes the entire image in a single forward pass.', ru: 'YOLO (You Only Look Once) обрабатывает всё изображение за один проход.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'You need to label every pixel in a medical image. Task type?', ru: 'Нужно разметить каждый пиксель на медицинском снимке. Тип задачи?' },
        options: {
          en: ['Classification', 'Object Detection', 'Semantic Segmentation', 'Generation'],
          ru: ['Классификация', 'Детекция объектов', 'Семантическая сегментация', 'Генерация'],
        },
        correctIndex: 2,
        explanation: { en: 'Pixel-level labeling = semantic segmentation (e.g., U-Net for medical images).', ru: 'Попиксельная разметка = семантическая сегментация (например, U-Net для медицинских снимков).' },
        difficulty: 'apply',
      },
    ],
  },
  // === GENERATIVE MODELS ===
  {
    nodeId: 'gan',
    title: { en: 'Generative Models', ru: 'Генеративные модели' },
    passingScore: 70,
    xpReward: 35,
    questions: [
      {
        question: { en: 'In a GAN, what does the generator do?', ru: 'Что делает генератор в GAN?' },
        options: {
          en: ['Classifies real images', 'Creates fake samples from noise', 'Compresses data', 'Trains the discriminator'],
          ru: ['Классифицирует реальные изображения', 'Создаёт фейки из шума', 'Сжимает данные', 'Обучает дискриминатор'],
        },
        correctIndex: 1,
        explanation: { en: 'Generator maps random noise to realistic-looking samples.', ru: 'Генератор превращает случайный шум в реалистичные образцы.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'Diffusion models generate images by...', ru: 'Диффузионные модели генерируют изображения путём...' },
        options: {
          en: ['Competing networks', 'Gradually removing noise', 'Decoding latent codes', 'Copying and pasting'],
          ru: ['Конкурирующих сетей', 'Постепенного удаления шума', 'Декодирования латентных кодов', 'Копирования и вставки'],
        },
        correctIndex: 1,
        explanation: { en: 'Diffusion models learn to reverse a noise-adding process step by step.', ru: 'Диффузионные модели учатся обращать процесс добавления шума шаг за шагом.' },
        difficulty: 'understand',
      },
      {
        question: { en: 'VAE differs from regular autoencoder because it...', ru: 'VAE отличается от обычного автоэнкодера тем, что...' },
        options: {
          en: ['Is faster', 'Learns a probability distribution in latent space', 'Uses no encoder', 'Only works with text'],
          ru: ['Быстрее', 'Учит распределение вероятностей в латентном пространстве', 'Не использует энкодер', 'Работает только с текстом'],
        },
        correctIndex: 1,
        explanation: { en: 'VAE encodes to μ and σ (probability distribution), enabling sampling of new data.', ru: 'VAE кодирует в μ и σ (распределение вероятностей), позволяя генерировать новые данные.' },
        difficulty: 'understand',
      },
    ],
  },
  // === REINFORCEMENT LEARNING ===
  {
    nodeId: 'rl',
    title: { en: 'Reinforcement Learning', ru: 'Обучение с подкреплением' },
    passingScore: 70,
    xpReward: 25,
    questions: [
      {
        question: { en: 'RL agent learns by...', ru: 'RL агент учится через...' },
        options: {
          en: ['Labeled examples', 'Trial and error with rewards', 'Clustering data', 'Copying expert behavior'],
          ru: ['Размеченные примеры', 'Пробы и ошибки с наградами', 'Кластеризацию данных', 'Копирование экспертного поведения'],
        },
        correctIndex: 1,
        explanation: { en: 'RL learns through interaction: action → reward/penalty → adjust policy.', ru: 'RL учится через взаимодействие: действие → награда/штраф → корректировка стратегии.' },
        difficulty: 'recall',
      },
      {
        question: { en: 'Q(s,a) in Q-Learning represents...', ru: 'Q(s,a) в Q-Learning означает...' },
        options: {
          en: ['Quality of data', 'Expected reward for action a in state s', 'Query result', 'Quantization level'],
          ru: ['Качество данных', 'Ожидаемую награду за действие a в состоянии s', 'Результат запроса', 'Уровень квантизации'],
        },
        correctIndex: 1,
        explanation: { en: 'Q-function estimates the expected cumulative reward of taking action a from state s.', ru: 'Q-функция оценивает ожидаемую суммарную награду за действие a из состояния s.' },
        difficulty: 'understand',
      },
    ],
  },
];

// Get quiz for a specific node
export function getQuizForNode(nodeId: string): TopicQuiz | undefined {
  return topicQuizzes.find(q => q.nodeId === nodeId);
}

// Get all quizzes that cover descendants of a node
export function getQuizzesForBranch(nodeId: string): TopicQuiz[] {
  return topicQuizzes.filter(q => q.nodeId === nodeId);
}

// Check if quiz is passed
const QUIZ_RESULTS_KEY = 'mindmap-v2-topic-quiz-results';

export interface QuizResult {
  nodeId: string;
  score: number; // percentage
  passed: boolean;
  date: number; // timestamp
  xpAwarded: boolean;
}

export function loadQuizResults(): Record<string, QuizResult> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(QUIZ_RESULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveQuizResult(result: QuizResult): Record<string, QuizResult> {
  const results = loadQuizResults();
  results[result.nodeId] = result;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results)); } catch {}
  }
  return results;
}
