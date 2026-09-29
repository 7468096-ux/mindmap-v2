// Practical layer for nodes: where it is used, when to pick it, what data it needs, how to try it

import { Language } from './nodes';

export interface PracticalContent {
  useCases: string[];
  whenToUse: string; // when to pick it, and what to pick instead
  dataNeeded: string;
  tryIt: string; // fastest way to get hands-on
}

type Practical = Record<Language, PracticalContent>;

export const practical: Record<string, Practical> = {
  rag: {
    ru: {
      useCases: ['Чат-бот по базе знаний', 'Поддержка клиентов', 'Поиск по договорам', 'Ассистент по документации'],
      whenToUse: 'Бери, когда LLM должна отвечать по вашим данным, которые часто меняются или не входили в её обучение. Не бери, если нужно поменять стиль или формат ответов — это задача промпта или fine-tuning.',
      dataNeeded: 'Документы в текстовом виде и набор тестовых вопросов с ответами для оценки.',
      tryIt: 'Загрузите пару PDF в Claude Projects или NotebookLM — это RAG без кода. Следующий шаг — пример «RAG за 20 строк» в документации LlamaIndex.',
    },
    en: {
      useCases: ['Knowledge-base chatbot', 'Customer support', 'Contract search', 'Documentation assistant'],
      whenToUse: 'Pick it when an LLM must answer from your data that changes often or was not in its training. Skip it if you need a different style or format of answers — that is a job for prompting or fine-tuning.',
      dataNeeded: 'Documents as text and a set of test questions with answers for evaluation.',
      tryIt: 'Upload a couple of PDFs to Claude Projects or NotebookLM — that is RAG with no code. Next step: the "RAG in 20 lines" starter in the LlamaIndex docs.',
    },
  },
  embeddings: {
    ru: {
      useCases: ['Поиск по смыслу', 'Рекомендации похожего', 'Поиск дубликатов', 'Кластеризация отзывов', 'Основа RAG'],
      whenToUse: 'Бери, когда нужно сравнивать тексты или картинки по смыслу, а не по словам. Для точного совпадения артикулов и кодов добавляй обычный поиск по ключевым словам.',
      dataNeeded: 'Только сами тексты. Обучение не нужно — берётся готовая модель.',
      tryIt: 'Python: `pip install sentence-transformers`, модель `intfloat/multilingual-e5-small`, посчитайте косинусную близость пары фраз — 5 строк кода.',
    },
    en: {
      useCases: ['Semantic search', 'Similar-item recommendations', 'Duplicate detection', 'Clustering reviews', 'The foundation of RAG'],
      whenToUse: 'Pick it when you need to compare texts or images by meaning, not by words. For exact matches of SKUs and codes, add keyword search.',
      dataNeeded: 'Just the texts. No training — use a pretrained model.',
      tryIt: 'Python: `pip install sentence-transformers`, model `intfloat/multilingual-e5-small`, compute cosine similarity of two sentences — 5 lines of code.',
    },
  },
  llm: {
    ru: {
      useCases: ['Чат-боты и ассистенты', 'Суммаризация', 'Извлечение данных из текста', 'Классификация без обучения', 'Генерация кода и текстов'],
      whenToUse: 'Бери для задач с текстом, где нужны понимание и гибкость, и для быстрого MVP. На больших объёмах простой классификации дешевле эмбеддинги + логистическая регрессия; для чисел и прогнозов — бустинг.',
      dataNeeded: 'Для старта — ничего, только хороший промпт и 20–50 примеров для проверки качества.',
      tryIt: 'Попробуйте задачу в чате Claude или ChatGPT, затем повторите через API с тем же промптом — это и есть прототип продукта.',
    },
    en: {
      useCases: ['Chatbots and assistants', 'Summarisation', 'Extracting data from text', 'Classification without training', 'Generating code and copy'],
      whenToUse: 'Pick it for text tasks that need understanding and flexibility, and for a quick MVP. For high-volume simple classification, embeddings + logistic regression are cheaper; for numbers and forecasts, use boosting.',
      dataNeeded: 'Nothing to start — just a good prompt and 20–50 examples to check quality.',
      tryIt: 'Try the task in the Claude or ChatGPT chat, then repeat it through the API with the same prompt — that is your product prototype.',
    },
  },
  tokenization: {
    ru: {
      useCases: ['Подсчёт стоимости запросов к LLM', 'Нарезка документов для RAG', 'Проверка лимитов контекста'],
      whenToUse: 'Напрямую вы токенизатор не выбираете — он идёт с моделью. Но нужно понимать токены, чтобы считать цену, лимит контекста и размер фрагментов в RAG. Русский текст обычно занимает больше токенов, чем английский.',
      dataNeeded: 'Не требуется.',
      tryIt: 'Вставьте текст в онлайн-токенизатор (например, OpenAI Tokenizer) и сравните число токенов для русского и английского.',
    },
    en: {
      useCases: ['Estimating LLM request cost', 'Chunking documents for RAG', 'Checking context limits'],
      whenToUse: 'You do not pick a tokenizer directly — it comes with the model. But you need to understand tokens to estimate cost, context limits and RAG chunk sizes. Non-English text usually takes more tokens.',
      dataNeeded: 'None.',
      tryIt: 'Paste text into an online tokenizer (e.g. OpenAI Tokenizer) and compare token counts across languages.',
    },
  },
  'prompt-eng': {
    ru: {
      useCases: ['Настройка поведения бота', 'Классификация и извлечение без обучения', 'Шаблоны генерации контента', 'Снижение галлюцинаций'],
      whenToUse: 'Всегда первый шаг: прежде чем дообучать модель, выжмите максимум из промпта. Переходите к fine-tuning, только если промпт упёрся в потолок по качеству или цене.',
      dataNeeded: '5–20 примеров «вход → желаемый выход» для few-shot и тестов.',
      tryIt: 'Возьмите задачу, напишите промпт с ролью, чётким форматом ответа и 3 примерами. Сравните с версией без примеров на 10 входах.',
    },
    en: {
      useCases: ['Shaping bot behaviour', 'Classification and extraction without training', 'Content generation templates', 'Reducing hallucinations'],
      whenToUse: 'Always the first step: get the most out of the prompt before fine-tuning. Move to fine-tuning only when the prompt hits a quality or cost ceiling.',
      dataNeeded: '5–20 "input → desired output" examples for few-shot and testing.',
      tryIt: 'Take a task and write a prompt with a role, a strict output format and 3 examples. Compare against the version without examples on 10 inputs.',
    },
  },
  finetuning: {
    ru: {
      useCases: ['Стиль и формат ответов бренда', 'Узкая классификация', 'Распознавание своих объектов на фото', 'LoRA для стиля изображений'],
      whenToUse: 'Бери, когда промпт и RAG не дают нужного качества, нужна стабильность формата или дешёвая маленькая модель вместо большой. Не бери, чтобы «загрузить знания» — для фактов лучше RAG.',
      dataNeeded: 'Сотни–тысячи качественных примеров «вход → правильный выход». Качество важнее количества.',
      tryIt: 'Дообучите маленькую модель классификации через Hugging Face Trainer на готовом датасете (например, отзывы) в бесплатном Google Colab.',
    },
    en: {
      useCases: ['Brand tone and answer format', 'Narrow classification', 'Recognising your own objects in photos', 'LoRA for image style'],
      whenToUse: 'Pick it when prompting and RAG do not reach the quality you need, you need a stable format, or a cheap small model instead of a large one. Do not use it to "load knowledge" — RAG is better for facts.',
      dataNeeded: 'Hundreds to thousands of good "input → correct output" examples. Quality beats quantity.',
      tryIt: 'Fine-tune a small classification model with Hugging Face Trainer on a ready dataset (e.g. reviews) in free Google Colab.',
    },
  },
  agents: {
    ru: {
      useCases: ['Ассистент в CRM', 'Автоматизация поддержки', 'Код-ассистенты', 'Исследовательские агенты', 'Бронирование и запись'],
      whenToUse: 'Бери, когда задача требует нескольких шагов и работы с внешними системами. Если шагов фиксированное число — надёжнее обычный пайплайн с LLM на отдельных шагах.',
      dataNeeded: 'API ваших систем и тестовые сценарии. Обучение обычно не нужно.',
      tryIt: 'Соберите в n8n сценарий «письмо → LLM решает категорию → создаёт задачу в трекере». Затем повторите в коде через tool use API.',
    },
    en: {
      useCases: ['CRM assistant', 'Support automation', 'Coding assistants', 'Research agents', 'Booking and scheduling'],
      whenToUse: 'Pick it when a task needs several steps and external systems. If the number of steps is fixed, a plain pipeline with LLM calls at specific steps is more reliable.',
      dataNeeded: 'APIs of your systems and test scenarios. Training is usually not needed.',
      tryIt: 'Build an n8n flow "email → LLM picks a category → creates a task in the tracker". Then repeat it in code via the tool use API.',
    },
  },
  cot: {
    ru: {
      useCases: ['Математика и логика', 'Многошаговые рассуждения', 'Планирование в агентах', 'Сложная аналитика'],
      whenToUse: 'Бери для задач, где нужна цепочка выводов. Для простых запросов (перевод, классификация) это лишние токены и задержка. Современные reasoning-модели делают это сами.',
      dataNeeded: 'Не требуется.',
      tryIt: 'Задайте LLM логическую задачу дважды: «ответь одним словом» и «рассуждай по шагам». Сравните точность на 10 задачах.',
    },
    en: {
      useCases: ['Maths and logic', 'Multi-step reasoning', 'Planning in agents', 'Complex analysis'],
      whenToUse: 'Pick it for tasks that need a chain of inferences. For simple requests (translation, classification) it just adds tokens and latency. Modern reasoning models do it themselves.',
      dataNeeded: 'None.',
      tryIt: 'Give an LLM a logic puzzle twice: "answer in one word" and "think step by step". Compare accuracy over 10 puzzles.',
    },
  },
  bert: {
    ru: {
      useCases: ['Классификация текстов', 'Анализ тональности', 'Извлечение сущностей (NER)', 'Переранжирование в поиске'],
      whenToUse: 'Бери для понимания текста на своём сервере, быстро и дёшево: классификация, NER, поиск. Для генерации текста не подходит — нужна LLM.',
      dataNeeded: 'Для дообучения — от 1000 размеченных примеров; готовые модели под типовые задачи есть на Hugging Face.',
      tryIt: 'Hugging Face: `pipeline("sentiment-analysis")` — оценка тональности в 2 строки кода.',
    },
    en: {
      useCases: ['Text classification', 'Sentiment analysis', 'Named entity recognition (NER)', 'Re-ranking in search'],
      whenToUse: 'Pick it for fast, cheap text understanding on your own server: classification, NER, search. Not for generating text — that needs an LLM.',
      dataNeeded: '1000+ labelled examples for fine-tuning; ready models for common tasks are on Hugging Face.',
      tryIt: 'Hugging Face: `pipeline("sentiment-analysis")` — sentiment scoring in 2 lines of code.',
    },
  },
  logreg: {
    ru: {
      useCases: ['Кредитный скоринг', 'Прогноз оттока (да/нет)', 'Классификатор поверх эмбеддингов', 'Спам-фильтр'],
      whenToUse: 'Бери как первую модель для любой задачи «да/нет»: быстро, прозрачно, легко объяснить. Если точности не хватает — переходи к бустингу.',
      dataNeeded: 'Сотни–тысячи размеченных строк.',
      tryIt: 'scikit-learn: `LogisticRegression().fit(X, y)` на датасете Titanic — классика первого ML-проекта.',
    },
    en: {
      useCases: ['Credit scoring', 'Churn prediction (yes/no)', 'Classifier on top of embeddings', 'Spam filter'],
      whenToUse: 'Pick it as the first model for any yes/no task: fast, transparent, easy to explain. If accuracy is not enough, move to boosting.',
      dataNeeded: 'Hundreds to thousands of labelled rows.',
      tryIt: 'scikit-learn: `LogisticRegression().fit(X, y)` on the Titanic dataset — the classic first ML project.',
    },
  },
  'linear-reg': {
    ru: {
      useCases: ['Прогноз цены недвижимости', 'Прогноз продаж', 'Анализ трендов', 'Базовая модель для сравнения'],
      whenToUse: 'Бери как базовую линию и когда важна объяснимость. При сложных нелинейных зависимостях переходи к градиентному бустингу.',
      dataNeeded: 'Десятки–тысячи строк с числовыми признаками.',
      tryIt: 'scikit-learn: `LinearRegression` на датасете цен домов (California Housing) — 10 строк кода.',
    },
    en: {
      useCases: ['House price prediction', 'Sales forecasting', 'Trend analysis', 'A baseline to compare against'],
      whenToUse: 'Pick it as a baseline and when explainability matters. For complex non-linear patterns, move to gradient boosting.',
      dataNeeded: 'Tens to thousands of rows with numeric features.',
      tryIt: 'scikit-learn: `LinearRegression` on the California Housing dataset — 10 lines of code.',
    },
  },
  'decision-tree': {
    ru: {
      useCases: ['Объяснимые правила для бизнеса', 'Кредитные решения', 'Медицинские чек-листы', 'Анализ важности признаков'],
      whenToUse: 'Одно дерево бери, когда нужны понятные правила «если… то…». Для точности используй ансамбли деревьев — случайный лес или бустинг.',
      dataNeeded: 'Сотни–тысячи строк, можно смешанные типы признаков.',
      tryIt: 'scikit-learn: обучите `DecisionTreeClassifier(max_depth=3)` и нарисуйте дерево через `plot_tree` — увидите правила модели.',
    },
    en: {
      useCases: ['Explainable business rules', 'Credit decisions', 'Medical checklists', 'Feature importance analysis'],
      whenToUse: 'Use a single tree when you need readable if-then rules. For accuracy, use tree ensembles — random forest or boosting.',
      dataNeeded: 'Hundreds to thousands of rows, mixed feature types are fine.',
      tryIt: 'scikit-learn: train `DecisionTreeClassifier(max_depth=3)` and draw it with `plot_tree` — you will see the model\'s rules.',
    },
  },
  'random-forest': {
    ru: {
      useCases: ['Скоринг и антифрод', 'Прогноз оттока', 'Оценка важности признаков', 'Надёжная базовая модель'],
      whenToUse: 'Бери как надёжную модель «из коробки» для таблиц: почти не требует настройки и не переобучается. Бустинг обычно чуть точнее, но капризнее.',
      dataNeeded: 'Сотни–сотни тысяч строк.',
      tryIt: 'scikit-learn: `RandomForestClassifier()` на любом табличном датасете с Kaggle, затем посмотрите `feature_importances_`.',
    },
    en: {
      useCases: ['Scoring and anti-fraud', 'Churn prediction', 'Feature importance', 'A robust baseline model'],
      whenToUse: 'Pick it as a robust out-of-the-box model for tables: needs little tuning and resists overfitting. Boosting is usually slightly more accurate but fussier.',
      dataNeeded: 'Hundreds to hundreds of thousands of rows.',
      tryIt: 'scikit-learn: `RandomForestClassifier()` on any tabular Kaggle dataset, then look at `feature_importances_`.',
    },
  },
  xgboost: {
    ru: {
      useCases: ['Прогноз спроса и продаж', 'Кредитный скоринг', 'Антифрод', 'Прогноз оттока', 'Ранжирование в поиске'],
      whenToUse: 'Бери по умолчанию для табличных данных — чаще всего это лучшая модель. Для картинок, текста и звука нужны нейросети.',
      dataNeeded: 'Тысячи строк; работает с пропусками и категориальными признаками (особенно CatBoost).',
      tryIt: '`pip install xgboost`, `XGBClassifier().fit(X, y)` на табличном датасете с Kaggle и сравните с логистической регрессией.',
    },
    en: {
      useCases: ['Demand and sales forecasting', 'Credit scoring', 'Anti-fraud', 'Churn prediction', 'Search ranking'],
      whenToUse: 'Your default for tabular data — usually the best model. Images, text and audio need neural networks.',
      dataNeeded: 'Thousands of rows; handles missing values and categorical features (especially CatBoost).',
      tryIt: '`pip install xgboost`, `XGBClassifier().fit(X, y)` on a tabular Kaggle dataset, and compare with logistic regression.',
    },
  },
  lstm: {
    ru: {
      useCases: ['Прогноз временных рядов', 'Анализ сигналов датчиков', 'Распознавание рукописного ввода'],
      whenToUse: 'Сегодня редко лучший выбор: для текста победили трансформеры, для таблиц — бустинг. Имеет смысл для потоковых сигналов на слабом устройстве.',
      dataNeeded: 'Длинные последовательности, тысячи примеров.',
      tryIt: 'Учебный пример Keras/PyTorch по прогнозу временного ряда — хорошо показывает, как работает память сети.',
    },
    en: {
      useCases: ['Time-series forecasting', 'Sensor signal analysis', 'Handwriting recognition'],
      whenToUse: 'Rarely the best choice today: transformers won for text, boosting for tables. Still makes sense for streaming signals on weak devices.',
      dataNeeded: 'Long sequences, thousands of examples.',
      tryIt: 'A Keras/PyTorch time-series tutorial — a good way to see how the network\'s memory works.',
    },
  },
  transformer: {
    ru: {
      useCases: ['ChatGPT, Claude (LLM)', 'Машинный перевод', 'GitHub Copilot', 'Поиск (BERT)', 'Whisper (речь в текст)'],
      whenToUse: 'Сами трансформеры вы почти никогда не обучаете с нуля — вы берёте готовую модель (LLM, BERT, ViT, Whisper) и применяете или дообучаете.',
      dataNeeded: 'Для применения — не нужны; обучение с нуля требует огромных объёмов.',
      tryIt: 'Hugging Face: `pipeline("translation")` или `pipeline("automatic-speech-recognition")` — готовые трансформеры в пару строк.',
    },
    en: {
      useCases: ['ChatGPT, Claude (LLM)', 'Machine translation', 'GitHub Copilot', 'Search (BERT)', 'Whisper (speech-to-text)'],
      whenToUse: 'You almost never train a transformer from scratch — you take a ready model (LLM, BERT, ViT, Whisper) and use or fine-tune it.',
      dataNeeded: 'None to use one; training from scratch takes enormous data.',
      tryIt: 'Hugging Face: `pipeline("translation")` or `pipeline("automatic-speech-recognition")` — ready transformers in a couple of lines.',
    },
  },
  cnn: {
    ru: {
      useCases: ['Распознавание лиц', 'Медицинские снимки', 'Контроль качества', 'Беспилотные авто', 'OCR'],
      whenToUse: 'Основа компьютерного зрения, особенно на слабых устройствах. На практике берите готовую предобученную CNN (ResNet, YOLO) и дообучайте.',
      dataNeeded: 'С предобученной моделью — сотни изображений на класс.',
      tryIt: 'Учебник PyTorch «Transfer learning» — дообучение ResNet на своих картинках за 30 минут.',
    },
    en: {
      useCases: ['Face recognition', 'Medical imaging', 'Quality control', 'Self-driving cars', 'OCR'],
      whenToUse: 'The backbone of computer vision, especially on weak devices. In practice, take a pretrained CNN (ResNet, YOLO) and fine-tune it.',
      dataNeeded: 'With a pretrained model — hundreds of images per class.',
      tryIt: 'The PyTorch "Transfer learning" tutorial — fine-tune ResNet on your own images in 30 minutes.',
    },
  },
  'img-classification': {
    ru: {
      useCases: ['Брак / норма на производстве', 'Сортировка фото товаров', 'Модерация контента', 'Диагностика по снимкам'],
      whenToUse: 'Бери, когда на картинку нужен один ответ. Если важно, где объект и сколько их, — нужна детекция; если нужен контур — сегментация.',
      dataNeeded: '100–500 фото на класс для дообучения; для zero-shot через CLIP — только тестовый набор.',
      tryIt: 'Google Teachable Machine: обучите классификатор на фото с веб-камеры прямо в браузере за 5 минут.',
    },
    en: {
      useCases: ['Defect / OK on a production line', 'Sorting product photos', 'Content moderation', 'Diagnosis from scans'],
      whenToUse: 'Pick it when an image needs one answer. If you need where and how many objects, use detection; for outlines, segmentation.',
      dataNeeded: '100–500 photos per class for fine-tuning; just a test set for zero-shot via CLIP.',
      tryIt: 'Google Teachable Machine: train a classifier on webcam photos right in the browser in 5 minutes.',
    },
  },
  'obj-detection': {
    ru: {
      useCases: ['Подсчёт людей и товаров', 'Видеоаналитика', 'Поиск дефектов', 'Распознавание номеров', 'Беспилотники'],
      whenToUse: 'Бери, когда важно, где находятся объекты и сколько их. Для ответа «есть/нет» хватит классификации — она проще.',
      dataNeeded: 'Сотни изображений с рамками вокруг объектов.',
      tryIt: '`pip install ultralytics`, `yolo predict model=yolo11n.pt source=ваше_фото.jpg` — детекция 80 типов объектов из коробки.',
    },
    en: {
      useCases: ['Counting people and products', 'Video analytics', 'Finding defects', 'Licence plate recognition', 'Drones'],
      whenToUse: 'Pick it when you need to know where objects are and how many. For a yes/no answer, classification is enough and simpler.',
      dataNeeded: 'Hundreds of images with boxes drawn around objects.',
      tryIt: '`pip install ultralytics`, `yolo predict model=yolo11n.pt source=your_photo.jpg` — detects 80 object types out of the box.',
    },
  },
  segmentation: {
    ru: {
      useCases: ['Удаление фона', 'Медицина: контур опухоли', 'Площадь повреждения', 'Анализ спутниковых снимков'],
      whenToUse: 'Бери, когда нужен точный контур или площадь. Разметка дороже, чем для детекции, — не используйте, если хватает рамок.',
      dataNeeded: 'Сотни изображений с масками. Разметку ускоряет SAM (Segment Anything).',
      tryIt: 'Демо Segment Anything (SAM) от Meta: кликните по объекту на своём фото — получите маску.',
    },
    en: {
      useCases: ['Background removal', 'Medicine: tumour outlines', 'Damaged area measurement', 'Satellite imagery analysis'],
      whenToUse: 'Pick it when you need an exact outline or area. Labelling costs more than for detection — skip it if boxes are enough.',
      dataNeeded: 'Hundreds of images with masks. SAM (Segment Anything) speeds up labelling.',
      tryIt: 'Meta\'s Segment Anything (SAM) demo: click an object in your photo and get a mask.',
    },
  },
  yolo: {
    ru: {
      useCases: ['Видеонаблюдение в реальном времени', 'Подсчёт объектов', 'Контроль СИЗ на производстве', 'Спортивная аналитика'],
      whenToUse: 'Бери по умолчанию для детекции и сегментации в реальном времени, в том числе на камерах и телефонах. Для редких классов без данных попробуйте zero-shot детекторы.',
      dataNeeded: '100–500 размеченных изображений на класс для дообучения.',
      tryIt: 'Ultralytics: `yolo train data=ваш_датасет.yaml model=yolo11n.pt` — дообучение одной командой. Датасеты — на Roboflow Universe.',
    },
    en: {
      useCases: ['Real-time video surveillance', 'Object counting', 'PPE compliance on sites', 'Sports analytics'],
      whenToUse: 'The default for real-time detection and segmentation, including on cameras and phones. For rare classes with no data, try zero-shot detectors.',
      dataNeeded: '100–500 labelled images per class for fine-tuning.',
      tryIt: 'Ultralytics: `yolo train data=your_dataset.yaml model=yolo11n.pt` — fine-tune in one command. Datasets on Roboflow Universe.',
    },
  },
  resnet: {
    ru: {
      useCases: ['Классификация изображений', 'Извлечение признаков картинок', 'Поиск похожих изображений', 'Медицинская диагностика'],
      whenToUse: 'Бери как надёжную и быструю основу для классификации с дообучением. ViT может быть точнее при большом объёме данных.',
      dataNeeded: 'Сотни изображений на класс.',
      tryIt: 'Библиотека timm: `timm.create_model("resnet50", pretrained=True)` и дообучение на своей папке с картинками.',
    },
    en: {
      useCases: ['Image classification', 'Image feature extraction', 'Similar-image search', 'Medical diagnosis'],
      whenToUse: 'A reliable, fast backbone for classification with fine-tuning. ViT can be more accurate with lots of data.',
      dataNeeded: 'Hundreds of images per class.',
      tryIt: 'The timm library: `timm.create_model("resnet50", pretrained=True)` and fine-tune on your image folder.',
    },
  },
  vit: {
    ru: {
      useCases: ['Классификация изображений', 'Основа мультимодальных моделей', 'Медицинские снимки', 'Поиск по картинкам'],
      whenToUse: 'Бери, когда данных много и важна точность, или как основу для мультимодальных задач. На слабом железе и малых данных CNN часто практичнее.',
      dataNeeded: 'Предобученная модель + сотни–тысячи изображений.',
      tryIt: 'Hugging Face: `pipeline("image-classification", model="google/vit-base-patch16-224")` на своей фотографии.',
    },
    en: {
      useCases: ['Image classification', 'Backbone of multimodal models', 'Medical imaging', 'Image search'],
      whenToUse: 'Pick it with lots of data where accuracy matters, or as a base for multimodal tasks. On weak hardware and small data, CNNs are often more practical.',
      dataNeeded: 'A pretrained model + hundreds to thousands of images.',
      tryIt: 'Hugging Face: `pipeline("image-classification", model="google/vit-base-patch16-224")` on your own photo.',
    },
  },
  clip: {
    ru: {
      useCases: ['Поиск картинок по текстовому запросу', 'Классификация без обучения', 'Модерация изображений', 'Текстовый энкодер в генерации картинок'],
      whenToUse: 'Бери, когда нужно связать текст и картинки или классифицировать изображения без размеченных данных. Для узкой специфики (дефекты, медицина) дообученный классификатор будет точнее.',
      dataNeeded: 'Для zero-shot — только названия классов словами.',
      tryIt: 'Hugging Face: `pipeline("zero-shot-image-classification")` — дайте фото и список меток «кот, собака, машина».',
    },
    en: {
      useCases: ['Text-to-image search', 'Zero-shot classification', 'Image moderation', 'Text encoder for image generation'],
      whenToUse: 'Pick it to connect text and images or classify images without labelled data. For narrow domains (defects, medicine), a fine-tuned classifier is more accurate.',
      dataNeeded: 'For zero-shot, just the class names as words.',
      tryIt: 'Hugging Face: `pipeline("zero-shot-image-classification")` — give it a photo and labels like "cat, dog, car".',
    },
  },
  unet: {
    ru: {
      useCases: ['Сегментация медицинских снимков', 'Удаление фона', 'Шумоподавитель внутри Stable Diffusion'],
      whenToUse: 'Бери для точной сегментации на небольших датасетах, особенно в медицине. Для обычных фото проще YOLO-seg или SAM.',
      dataNeeded: 'Десятки–сотни изображений с масками.',
      tryIt: 'Библиотека segmentation_models_pytorch: U-Net с предобученным энкодером в одну строку.',
    },
    en: {
      useCases: ['Medical image segmentation', 'Background removal', 'The denoiser inside Stable Diffusion'],
      whenToUse: 'Pick it for precise segmentation on small datasets, especially medical. For everyday photos, YOLO-seg or SAM are simpler.',
      dataNeeded: 'Tens to hundreds of images with masks.',
      tryIt: 'The segmentation_models_pytorch library: a U-Net with a pretrained encoder in one line.',
    },
  },
  diffusion: {
    ru: {
      useCases: ['Генерация изображений', 'Генерация видео', 'Дорисовка и удаление объектов', 'Апскейл', 'Синтез данных для обучения'],
      whenToUse: 'Современный стандарт генерации изображений и видео. Для быстрой генерации в реальном времени смотрите дистиллированные модели с малым числом шагов.',
      dataNeeded: 'Для применения — ничего; для своего стиля — 10–50 изображений (LoRA).',
      tryIt: 'Сгенерируйте картинку в любом сервисе, затем повторите с тем же промптом в ComfyUI локально — поймёте, какие параметры на что влияют.',
    },
    en: {
      useCases: ['Image generation', 'Video generation', 'Inpainting and object removal', 'Upscaling', 'Synthetic training data'],
      whenToUse: 'The modern standard for image and video generation. For real-time generation, look at distilled few-step models.',
      dataNeeded: 'Nothing to use it; 10–50 images for your own style (LoRA).',
      tryIt: 'Generate an image in any service, then repeat the prompt locally in ComfyUI — you will see what each parameter does.',
    },
  },
  'stable-diffusion': {
    ru: {
      useCases: ['Фото товаров в интерьере', 'Рекламные креативы', 'Иллюстрации', 'Стилизация фото', 'Дорисовка (inpainting)'],
      whenToUse: 'Бери, когда нужен контроль, работа на своём сервере и дообучение под стиль. Если важны только скорость старта и качество — проще API-сервисы.',
      dataNeeded: 'Для LoRA — 10–50 изображений стиля или объекта.',
      tryIt: 'Установите ComfyUI, загрузите SDXL или FLUX и попробуйте img2img на своём фото.',
    },
    en: {
      useCases: ['Product photos in interiors', 'Ad creatives', 'Illustrations', 'Photo stylisation', 'Inpainting'],
      whenToUse: 'Pick it when you need control, self-hosting and fine-tuning for a style. If only speed-to-start and quality matter, APIs are simpler.',
      dataNeeded: 'For LoRA, 10–50 images of the style or object.',
      tryIt: 'Install ComfyUI, load SDXL or FLUX and try img2img on your own photo.',
    },
  },
};

export function getPractical(nodeId: string, lang: Language): PracticalContent | undefined {
  return practical[nodeId]?.[lang];
}
