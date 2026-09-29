// Recipes — "start from the task": how to assemble a product from map nodes

type L = { ru: string; en: string };
type LList = { ru: string[]; en: string[] };

export type RecipeTier = 'api' | 'open' | 'custom';
export type RecipeCategory = 'text' | 'vision' | 'data' | 'generation';

export interface RecipeStep {
  nodeId?: string; // map node this step relies on
  label: L;
  detail: L;
}

export interface RecipeOption {
  tier: RecipeTier;
  summary: L;
  tools: string[];
}

export interface Recipe {
  id: string;
  emoji: string;
  category: RecipeCategory;
  title: L;
  problem: L; // the user's goal in their own words
  examples: LList; // products that already work this way
  pipeline: RecipeStep[];
  options: RecipeOption[];
  dataNeeded: L;
  difficulty: 1 | 2 | 3;
  cost: 1 | 2 | 3;
  timeToMvp: L;
  pitfalls: LList;
  relatedNodes?: string[]; // useful nodes that are not pipeline steps
}

export const tierLabels: Record<RecipeTier, { emoji: string; title: L; hint: L }> = {
  api: {
    emoji: '🔌',
    title: { ru: 'Готовый сервис / API', en: 'Ready-made service / API' },
    hint: { ru: 'Быстрее всего, без ML-команды', en: 'Fastest, no ML team needed' },
  },
  open: {
    emoji: '🧰',
    title: { ru: 'Open-source модели', en: 'Open-source models' },
    hint: { ru: 'Дешевле на объёме, данные у вас', en: 'Cheaper at scale, data stays with you' },
  },
  custom: {
    emoji: '🏗️',
    title: { ru: 'Своя дообученная модель', en: 'Your own fine-tuned model' },
    hint: { ru: 'Максимум качества, нужны данные и ML', en: 'Best quality, needs data and ML skills' },
  },
};

export const categoryLabels: Record<RecipeCategory, L> = {
  text: { ru: 'Текст', en: 'Text' },
  vision: { ru: 'Изображения', en: 'Vision' },
  data: { ru: 'Табличные данные', en: 'Tabular data' },
  generation: { ru: 'Генерация', en: 'Generation' },
};

export const recipes: Recipe[] = [
  {
    id: 'docs-chatbot',
    emoji: '💬',
    category: 'text',
    title: { ru: 'Чат-бот по вашим документам', en: 'Chatbot over your documents' },
    problem: {
      ru: 'Хочу, чтобы клиенты или сотрудники задавали вопросы и получали ответы из нашей базы знаний, договоров, инструкций.',
      en: 'I want customers or staff to ask questions and get answers from our knowledge base, contracts, manuals.',
    },
    examples: {
      ru: ['Поддержка первой линии', 'Бот по внутренней вики', 'Помощник юриста по договорам', 'Ассистент по документации API'],
      en: ['First-line support', 'Internal wiki bot', 'Contract assistant for lawyers', 'API documentation assistant'],
    },
    pipeline: [
      {
        nodeId: 'tokenization',
        label: { ru: 'Нарезать документы на фрагменты', en: 'Split documents into chunks' },
        detail: {
          ru: 'Документы делят на куски по 300–1000 токенов с небольшим перекрытием. Размер влияет на качество: слишком мелко — теряется контекст, слишком крупно — в ответ попадает мусор.',
          en: 'Documents are split into 300–1000 token chunks with a small overlap. Size matters: too small loses context, too large drags in noise.',
        },
      },
      {
        nodeId: 'embeddings',
        label: { ru: 'Превратить фрагменты в векторы', en: 'Turn chunks into vectors' },
        detail: {
          ru: 'Embedding-модель превращает каждый фрагмент в вектор смысла. Похожие по смыслу тексты оказываются рядом, даже если слова разные.',
          en: 'An embedding model turns each chunk into a meaning vector. Texts with similar meaning land close together even with different words.',
        },
      },
      {
        label: { ru: 'Сложить в векторную базу', en: 'Store in a vector database' },
        detail: {
          ru: 'Векторы хранятся в базе, которая умеет быстро искать ближайших соседей: pgvector (если уже есть PostgreSQL), Qdrant, Chroma, Pinecone.',
          en: 'Vectors go into a database that finds nearest neighbours fast: pgvector (if you already run PostgreSQL), Qdrant, Chroma, Pinecone.',
        },
      },
      {
        nodeId: 'rag',
        label: { ru: 'Найти релевантные куски под вопрос', en: 'Retrieve relevant chunks for the question' },
        detail: {
          ru: 'Вопрос пользователя тоже превращается в вектор, из базы берутся 3–10 ближайших фрагментов. Это и есть Retrieval в RAG.',
          en: 'The question is embedded too, and the 3–10 closest chunks are pulled from the database. This is the Retrieval in RAG.',
        },
      },
      {
        nodeId: 'llm',
        label: { ru: 'LLM формулирует ответ по найденному', en: 'LLM writes the answer from what was found' },
        detail: {
          ru: 'Найденные фрагменты и вопрос отправляются в LLM. Модель отвечает, опираясь на них, а не на свою память, поэтому знает ваши актуальные данные.',
          en: 'The retrieved chunks and the question go to an LLM. It answers from them rather than from memory, so it knows your current data.',
        },
      },
      {
        nodeId: 'prompt-eng',
        label: { ru: 'Промпт: цитаты и «не знаю»', en: 'Prompt: citations and "I don\'t know"' },
        detail: {
          ru: 'В системном промпте требуем ссылаться на источники и честно говорить «в документах этого нет». Это главный способ снизить галлюцинации.',
          en: 'The system prompt requires citing sources and saying "the documents don\'t cover this". This is the main defence against hallucinations.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'Загрузить файлы в готовый сервис с поиском по документам или собрать RAG на API крупной LLM.',
          en: 'Upload files to a hosted service with document search, or build RAG on top of a major LLM API.',
        },
        tools: ['OpenAI Assistants (file search)', 'Claude Projects', 'NotebookLM', 'Azure AI Search'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Фреймворк для RAG + открытая embedding-модель + векторная БД + open-source LLM на своём сервере.',
          en: 'A RAG framework + open embedding model + vector DB + open-source LLM on your own server.',
        },
        tools: ['LlamaIndex', 'LangChain', 'bge-m3 / multilingual-e5', 'Qdrant / pgvector', 'Ollama / vLLM'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'Дообучить embedding-модель и reranker на своих парах «вопрос → документ», настроить оценку качества.',
          en: 'Fine-tune the embedding model and a reranker on your own question → document pairs, set up quality evaluation.',
        },
        tools: ['sentence-transformers', 'Cross-encoder reranker', 'RAGAS / custom test set'],
      },
    ],
    dataNeeded: {
      ru: 'Сами документы в текстовом виде (PDF, DOCX, HTML, вики). Для оценки качества — 30–100 реальных вопросов с правильными ответами.',
      en: 'The documents as text (PDF, DOCX, HTML, wiki). For quality evaluation, 30–100 real questions with correct answers.',
    },
    difficulty: 2,
    cost: 2,
    timeToMvp: { ru: '1–3 дня', en: '1–3 days' },
    pitfalls: {
      ru: [
        'Галлюцинации: без требования цитировать источники модель уверенно выдумывает',
        'Плохая нарезка документов — главная причина плохих ответов',
        'Таблицы и сканы PDF извлекаются криво — проверьте текст после парсинга',
        'Права доступа: бот не должен показывать документы, которые пользователю видеть нельзя',
        'Индекс устаревает — нужна переиндексация при изменении документов',
      ],
      en: [
        'Hallucinations: without mandatory citations the model confidently makes things up',
        'Bad chunking is the #1 cause of bad answers',
        'Tables and scanned PDFs extract poorly — check the text after parsing',
        'Access control: the bot must not reveal documents the user is not allowed to see',
        'The index goes stale — re-index when documents change',
      ],
    },
    relatedNodes: ['finetuning', 'transformer'],
  },
  {
    id: 'semantic-search',
    emoji: '🔍',
    category: 'text',
    title: { ru: 'Умный поиск по смыслу', en: 'Semantic search' },
    problem: {
      ru: 'Хочу, чтобы поиск по каталогу, статьям или тикетам находил нужное, даже если пользователь описал это своими словами.',
      en: 'I want search over a catalogue, articles or tickets to find the right thing even when users describe it in their own words.',
    },
    examples: {
      ru: ['Поиск товаров «что-то тёплое для похода»', 'Поиск похожих тикетов поддержки', 'Рекомендации похожих статей', 'Поиск дубликатов'],
      en: ['Product search like "something warm for hiking"', 'Finding similar support tickets', 'Related article recommendations', 'Duplicate detection'],
    },
    pipeline: [
      {
        nodeId: 'embeddings',
        label: { ru: 'Векторизовать все объекты', en: 'Embed every item' },
        detail: {
          ru: 'Для каждого товара/статьи считаем embedding по названию и описанию. Делается один раз и обновляется при изменениях.',
          en: 'Compute an embedding for every product/article from its title and description. Done once, updated on change.',
        },
      },
      {
        label: { ru: 'Построить индекс ближайших соседей', en: 'Build a nearest-neighbour index' },
        detail: {
          ru: 'Векторная БД или библиотека (FAISS) ищет похожие векторы за миллисекунды даже среди миллионов объектов.',
          en: 'A vector DB or a library (FAISS) finds similar vectors in milliseconds even among millions of items.',
        },
      },
      {
        nodeId: 'embeddings',
        label: { ru: 'Векторизовать запрос и найти ближайшие', en: 'Embed the query and find the closest items' },
        detail: {
          ru: 'Запрос пользователя кодируется той же моделью, берём top-50 по косинусной близости.',
          en: 'The query is encoded with the same model; take the top 50 by cosine similarity.',
        },
      },
      {
        nodeId: 'bert',
        label: { ru: 'Переранжировать точной моделью', en: 'Re-rank with a precise model' },
        detail: {
          ru: 'Cross-encoder на основе BERT смотрит на пару «запрос + объект» целиком и точнее упорядочивает top-50. Медленнее, поэтому только для кандидатов.',
          en: 'A BERT-based cross-encoder reads each query + item pair together and orders the top 50 more precisely. Slower, so only for candidates.',
        },
      },
      {
        label: { ru: 'Смешать с обычным поиском по словам', en: 'Blend with keyword search' },
        detail: {
          ru: 'Гибридный поиск (векторы + BM25) лучше всего: семантика находит синонимы, ключевые слова — артикулы и точные названия.',
          en: 'Hybrid search (vectors + BM25) works best: semantics catches synonyms, keywords catch SKUs and exact names.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'Embeddings по API + управляемая векторная база или встроенный векторный поиск вашей поисковой системы.',
          en: 'Embeddings via API + a managed vector DB or the built-in vector search of your search engine.',
        },
        tools: ['OpenAI / Cohere / Voyage embeddings', 'Pinecone', 'Elasticsearch / OpenSearch kNN'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Открытая многоязычная embedding-модель на своём сервере + FAISS или Qdrant.',
          en: 'An open multilingual embedding model on your server + FAISS or Qdrant.',
        },
        tools: ['sentence-transformers', 'bge-m3 / multilingual-e5', 'FAISS', 'Qdrant', 'CLIP (image search)'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'Дообучить embedding-модель на логах поиска: какие результаты пользователи реально кликали.',
          en: 'Fine-tune the embedding model on search logs: which results users actually clicked.',
        },
        tools: ['sentence-transformers training', 'Click logs', 'NDCG / Recall@k metrics'],
      },
    ],
    dataNeeded: {
      ru: 'Тексты объектов (названия, описания). Для дообучения — логи поиска или пары «запрос → правильный результат».',
      en: 'Item texts (titles, descriptions). For fine-tuning, search logs or query → correct result pairs.',
    },
    difficulty: 1,
    cost: 1,
    timeToMvp: { ru: '1 день', en: '1 day' },
    pitfalls: {
      ru: [
        'Чисто векторный поиск плохо находит артикулы, коды и редкие названия — нужен гибрид',
        'Модель должна поддерживать язык ваших данных (для русского — многоязычные модели)',
        'Смена embedding-модели требует пересчитать весь индекс',
      ],
      en: [
        'Pure vector search is bad at SKUs, codes and rare names — go hybrid',
        'The model must support your data language (multilingual models for non-English)',
        'Switching the embedding model means re-computing the whole index',
      ],
    },
    relatedNodes: ['word2vec', 'clip', 'rag'],
  },
  {
    id: 'text-classification',
    emoji: '🏷️',
    category: 'text',
    title: { ru: 'Автоматическая разметка текстов', en: 'Automatic text classification' },
    problem: {
      ru: 'Хочу автоматически сортировать обращения, отзывы или письма: тема, тональность, срочность, в какой отдел отправить.',
      en: 'I want to auto-sort tickets, reviews or emails: topic, sentiment, urgency, which team should handle it.',
    },
    examples: {
      ru: ['Маршрутизация тикетов по отделам', 'Анализ тональности отзывов', 'Фильтр спама и токсичности', 'Извлечение полей из заявок'],
      en: ['Routing tickets to teams', 'Review sentiment analysis', 'Spam and toxicity filtering', 'Extracting fields from requests'],
    },
    pipeline: [
      {
        label: { ru: 'Описать классы и разметить примеры', en: 'Define classes and label examples' },
        detail: {
          ru: 'Сначала чёткие определения классов (что считается «жалобой», а что «вопросом»). Затем 50–200 размеченных примеров — даже для LLM они нужны как тестовый набор.',
          en: 'First write clear class definitions (what is a "complaint" vs a "question"). Then 50–200 labelled examples — even with an LLM you need them as a test set.',
        },
      },
      {
        nodeId: 'prompt-eng',
        label: { ru: 'Старт: LLM с промптом и примерами', en: 'Start: an LLM with a prompt and examples' },
        detail: {
          ru: 'Few-shot промпт с описанием классов и JSON-выводом. Работает сразу, без обучения — идеально для MVP и небольшого потока.',
          en: 'A few-shot prompt with class descriptions and JSON output. Works immediately without training — ideal for an MVP and low volume.',
        },
      },
      {
        nodeId: 'embeddings',
        label: { ru: 'Дёшево на объёме: эмбеддинги + простой классификатор', en: 'Cheap at scale: embeddings + a simple classifier' },
        detail: {
          ru: 'Векторизуем тексты и обучаем логистическую регрессию. Стоит копейки на миллионы текстов и часто почти не уступает LLM.',
          en: 'Embed the texts and train a logistic regression. Costs pennies on millions of texts and often nearly matches an LLM.',
        },
      },
      {
        nodeId: 'logreg',
        label: { ru: 'Классификатор выдаёт класс и уверенность', en: 'The classifier outputs a class and confidence' },
        detail: {
          ru: 'Вероятность класса — важный сигнал: уверенные случаи обрабатываются автоматически.',
          en: 'Class probability is an important signal: confident cases are handled automatically.',
        },
      },
      {
        nodeId: 'finetuning',
        label: { ru: 'Максимум качества: дообучить BERT-модель', en: 'Best quality: fine-tune a BERT model' },
        detail: {
          ru: 'Когда размеченных примеров тысячи — дообученная BERT-подобная модель даёт лучшую точность и работает быстро на своём сервере.',
          en: 'With thousands of labelled examples, a fine-tuned BERT-like model gives the best accuracy and runs fast on your server.',
        },
      },
      {
        label: { ru: 'Неуверенные случаи — человеку', en: 'Low-confidence cases go to a human' },
        detail: {
          ru: 'Порог уверенности делит поток: автоматом — 80–90%, остальное проверяет оператор. Его исправления становятся новыми обучающими данными.',
          en: 'A confidence threshold splits the flow: 80–90% automated, the rest reviewed by an operator. Their corrections become new training data.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'LLM по API с промптом и структурированным JSON-ответом. Ноль обучения.',
          en: 'An LLM via API with a prompt and structured JSON output. Zero training.',
        },
        tools: ['Claude / GPT / Gemini API', 'Structured outputs (JSON schema)'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Открытые эмбеддинги + scikit-learn, или готовая модель тональности с Hugging Face.',
          en: 'Open embeddings + scikit-learn, or a ready sentiment model from Hugging Face.',
        },
        tools: ['sentence-transformers', 'scikit-learn', 'Hugging Face pipelines', 'SetFit'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'Дообучение BERT/RoBERTa (для русского — ruBERT и аналоги) на ваших размеченных данных.',
          en: 'Fine-tuning BERT/RoBERTa (or a language-specific variant) on your labelled data.',
        },
        tools: ['Hugging Face Transformers', 'ruBERT / DeBERTa', 'Label Studio'],
      },
    ],
    dataNeeded: {
      ru: 'Минимум 50–200 размеченных примеров для проверки качества; для дообучения — от 1000.',
      en: 'At least 50–200 labelled examples to measure quality; 1000+ for fine-tuning.',
    },
    difficulty: 1,
    cost: 1,
    timeToMvp: { ru: 'Несколько часов', en: 'A few hours' },
    pitfalls: {
      ru: [
        'Размытые определения классов: если люди спорят о разметке, модель тоже будет ошибаться',
        'Дисбаланс классов: 95% «прочее» даёт высокую accuracy при бесполезной модели — смотрите precision/recall',
        'Темы обращений меняются со временем — периодически переобучайте',
      ],
      en: [
        'Fuzzy class definitions: if humans disagree on labels, the model will too',
        'Class imbalance: 95% "other" gives high accuracy with a useless model — check precision/recall',
        'Ticket topics drift over time — retrain periodically',
      ],
    },
    relatedNodes: ['bert', 'llm', 'supervised'],
  },
  {
    id: 'photo-recognition',
    emoji: '👁️',
    category: 'vision',
    title: { ru: 'Распознавание объектов на фото и видео', en: 'Recognising objects in photos and video' },
    problem: {
      ru: 'Хочу, чтобы система сама понимала, что на фото или камере: брак на конвейере, товар на полке, номер машины, повреждение.',
      en: 'I want the system to understand what is in a photo or camera feed: defects on a line, products on a shelf, licence plates, damage.',
    },
    examples: {
      ru: ['Контроль качества на производстве', 'Подсчёт товаров на полках', 'Оценка повреждений авто для страховой', 'Модерация фото', 'Медицинские снимки'],
      en: ['Manufacturing quality control', 'Counting products on shelves', 'Car damage assessment for insurance', 'Photo moderation', 'Medical imaging'],
    },
    pipeline: [
      {
        nodeId: 'img-classification',
        label: { ru: 'Выбрать тип задачи: что на фото?', en: 'Pick the task type: what is in the image?' },
        detail: {
          ru: 'Классификация — один ответ на всю картинку («брак / норма»). Самый простой вариант, начинайте с него, если хватает.',
          en: 'Classification — one answer per image ("defect / ok"). The simplest option; start here if it is enough.',
        },
      },
      {
        nodeId: 'obj-detection',
        label: { ru: '…или где и сколько объектов?', en: '…or where and how many objects?' },
        detail: {
          ru: 'Детекция — рамки вокруг каждого объекта. Нужна для подсчёта, отслеживания, поиска мелких дефектов.',
          en: 'Detection — boxes around each object. Needed for counting, tracking, finding small defects.',
        },
      },
      {
        nodeId: 'segmentation',
        label: { ru: '…или точный контур объекта?', en: '…or the exact object outline?' },
        detail: {
          ru: 'Сегментация — маска по пикселям. Нужна для измерения площади повреждения, медицины, удаления фона.',
          en: 'Segmentation — a per-pixel mask. Needed to measure damaged area, in medicine, for background removal.',
        },
      },
      {
        nodeId: 'yolo',
        label: { ru: 'Взять предобученную модель', en: 'Take a pretrained model' },
        detail: {
          ru: 'Не обучайте с нуля: YOLO (детекция/сегментация), ResNet или ViT (классификация) уже умеют видеть — их нужно только донастроить.',
          en: 'Do not train from scratch: YOLO (detection/segmentation), ResNet or ViT (classification) already know how to see — just adapt them.',
        },
      },
      {
        label: { ru: 'Собрать и разметить свои фото', en: 'Collect and label your own photos' },
        detail: {
          ru: '100–500 фото на класс в реальных условиях съёмки (свет, ракурс, камера). Разметка — в CVAT, Label Studio или Roboflow.',
          en: '100–500 photos per class in real shooting conditions (light, angle, camera). Label them in CVAT, Label Studio or Roboflow.',
        },
      },
      {
        nodeId: 'finetuning',
        label: { ru: 'Дообучить (transfer learning)', en: 'Fine-tune (transfer learning)' },
        detail: {
          ru: 'Дообучение предобученной модели на ваших данных занимает от минут до часов на одной GPU.',
          en: 'Fine-tuning a pretrained model on your data takes minutes to hours on a single GPU.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'Облачные Vision API или мультимодальная LLM, которой можно просто описать задачу словами. Хорошо для малого объёма.',
          en: 'Cloud Vision APIs, or a multimodal LLM you simply describe the task to. Good for low volume.',
        },
        tools: ['Google Cloud Vision', 'AWS Rekognition', 'Claude / GPT-4o (vision)'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Ultralytics YOLO + инструмент разметки: дообучение в несколько команд, запуск даже на камере или телефоне.',
          en: 'Ultralytics YOLO + a labelling tool: fine-tune in a few commands, run even on a camera or phone.',
        },
        tools: ['Ultralytics YOLO', 'Roboflow', 'CVAT', 'timm (ResNet / ViT)', 'CLIP (zero-shot)'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'Своя архитектура и обучение для нестандартных данных: рентген, спутник, тепловизор, микроскоп.',
          en: 'Custom architecture and training for unusual data: X-ray, satellite, thermal, microscopy.',
        },
        tools: ['PyTorch', 'U-Net', 'MONAI (medical)', 'ONNX / TensorRT'],
      },
    ],
    dataNeeded: {
      ru: 'Фото из реальных условий: 100–500 на класс для дообучения. Для zero-shot через CLIP или мультимодальную LLM — только тестовый набор.',
      en: 'Photos from real conditions: 100–500 per class for fine-tuning. For zero-shot via CLIP or a multimodal LLM, just a test set.',
    },
    difficulty: 2,
    cost: 2,
    timeToMvp: { ru: '3–7 дней', en: '3–7 days' },
    pitfalls: {
      ru: [
        'Модель, обученная на «красивых» фото, ломается на реальной камере — собирайте данные в боевых условиях',
        'Качество разметки важнее архитектуры',
        'Редкие дефекты: примеров мало — нужна аугментация или синтетические данные',
        'Скорость: на видео в реальном времени нужна лёгкая модель (YOLO nano/small)',
      ],
      en: [
        'A model trained on "nice" photos breaks on the real camera — collect data in production conditions',
        'Label quality matters more than architecture',
        'Rare defects: few examples — use augmentation or synthetic data',
        'Speed: real-time video needs a light model (YOLO nano/small)',
      ],
    },
    relatedNodes: ['cnn', 'resnet', 'vit', 'clip', 'unet'],
  },
  {
    id: 'forecasting',
    emoji: '📈',
    category: 'data',
    title: { ru: 'Прогноз продаж, спроса, оттока', en: 'Forecasting sales, demand, churn' },
    problem: {
      ru: 'Хочу по истории данных предсказывать будущее: сколько закупить, кто из клиентов уйдёт, какой будет выручка.',
      en: 'I want to predict the future from historical data: how much to stock, which customers will churn, what revenue will be.',
    },
    examples: {
      ru: ['Прогноз спроса для закупок', 'Предсказание оттока клиентов', 'Кредитный скоринг', 'Оценка стоимости недвижимости', 'Прогноз нагрузки на колл-центр'],
      en: ['Demand forecasting for purchasing', 'Customer churn prediction', 'Credit scoring', 'Real-estate price estimation', 'Call-centre load forecasting'],
    },
    pipeline: [
      {
        label: { ru: 'Собрать таблицу истории', en: 'Build a history table' },
        detail: {
          ru: 'Одна строка — одно событие (день × товар, клиент × месяц). Столбцы — всё, что может влиять: цена, промо, сезон, праздники, погода.',
          en: 'One row per event (day × product, customer × month). Columns are everything that may matter: price, promos, season, holidays, weather.',
        },
      },
      {
        nodeId: 'linear-reg',
        label: { ru: 'Базовая линия: простая модель', en: 'Baseline: a simple model' },
        detail: {
          ru: 'Линейная регрессия или «как в прошлом году» — точка отсчёта. Если сложная модель её не обгоняет, она не нужна.',
          en: 'Linear regression or "same as last year" is the reference point. If a complex model cannot beat it, you do not need it.',
        },
      },
      {
        nodeId: 'xgboost',
        label: { ru: 'Основная модель: градиентный бустинг', en: 'Main model: gradient boosting' },
        detail: {
          ru: 'На табличных данных XGBoost / LightGBM / CatBoost почти всегда лучше нейросетей: точнее, быстрее, требуют меньше данных.',
          en: 'On tabular data XGBoost / LightGBM / CatBoost nearly always beat neural nets: more accurate, faster, need less data.',
        },
      },
      {
        label: { ru: 'Проверить на «будущем»', en: 'Validate on the "future"' },
        detail: {
          ru: 'Обучаем на данных до даты X, проверяем после. Случайное перемешивание строк даёт ложно хорошие результаты.',
          en: 'Train on data before date X, test after it. Randomly shuffling rows gives falsely good results.',
        },
      },
      {
        nodeId: 'decision-tree',
        label: { ru: 'Объяснить прогноз бизнесу', en: 'Explain the forecast to the business' },
        detail: {
          ru: 'Важность признаков и SHAP показывают, почему модель так решила — без этого прогнозу редко доверяют.',
          en: 'Feature importance and SHAP show why the model decided so — without it, people rarely trust the forecast.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'AutoML в облаке: загружаете таблицу, выбираете целевой столбец — сервис сам подбирает модель.',
          en: 'Cloud AutoML: upload a table, pick the target column — the service picks the model.',
        },
        tools: ['Google Vertex AI AutoML', 'Amazon SageMaker Canvas', 'Azure AutoML'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Python-стек: pandas + градиентный бустинг. Для чистых временных рядов — специализированные библиотеки.',
          en: 'Python stack: pandas + gradient boosting. For pure time series, specialised libraries.',
        },
        tools: ['scikit-learn', 'XGBoost / LightGBM / CatBoost', 'Prophet', 'statsforecast', 'SHAP'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'Нейросетевые модели рядов, когда рядов тысячи и есть общие закономерности (сети магазинов, IoT).',
          en: 'Neural time-series models when you have thousands of related series (store chains, IoT).',
        },
        tools: ['PyTorch Forecasting', 'N-BEATS / TFT', 'LSTM'],
      },
    ],
    dataNeeded: {
      ru: 'История минимум за 1–2 полных сезонных цикла (обычно 2+ года для годовой сезонности), тысячи строк.',
      en: 'History covering at least 1–2 full seasonal cycles (usually 2+ years for yearly seasonality), thousands of rows.',
    },
    difficulty: 2,
    cost: 1,
    timeToMvp: { ru: '2–5 дней', en: '2–5 days' },
    pitfalls: {
      ru: [
        'Утечка данных: признак, который неизвестен в момент прогноза (например, «вернул товар»), даёт фальшивую точность',
        'Случайное разбиение вместо разбиения по времени',
        'Резкие изменения мира (кризис, новый конкурент) ломают модели, обученные на прошлом',
        'Нейросеть на маленькой таблице — почти всегда хуже бустинга',
      ],
      en: [
        'Data leakage: a feature unknown at prediction time (e.g. "returned the item") gives fake accuracy',
        'Random split instead of a time-based split',
        'Sudden world changes (crisis, new competitor) break models trained on the past',
        'A neural net on a small table is almost always worse than boosting',
      ],
    },
    relatedNodes: ['random-forest', 'lstm', 'supervised'],
  },
  {
    id: 'image-generation',
    emoji: '🎨',
    category: 'generation',
    title: { ru: 'Генерация изображений для продукта', en: 'Image generation for your product' },
    problem: {
      ru: 'Хочу генерировать картинки: баннеры, иллюстрации, фото товаров в интерьере, аватары — в едином стиле бренда.',
      en: 'I want to generate images: banners, illustrations, product shots in interiors, avatars — in a consistent brand style.',
    },
    examples: {
      ru: ['Фото товаров на разном фоне', 'Иллюстрации к статьям', 'Варианты рекламных креативов', 'Аватары и стикеры', 'Концепт-арт'],
      en: ['Product photos on different backgrounds', 'Article illustrations', 'Ad creative variations', 'Avatars and stickers', 'Concept art'],
    },
    pipeline: [
      {
        nodeId: 'prompt-eng',
        label: { ru: 'Текстовое описание (промпт)', en: 'Text description (prompt)' },
        detail: {
          ru: 'Описываем объект, стиль, свет, композицию. Шаблоны промптов с переменными дают предсказуемый результат в продукте.',
          en: 'Describe the subject, style, lighting, composition. Prompt templates with variables give predictable results in a product.',
        },
      },
      {
        nodeId: 'clip',
        label: { ru: 'Текст → понятный модели вектор', en: 'Text → a vector the model understands' },
        detail: {
          ru: 'Текстовый энкодер (CLIP или T5) переводит промпт в представление, которым управляется генерация.',
          en: 'A text encoder (CLIP or T5) turns the prompt into the representation that steers generation.',
        },
      },
      {
        nodeId: 'diffusion',
        label: { ru: 'Диффузия: из шума в картинку', en: 'Diffusion: from noise to image' },
        detail: {
          ru: 'Модель за 20–50 шагов убирает шум, ориентируясь на промпт. Больше шагов — детальнее, но медленнее.',
          en: 'The model removes noise over 20–50 steps guided by the prompt. More steps — more detail, but slower.',
        },
      },
      {
        nodeId: 'stable-diffusion',
        label: { ru: 'Контроль композиции', en: 'Control the composition' },
        detail: {
          ru: 'img2img, inpainting и ControlNet позволяют задать позу, контур или исходное фото — без этого результат случаен.',
          en: 'img2img, inpainting and ControlNet let you fix pose, outline or a source photo — without them the result is random.',
        },
      },
      {
        nodeId: 'finetuning',
        label: { ru: 'Стиль бренда или конкретный товар: LoRA', en: 'Brand style or a specific product: LoRA' },
        detail: {
          ru: 'LoRA-дообучение на 10–50 изображениях учит модель вашему стилю, персонажу или товару. Занимает около часа на GPU.',
          en: 'LoRA fine-tuning on 10–50 images teaches the model your style, character or product. Takes about an hour on a GPU.',
        },
      },
      {
        label: { ru: 'Модерация и постобработка', en: 'Moderation and post-processing' },
        detail: {
          ru: 'Фильтр недопустимого контента, апскейл, проверка человеком перед публикацией.',
          en: 'Unsafe-content filter, upscaling, human review before publishing.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'Генерация по API или в готовом сервисе. Высокое качество сразу, оплата за картинку.',
          en: 'Generation via API or a hosted tool. High quality out of the box, pay per image.',
        },
        tools: ['Midjourney', 'OpenAI Images', 'FLUX via API (Replicate, fal.ai)', 'Adobe Firefly'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Открытые модели на своей GPU: полный контроль, ControlNet, никаких ограничений по объёму.',
          en: 'Open models on your own GPU: full control, ControlNet, no volume limits.',
        },
        tools: ['Stable Diffusion XL', 'FLUX', 'diffusers', 'ComfyUI', 'ControlNet'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'LoRA / DreamBooth на ваших товарах или персонажах для узнаваемого и стабильного результата.',
          en: 'LoRA / DreamBooth on your products or characters for a recognisable, consistent result.',
        },
        tools: ['kohya_ss', 'diffusers LoRA training', 'DreamBooth'],
      },
    ],
    dataNeeded: {
      ru: 'Для API — ничего. Для LoRA — 10–50 качественных изображений стиля или объекта.',
      en: 'For APIs — nothing. For LoRA — 10–50 good images of the style or object.',
    },
    difficulty: 1,
    cost: 2,
    timeToMvp: { ru: '1 день', en: '1 day' },
    pitfalls: {
      ru: [
        'Права и лицензии: проверьте условия коммерческого использования модели и сервиса',
        'Текст на картинках и мелкие детали (руки, логотипы) часто получаются с ошибками',
        'Один и тот же персонаж/товар «плывёт» между генерациями — нужны LoRA или референсы',
        'Нужна модерация: пользователи будут пробовать сгенерировать недопустимое',
      ],
      en: [
        'Rights and licences: check the commercial-use terms of the model and service',
        'Text in images and fine details (hands, logos) often come out wrong',
        'The same character/product drifts between generations — use LoRA or references',
        'You need moderation: users will try to generate unsafe content',
      ],
    },
    relatedNodes: ['gan', 'vae', 'unet', 'transformer'],
  },
  {
    id: 'ai-agent',
    emoji: '🤖',
    category: 'text',
    title: { ru: 'Ассистент, который выполняет действия', en: 'An assistant that takes actions' },
    problem: {
      ru: 'Хочу ассистента, который не только отвечает, но и делает: создаёт заявки, ищет в CRM, бронирует, отправляет письма.',
      en: 'I want an assistant that does not just answer but acts: creates tickets, searches the CRM, books, sends emails.',
    },
    examples: {
      ru: ['Помощник менеджера в CRM', 'Бот записи к врачу', 'Автоматизация рутины в поддержке', 'Код-ассистенты', 'Аналитик, строящий отчёты по запросу'],
      en: ['CRM assistant for sales', 'Appointment booking bot', 'Support routine automation', 'Coding assistants', 'An analyst that builds reports on request'],
    },
    pipeline: [
      {
        label: { ru: 'Описать инструменты', en: 'Describe the tools' },
        detail: {
          ru: 'Каждое действие — функция с названием, описанием и параметрами (JSON-схема): «найти_клиента(email)», «создать_заявку(тема, текст)».',
          en: 'Each action is a function with a name, description and parameters (JSON schema): "find_customer(email)", "create_ticket(subject, body)".',
        },
      },
      {
        nodeId: 'llm',
        label: { ru: 'LLM выбирает инструмент', en: 'The LLM picks a tool' },
        detail: {
          ru: 'Через tool use / function calling модель сама решает, какую функцию вызвать и с какими аргументами.',
          en: 'Via tool use / function calling the model decides which function to call and with which arguments.',
        },
      },
      {
        nodeId: 'agents',
        label: { ru: 'Цикл: действие → результат → следующий шаг', en: 'Loop: action → result → next step' },
        detail: {
          ru: 'Ваш код выполняет функцию, возвращает результат модели, та решает, что делать дальше, пока задача не решена.',
          en: 'Your code runs the function, returns the result to the model, and it decides what to do next until the task is done.',
        },
      },
      {
        nodeId: 'cot',
        label: { ru: 'Планирование сложных задач', en: 'Planning multi-step tasks' },
        detail: {
          ru: 'Рассуждение шаг за шагом помогает разбить задачу на действия и не пропустить проверку.',
          en: 'Step-by-step reasoning helps break the task into actions and not skip checks.',
        },
      },
      {
        label: { ru: 'Подтверждение опасных действий', en: 'Confirm risky actions' },
        detail: {
          ru: 'Оплата, удаление, отправка клиенту — только после подтверждения человеком. Плюс лимиты на число шагов и логирование.',
          en: 'Payments, deletions, messages to customers — only after human confirmation. Plus step limits and logging.',
        },
      },
    ],
    options: [
      {
        tier: 'api',
        summary: {
          ru: 'No-code автоматизации с AI-шагами или tool use в API крупных LLM.',
          en: 'No-code automations with AI steps, or tool use in major LLM APIs.',
        },
        tools: ['n8n', 'Zapier AI', 'Claude / OpenAI tool use', 'MCP servers'],
      },
      {
        tier: 'open',
        summary: {
          ru: 'Фреймворки для агентов + open-source LLM с поддержкой вызова функций.',
          en: 'Agent frameworks + an open-source LLM with function-calling support.',
        },
        tools: ['LangGraph', 'LlamaIndex agents', 'Qwen / Llama (function calling)', 'Ollama'],
      },
      {
        tier: 'custom',
        summary: {
          ru: 'Дообучение модели на ваших сценариях вызова инструментов и собственная система оценки агента.',
          en: 'Fine-tune a model on your tool-call scenarios and build your own agent evaluation.',
        },
        tools: ['Fine-tuning on tool traces', 'Eval harness', 'Tracing (Langfuse)'],
      },
    ],
    dataNeeded: {
      ru: 'API ваших систем и 20–50 типовых сценариев для тестов. Обучающие данные обычно не нужны.',
      en: 'APIs of your systems and 20–50 typical scenarios for testing. Training data is usually not needed.',
    },
    difficulty: 3,
    cost: 2,
    timeToMvp: { ru: '3–10 дней', en: '3–10 days' },
    pitfalls: {
      ru: [
        'Необратимые действия без подтверждения человеком',
        'Prompt injection: текст из письма или сайта может «приказать» агенту сделать лишнее',
        'Зацикливание и рост стоимости — ставьте лимиты шагов и бюджета',
        'Чем больше инструментов, тем чаще модель путается — начинайте с 3–5',
      ],
      en: [
        'Irreversible actions without human confirmation',
        'Prompt injection: text from an email or website can "order" the agent to overstep',
        'Loops and runaway cost — set step and budget limits',
        'The more tools, the more the model gets confused — start with 3–5',
      ],
    },
    relatedNodes: ['prompt-eng', 'rag', 'transformer'],
  },
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(r => r.id === id);
}

// Unique node ids used by a recipe's pipeline, in order
export function getRecipeNodeIds(recipe: Recipe): string[] {
  const ids: string[] = [];
  recipe.pipeline.forEach(step => {
    if (step.nodeId && !ids.includes(step.nodeId)) ids.push(step.nodeId);
  });
  return ids;
}

export function getRecipesForNode(nodeId: string): Recipe[] {
  return recipes.filter(r => r.pipeline.some(s => s.nodeId === nodeId) || r.relatedNodes?.includes(nodeId));
}
