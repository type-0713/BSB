/**
 * «Маленький гений и герой: талант есть у каждого»
 * Главный скрипт интерактивного образовательного портала
 * Проект по русскому языку для 8 класса
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. STORAGE KEYS & UTILITIES
     ========================================================================== */
  const STORAGE_KEYS = {
    THEME: 'genius_hero_theme',
    BOOKMARKS: 'genius_hero_bookmarks',
    QUIZ_RESULT: 'genius_hero_quiz_result',
    HABITS: 'genius_hero_habits',
    AUTHOR_DATA: 'genius_hero_author_data'
  };

  const showToast = (message, duration = 3000) => {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('active');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  };

  /* ==========================================================================
     2. THEME SWITCHER (DARK / LIGHT)
     ========================================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (window.update3DThemeColors) {
      window.update3DThemeColors(theme);
    }
  };

  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      showToast(next === 'dark' ? 'Включена тёмная тема' : 'Включена светлая тема');
    });
  }

  /* ==========================================================================
     3. SCROLL PROGRESS BAR & SCROLL-TO-TOP
     ========================================================================== */
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }

    if (scrollToTopBtn) {
      if (scrollTop > 450) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     4. MOBILE MENU & NAVIGATION SPY
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open', !isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section spy
  const sectionTargets = document.querySelectorAll('section[id]');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.25 });

  sectionTargets.forEach(sec => spyObserver.observe(sec));

  /* ==========================================================================
     5. SECTION BOOKMARKS (ИЗБРАННОЕ В LOCALSTORAGE)
     ========================================================================== */
  const bookmarkButton = document.getElementById('bookmarkButton');
  const bookmarkCount = document.getElementById('bookmarkCount');
  const bookmarksModal = document.getElementById('bookmarksModal');
  const closeBookmarksBtn = document.getElementById('closeBookmarksBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const bookmarksList = document.getElementById('bookmarksList');
  const sectionBookmarkBtns = document.querySelectorAll('.section-bookmark-btn');

  let bookmarks = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
  } catch (e) {
    bookmarks = [];
  }

  const updateBookmarksUI = () => {
    if (bookmarkCount) {
      bookmarkCount.textContent = bookmarks.length;
    }

    sectionBookmarkBtns.forEach(btn => {
      const targetId = btn.dataset.target;
      const isBookmarked = bookmarks.some(item => item.id === targetId);
      btn.classList.toggle('bookmarked', isBookmarked);
      btn.setAttribute('title', isBookmarked ? 'Удалить раздел из закладок' : 'Сохранить раздел в избранное');
    });

    if (bookmarksList) {
      if (bookmarks.length === 0) {
        bookmarksList.innerHTML = `<p class="empty-bookmarks">Вы ещё не сохранили разделы. Нажмите на значок закладки в правом верхнем углу любого блока.</p>`;
      } else {
        bookmarksList.innerHTML = bookmarks.map(b => `
          <div class="bookmark-item">
            <a href="#${b.id}" class="bookmark-item-link" data-close-drawer="true">${b.name}</a>
            <button class="bookmark-item-remove" data-remove-id="${b.id}" title="Удалить из закладок">&times;</button>
          </div>
        `).join('');
      }
    }
  };

  const toggleBookmark = (id, name) => {
    const index = bookmarks.findIndex(b => b.id === id);
    if (index > -1) {
      bookmarks.splice(index, 1);
      showToast(`Раздел «${name}» удален из избранного`);
    } else {
      bookmarks.push({ id, name });
      showToast(`Раздел «${name}» добавлен в закладки`);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    updateBookmarksUI();
  };

  sectionBookmarkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const section = document.getElementById(targetId);
      const sectionName = section ? (section.dataset.sectionName || targetId) : targetId;
      toggleBookmark(targetId, sectionName);
    });
  });

  const openDrawer = () => {
    bookmarksModal.classList.add('open');
    modalBackdrop.classList.add('active');
    bookmarksModal.setAttribute('aria-hidden', 'false');
  };

  const closeDrawer = () => {
    bookmarksModal.classList.remove('open');
    modalBackdrop.classList.remove('active');
    bookmarksModal.setAttribute('aria-hidden', 'true');
  };

  if (bookmarkButton) bookmarkButton.addEventListener('click', openDrawer);
  if (closeBookmarksBtn) closeBookmarksBtn.addEventListener('click', closeDrawer);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeDrawer);

  if (bookmarksList) {
    bookmarksList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.bookmark-item-remove');
      if (removeBtn) {
        const id = removeBtn.dataset.removeId;
        const item = bookmarks.find(b => b.id === id);
        toggleBookmark(id, item ? item.name : id);
        return;
      }
      const link = e.target.closest('[data-close-drawer="true"]');
      if (link) {
        closeDrawer();
      }
    });
  }

  updateBookmarksUI();

  /* ==========================================================================
     6. TALENTS FILTER & REAL-TIME SEARCH
     ========================================================================== */
  const talentSearchInput = document.getElementById('talentSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const talentCategoryFilters = document.getElementById('talentCategoryFilters');
  const talentCards = document.querySelectorAll('.talent-card');

  let activeCategory = 'all';
  let searchQuery = '';

  const applyTalentFilter = () => {
    talentCards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      const cardKeywords = (card.dataset.talent || '') + ' ' + (card.querySelector('.talent-title')?.textContent || '') + ' ' + (card.querySelector('.talent-desc')?.textContent || '');
      const matchesCategory = (activeCategory === 'all') || (cardCategory === activeCategory);
      const matchesSearch = !searchQuery || cardKeywords.toLowerCase().includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  if (talentSearchInput) {
    talentSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }
      applyTalentFilter();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      talentSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      applyTalentFilter();
      talentSearchInput.focus();
    });
  }

  if (talentCategoryFilters) {
    talentCategoryFilters.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill-btn');
      if (!pill) return;
      talentCategoryFilters.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      applyTalentFilter();
    });
  }

  /* ==========================================================================
     7. ИНТЕРАКТИВНЫЙ ТЕСТ: 15 ВОПРОСОВ (ОПРЕДЕЛИ СВОИ СИЛЬНЫЕ СТОРОНЫ)
     ========================================================================== */
  const QUIZ_QUESTIONS = [
    {
      id: 1,
      title: "Когда вам нужно решить незнакомую задачу в школе, вы скорее:",
      options: [
        { text: "Разложу задачу на логические шаги, алгоритмы и правила", category: "intellect" },
        { text: "Попробую придумать необычный образ, метафору или творческий подход", category: "creative" },
        { text: "Изучу чертежи, формулы, код или инструменты, которыми это решается", category: "tech" },
        { text: "Спрошу у одноклассников, обсудим задачу вместе в живом диалоге", category: "comm" }
      ]
    },
    {
      id: 2,
      title: "Какое свободное занятие приносит вам наибольшее вдохновение?",
      options: [
        { text: "Чтение научно-популярных книг, статей и решение логических ребусов", category: "sci" },
        { text: "Рисование, дизайн, написание историй или создание музыки", category: "creative" },
        { text: "Конструирование, сборка ПК, настройка техники или написание кода", category: "tech" },
        { text: "Активные спортивные игры, тренировки, бег или велосипед", category: "sport" }
      ]
    },
    {
      id: 3,
      title: "При подготовке коллективного классного проекта какую роль вы берете охотнее?",
      options: [
        { text: "Организую ребят, распределю обязанности и прослежу за сроками", category: "leader" },
        { text: "Подготовлю эффектную визуальную презентацию и оформление", category: "creative" },
        { text: "Проверю факты, найду научные источники и статистику", category: "sci" },
        { text: "Помогу тем ребятам, у кого что-то не получается, поддержу атмосферу", category: "social" }
      ]
    },
    {
      id: 4,
      title: "Что для вас важнее всего в разговоре с другим человеком?",
      options: [
        { text: "Понять его чувства, поддержать и искренне помочь", category: "social" },
        { text: "Убедить аргументами, найти общий язык и договориться", category: "comm" },
        { text: "Услышать точные факты, цифры и объективную логику", category: "intellect" },
        { text: "Зажечь собеседника интересной идеей и повести за собой", category: "leader" }
      ]
    },
    {
      id: 5,
      title: "Если перед вами сложная головоломка или неработающий прибор, вы:",
      options: [
        { text: "Разберу его на детали, пойму устройство схемы и механизма", category: "tech" },
        { text: "Выдвину гипотезы, буду ставить серию последовательных экспериментов", category: "sci" },
        { text: "Поищу нестандартный обходной путь, который никто не замечал", category: "creative" },
        { text: "Соберу команду друзей, чтобы каждый предложил свою версию", category: "leader" }
      ]
    },
    {
      id: 6,
      title: "Как вы чувствуете себя во время физических нагрузок и спорта?",
      options: [
        { text: "Получаю заряд энергии, люблю преодолевать усталость и побеждать себя", category: "sport" },
        { text: "Больше ценю командный дух, сыгранность и поддержку товарищей", category: "comm" },
        { text: "Отношусь спокойно: моё главное поле для тренировок — это интеллект", category: "intellect" },
        { text: "Анализирую биомеханику движений и физические законы тренировки", category: "sci" }
      ]
    },
    {
      id: 7,
      title: "Какое школьное задание вызывает у вас самый искренний отклик?",
      options: [
        { text: "Написать эссе, сочинение-размышление или художественный рассказ", category: "creative" },
        { text: "Решить сложную олимпиадную задачу по математике или физике", category: "intellect" },
        { text: "Подготовить исследовательский проект с настоящими опытами", category: "sci" },
        { text: "Организовать благотворительную ярмарку или сбор помощи", category: "social" }
      ]
    },
    {
      id: 8,
      title: "Если в классе возникает спор между двумя друзьями, ваша реакция:",
      options: [
        { text: "Спокойно выступлю медиатором, найду компромисс и примирю стороны", category: "comm" },
        { text: "Покажу объективные факты: кто логически прав, а кто ошибся", category: "intellect" },
        { text: "Помогу более уязвимому почувствовать моральную поддержку", category: "social" },
        { text: "Возьму инициативу и предложу конкретное правило на будущее", category: "leader" }
      ]
    },
    {
      id: 9,
      title: "Что из перечисленного вы цените в хорошей компьютерной игре или приложении?",
      options: [
        { text: "Сложные логические стратегии, расчет ходов и баланс ресурсов", category: "intellect" },
        { text: "Умную программную архитектуру, чистый код и физический движок", category: "tech" },
        { text: "Глубокий сценарий, визуальный арт, музыку и атмосферу", category: "creative" },
        { text: "Возможность координировать команду и руководить альянсом", category: "leader" }
      ]
    },
    {
      id: 10,
      title: "Какая новость сильнее всего привлечет ваше внимание?",
      options: [
        { text: "Учёные открыли новый закон физики или сделали прорыв в астрономии", category: "sci" },
        { text: "Инженеры представили нового гуманоидного робота или квантовый чип", category: "tech" },
        { text: "Волонтёры восстановили заповедный лес и помогли тысячам людей", category: "social" },
        { text: "Спортсмен установил невероятный мировой рекорд на Олимпиаде", category: "sport" }
      ]
    },
    {
      id: 11,
      title: "В сложной непредвиденной ситуации вы обычно:",
      options: [
        { text: "Сохраняю самообладание, беру ответственность и направляю остальных", category: "leader" },
        { text: "Быстро ориентируюсь телом, действую ловко и решительно", category: "sport" },
        { text: "Хладнокровно анализирую причины и ищу системный корень проблемы", category: "intellect" },
        { text: "Успокаиваю паникующих людей и проявляю заботу о каждом", category: "social" }
      ]
    },
    {
      id: 12,
      title: "Что вам ближе в плане собственного развития?",
      options: [
        { text: "Изучение программирования, робототехники, электроники", category: "tech" },
        { text: "Освоение языков, ораторского искусства и искусства диалога", category: "comm" },
        { text: "Развитие физической формы, координации, выносливости", category: "sport" },
        { text: "Создание авторских творческих произведений (арт, тексты, музыка)", category: "creative" }
      ]
    },
    {
      id: 13,
      title: "Когда вы видите несправедливость, ваша первая мысль:",
      options: [
        { text: "Нужно немедленно вмешаться и защитить слабого человека", category: "social" },
        { text: "Нужно привлечь внимание общества и громко сказать правду", category: "comm" },
        { text: "Нужно изменить правила и систему, чтобы исключить такое впредь", category: "leader" },
        { text: "Нужно досконально расследовать факты, исключив эмоции", category: "sci" }
      ]
    },
    {
      id: 14,
      title: "Какая книга скорее задержится на вашем столе?",
      options: [
        { text: "Энциклопедия открытий, фундаментальная наука и эксперименты", category: "sci" },
        { text: "Руководство по кодингу, устройству двигателей или алгоритмам", category: "tech" },
        { text: "Захватывающий роман с яркими образами и глубоким стилем", category: "creative" },
        { text: "Биографии выдающихся полководцев, лидеров и реформаторов", category: "leader" }
      ]
    },
    {
      id: 15,
      title: "В чём, по вашему мнению, заключается высшая ценность человеческого таланта?",
      options: [
        { text: "В создании полезных технологий и инструментов, облегчающих труд", category: "tech" },
        { text: "В познании законов Вселенной и поиске истины", category: "sci" },
        { text: "В созидании красоты, которая вдохновляет и пробуждает душу", category: "creative" },
        { text: "В бескорыстном служении людям и спасении жизней", category: "social" }
      ]
    }
  ];

  const CATEGORY_NAMES = {
    intellect: "Интеллектуальный",
    creative: "Творческий",
    tech: "Технический",
    comm: "Коммуникативный",
    leader: "Лидерский",
    sport: "Спортивный",
    social: "Социальный",
    sci: "Научно-исследовательский"
  };

  const CATEGORY_DESCRIPTIONS = {
    intellect: "У вас превосходно развито системное, логическое и аналитическое мышление. Вы легко находите скрытые закономерности, структурируете информацию и любите доходить до сути вещей.",
    creative: "Вы обладаете ярким образным воображением, чувством эстетики и оригинальностью мышления. Вы способны преобразовывать чувства в формы и находить нестандартные решения.",
    tech: "Вы прирожденный инженер и практик цифровой эпохи. Вам интересна архитектура систем, программирование, работа механизмов и практическая реализация идей в коде или устройствах.",
    comm: "Вы мастер общения и эмпатии. Вы тонко чувствуете собеседника, умеете договариваться, находить нужные слова и объединять людей вокруг общего диалога.",
    leader: "У вас ярко выражены организаторские способности. Вы не боитесь брать ответственность, умеете вдохновлять людей, ставить большие цели и вести команду к результату.",
    sport: "Ваши сильные стороны — телесно-кинестетическая координация, выносливость, быстрота реакции и дисциплина. Мозг точно чувствует тело в пространстве.",
    social: "Вы обладаете чутким сердцем и гуманистической направленностью. Ваше призвание — сострадание, забота о людях, волонтерство и общественное служение.",
    sci: "Вы мыслите как настоящий ученый: любознательность, проверка гипотез, интерес к фундаментальным законам природы и любовь к объективным экспериментам."
  };

  const CATEGORY_TIPS = {
    intellect: ["Решайте олимпиадные логические кейсы и шахматные задачи", "Изучайте теорию вероятностей и системный анализ", "Учитесь доступно объяснять сложные идеи другим"],
    creative: ["Формируйте портфолио работ (скетчи, рассказы, концепты)", "Изучайте цифровые графические редакторы и основы композиции", "Не бойтесь конструктивной критики: она оттачивает стиль"],
    tech: ["Создавайте собственные пет-проекты, сайты и боты", "Осваивайте алгоритмическую базу и основы электроники", "Участвуйте в школьных инженерных хакатонах и ярмарках"],
    comm: ["Тренируйте навыки публичных выступлений и дебатов", "Развивайте эмоциональный интеллект и активное слушание", "Попробуйте себя в школьной журналистике или подкастах"],
    leader: ["Берите шефство над командными проектами в классе", "Изучайте тайм-менеджмент и психологию мотивации", "Помните: настоящий лидер служит команде, а не командует"],
    sport: ["Соблюдайте режим сна, восстановления и питания", "Развивайте тактическое мышление в командных видах спорта", "Переносите спортивную дисциплину на учёбу"],
    social: ["Участвуйте в волонтёрских и благотворительных акциях", "Освойте основы первой медицинской помощи и психологической поддержки", "Создавайте социальные инициативы для своей школы"],
    sci: ["Участвуйте в научно-практических конференциях (МАН)", "Учитесь работать с научными первоисточниками и статистикой", "Ставьте чистые домашние эксперименты и ведите протоколы"]
  };

  let currentQuestionIndex = 0;
  let userAnswers = {}; // questionId -> category

  const quizActiveScreen = document.getElementById('quizActiveScreen');
  const quizResultScreen = document.getElementById('quizResultScreen');
  const currentQuestionNumEl = document.getElementById('currentQuestionNum');
  const quizPercentDoneEl = document.getElementById('quizPercentDone');
  const quizProgressBarFill = document.getElementById('quizProgressBarFill');
  const questionTitleEl = document.getElementById('questionTitle');
  const quizOptionsList = document.getElementById('quizOptionsList');
  const quizPrevBtn = document.getElementById('quizPrevBtn');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizNavStatus = document.getElementById('quizNavStatus');

  const renderQuestion = (index) => {
    const q = QUIZ_QUESTIONS[index];
    if (!q) return;

    if (currentQuestionNumEl) currentQuestionNumEl.textContent = index + 1;
    const progressPercent = Math.round(((index + 1) / QUIZ_QUESTIONS.length) * 100);
    if (quizPercentDoneEl) quizPercentDoneEl.textContent = `${progressPercent}%`;
    if (quizProgressBarFill) quizProgressBarFill.style.width = `${progressPercent}%`;

    if (questionTitleEl) questionTitleEl.textContent = q.title;

    if (quizOptionsList) {
      quizOptionsList.innerHTML = '';
      const letters = ['А', 'Б', 'В', 'Г'];
      q.options.forEach((opt, optIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        if (userAnswers[q.id] === opt.category) {
          btn.classList.add('selected');
        }
        btn.innerHTML = `
          <span class="option-letter-badge">${letters[optIdx]}</span>
          <span class="option-text">${opt.text}</span>
        `;
        btn.addEventListener('click', () => {
          userAnswers[q.id] = opt.category;
          quizOptionsList.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          if (quizNextBtn) quizNextBtn.disabled = false;
          if (quizNavStatus) quizNavStatus.textContent = 'Ответ выбран. Нажмите «Далее»';
        });
        quizOptionsList.appendChild(btn);
      });
    }

    if (quizPrevBtn) quizPrevBtn.disabled = (index === 0);
    const hasAnswer = Boolean(userAnswers[q.id]);
    if (quizNextBtn) {
      quizNextBtn.disabled = !hasAnswer;
      quizNextBtn.querySelector('span').textContent = (index === QUIZ_QUESTIONS.length - 1) ? 'Завершить тест' : 'Далее';
    }
    if (quizNavStatus) {
      quizNavStatus.textContent = hasAnswer ? 'Ответ выбран' : 'Выберите вариант ответа для продолжения';
    }
  };

  const calculateResults = () => {
    const scores = {
      intellect: 0,
      creative: 0,
      tech: 0,
      comm: 0,
      leader: 0,
      sport: 0,
      social: 0,
      sci: 0
    };

    Object.values(userAnswers).forEach(cat => {
      if (scores[cat] !== undefined) {
        scores[cat] += 1;
      }
    });

    const totalAnswered = Object.keys(userAnswers).length || 1;
    const sorted = Object.entries(scores).map(([cat, val]) => ({
      category: cat,
      name: CATEGORY_NAMES[cat],
      count: val,
      percent: Math.round((val / totalAnswered) * 100)
    })).sort((a, b) => b.percent - a.percent);

    return sorted;
  };

  const showResultsScreen = (results) => {
    if (quizActiveScreen) quizActiveScreen.style.display = 'none';
    if (quizResultScreen) quizResultScreen.style.display = 'block';

    // Save to LocalStorage
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULT, JSON.stringify({
      date: new Date().toLocaleDateString('ru-RU'),
      results: results
    }));

    // Dominant Cards (Top 2-3)
    const dominantRow = document.getElementById('dominantTalentsRow');
    if (dominantRow) {
      const topThree = results.slice(0, 3);
      dominantRow.innerHTML = topThree.map((item, idx) => `
        <div class="dominant-card ${idx === 0 ? 'first-place' : ''}">
          <span class="dominant-rank">${idx === 0 ? '★ Главная сила' : `Приоритет #${idx + 1}`}</span>
          <h4 class="dominant-name">${item.name}</h4>
          <span class="dominant-percent">${item.percent}%</span>
          <p class="dominant-summary">${CATEGORY_DESCRIPTIONS[item.category]}</p>
        </div>
      `).join('');
    }

    // Breakdown Bars
    const barsContainer = document.getElementById('resultsBarsContainer');
    if (barsContainer) {
      barsContainer.innerHTML = results.map(item => `
        <div class="result-bar-row">
          <div class="bar-meta">
            <span class="bar-name">${item.name}</span>
            <span class="bar-val">${item.percent}% (${item.count} из 15)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${Math.max(item.percent, 5)}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // Recommendations Box
    const recommendationsBox = document.getElementById('quizRecommendationsBox');
    if (recommendationsBox) {
      const topCat = results[0].category;
      const secondCat = results[1].category;
      const tipsTop = CATEGORY_TIPS[topCat] || [];
      const tipsSecond = CATEGORY_TIPS[secondCat] || [];

      recommendationsBox.innerHTML = `
        <h4>Персональные рекомендации для ученика 8 класса:</h4>
        <p style="margin-bottom: 12px; font-size: 0.92rem; color: var(--text-secondary);">
          Опираясь на вашу ведущую синергию (<strong>${results[0].name}</strong> + <strong>${results[1].name}</strong>), вот ключевые шаги на ближайший учебный год:
        </p>
        <ul>
          ${tipsTop.map(t => `<li>${t}</li>`).join('')}
          ${tipsSecond.map(t => `<li>${t}</li>`).join('')}
        </ul>
      `;
    }

    showToast('Тест завершен! Результаты сохранены в вашем браузере');
  };

  if (quizPrevBtn) {
    quizPrevBtn.addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
      }
    });
  }

  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
      } else {
        const results = calculateResults();
        showResultsScreen(results);
      }
    });
  }

  const retakeQuizBtn = document.getElementById('retakeQuizBtn');
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener('click', () => {
      userAnswers = {};
      currentQuestionIndex = 0;
      if (quizResultScreen) quizResultScreen.style.display = 'none';
      if (quizActiveScreen) quizActiveScreen.style.display = 'block';
      renderQuestion(0);
      showToast('Тест перезапущен');
    });
  }

  const copyResultsBtn = document.getElementById('copyResultsBtn');
  if (copyResultsBtn) {
    copyResultsBtn.addEventListener('click', () => {
      const results = calculateResults();
      const text = `Результаты теста «Определи свои сильные стороны» (8 класс):\n` +
        `Главные направления:\n` +
        results.slice(0, 3).map((r, i) => `${i + 1}. ${r.name}: ${r.percent}%`).join('\n') +
        `\nОбразовательный проект: «Маленький гений и герой: талант есть у каждого».`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Результат успешно скопирован в буфер обмена!');
        }).catch(() => {
          showToast('Не удалось скопировать. Разрешите доступ к буферу');
        });
      }
    });
  }

  const printResultsBtn = document.getElementById('printResultsBtn');
  if (printResultsBtn) {
    printResultsBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Restore saved quiz result if exists
  const savedQuiz = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULT);
  if (savedQuiz) {
    try {
      const parsed = JSON.parse(savedQuiz);
      if (parsed && parsed.results) {
        showResultsScreen(parsed.results);
      } else {
        renderQuestion(0);
      }
    } catch (e) {
      renderQuestion(0);
    }
  } else {
    renderQuestion(0);
  }

  /* ==========================================================================
     8. ТАЛАНТЫ И ПРОФЕССИИ (ИНТЕРАКТИВНЫЙ КОНСТРУКТОР СИНЕРГИИ)
     ========================================================================== */
  const talentSelectA = document.getElementById('talentSelectA');
  const talentSelectB = document.getElementById('talentSelectB');
  const synergyResultDisplay = document.getElementById('synergyResultDisplay');

  const SYNERGY_DATABASE = {
    "tech+creative": {
      title: "Технологии + Творчество",
      profs: ["UI/UX дизайнер интерфейсов", "Разработчик видеоигр (GameDev)", "Генеративный художник и AI-дизайнер", "Архитектор виртуальных пространств"],
      desc: "Одно из самых востребованных сочетаний XXI века: умение писать алгоритмы и одновременно чувствовать визуальную гармонию и эмоции пользователя."
    },
    "tech+sci": {
      title: "Технологии + Наука",
      profs: ["Инженер-исследователь Data Science", "Биоинформатик", "Разработчик квантовых систем", "Робототехник-исследователь"],
      desc: "Сплав глубокой академической теории и инженерного воплощения. Создание высокотехнологичных приборов и алгоритмов ИИ."
    },
    "tech+comm": {
      title: "Технологии + Коммуникация",
      profs: ["Технический евангелист (Tech Evangelist)", "IT-журналист и обозреватель", "Менеджер технических продуктов", "Преподаватель программирования"],
      desc: "Редкий дар: уметь переводить сложный инженерный язык на простой язык для миллионов пользователей и инвесторов."
    },
    "tech+leader": {
      title: "Технологии + Лидерство",
      profs: ["Технологический предприниматель (CTO)", "Руководитель программной разработки", "Директор венчурных проектов", "Архитектор IT-экосистем"],
      desc: "Способность не только видеть будущее технологий, но и организовывать большие команды разработчиков для масштабных запусков."
    },
    "tech+social": {
      title: "Технологии + Служение обществу",
      profs: ["Разработчик бионических протезов", "Специалист по экологическим IT-системам", "Создатель доступной цифровой среды для незрячих", "Инженер телемедицины"],
      desc: "Настоящий пример темы «Герой»: использование кода и микросхем ради спасения жизней и помощи уязвимым людям."
    },
    "tech+lit": {
      title: "Технологии + Слово",
      profs: ["Технический писатель (Technical Writer)", "Сценарист интерактивных игр и квестов", "Промпт-инженер генеративных нейросетей", "Редактор научных изданий"],
      desc: "Филигранное описание сложнейших программных концептов и создание захватывающих интерактивных историй."
    },
    "creative+sci": {
      title: "Творчество + Наука",
      profs: ["Научный иллюстратор и визуализатор данных", "Арт-директор научно-популярных фильмов", "Антрополог культуры", "Дизайнер биоматериалов"],
      desc: "Превращение строгих научных формул и микромира в наглядные, вдохновляющие визуальные образы."
    },
    "creative+comm": {
      title: "Творчество + Коммуникация",
      profs: ["Креативный продюсер", "Режиссер театра и кино", "Бренд-стратег", "Ведущий культурно-просветительских программ"],
      desc: "Эмоциональное влияние на аудиторию через синтез авторского замысла и доверительного диалога."
    },
    "creative+leader": {
      title: "Творчество + Лидерство",
      profs: ["Креативный директор студии", "Продюсер медиапроектов", "Основатель анимационной студии", "Главный дизайнер бренда"],
      desc: "Вдохновение команды художников и сценаристов единым стилем и доведение масштабного арт-проекта до зрителя."
    },
    "creative+social": {
      title: "Творчество + Социальная польза",
      profs: ["Арт-терапевт", "Организатор инклюзивных творческих фестивалей", "Художник общественных пространств (муралы)", "Дизайнер детских больниц"],
      desc: "Использование искусства для исцеления души, создания психологически комфортной среды и объединения людей."
    },
    "intellect+comm": {
      title: "Интеллект + Коммуникация",
      profs: ["Педагог университетского уровня", "Судебный юрист / Адвокат", "Аналитик переговоров и медиатор", "Политический обозреватель"],
      desc: "Железная логика аргументов в сочетании с психологической чуткостью и ораторским мастерством."
    },
    "intellect+social": {
      title: "Интеллект + Социальная польза",
      profs: ["Врач доказательной медицины", "Разработчик образовательных стандартов", "Эксперт по биоэтике", "Кризисный психолог"],
      desc: "Глубокий ум, направленный на решение острых гуманитарных и социальных проблем общества."
    },
    "comm+social": {
      title: "Коммуникация + Общество",
      profs: ["Координатор масштабных благотворительных фондов", "Дипломат миссий мира", "Педагог-психолог", "Пресс-секретарь спасательных служб"],
      desc: "Высшая эмпатия и способность слышать боль других, превращая сочувствие в конкретную организованную помощь."
    },
    "leader+social": {
      title: "Лидерство + Общество",
      profs: ["Руководитель спасательного отряда", "Основатель благотворительного фонда", "Главный врач клиники", "Общественный деятель"],
      desc: "Истинный героизм: мужество брать на себя ответственность за судьбы людей и отстаивать справедливость."
    }
  };

  const updateSynergyDisplay = () => {
    if (!talentSelectA || !talentSelectB || !synergyResultDisplay) return;
    const a = talentSelectA.value;
    const b = talentSelectB.value;

    if (a === b) {
      synergyResultDisplay.innerHTML = `
        <div class="synergy-title-row">
          <h4>Глубокая специализация: ${CATEGORY_NAMES[a] || a}</h4>
        </div>
        <div class="synergy-profs-list">
          <span class="synergy-prof-tag">Эксперт высшей категории</span>
          <span class="synergy-prof-tag">Ведущий специалист отрасли</span>
          <span class="synergy-prof-tag">Мастер-наставник</span>
        </div>
        <p class="synergy-desc">Когда человек концентрирует все силы в одной точке, он достигает абсолютной виртуозности и глубины в своей сфере.</p>
      `;
      return;
    }

    const key1 = `${a}+${b}`;
    const key2 = `${b}+${a}`;
    const match = SYNERGY_DATABASE[key1] || SYNERGY_DATABASE[key2] || {
      title: `${CATEGORY_NAMES[a] || a} + ${CATEGORY_NAMES[b] || b}`,
      profs: ["Междисциплинарный специалист", "Руководитель кросс-функциональных проектов", "Аналитик смежных отраслей", "Консультант нового типа"],
      desc: "Стык этих двух направлений открывает уникальное преимущество: пока узкие специалисты видят только одну сторону, вы объединяете картину целиком."
    };

    synergyResultDisplay.innerHTML = `
      <div class="synergy-title-row">
        <h4>⚡ ${match.title}</h4>
      </div>
      <div class="synergy-profs-list">
        ${match.profs.map(p => `<span class="synergy-prof-tag">${p}</span>`).join('')}
      </div>
      <p class="synergy-desc">${match.desc}</p>
    `;
  };

  if (talentSelectA && talentSelectB) {
    talentSelectA.addEventListener('change', updateSynergyDisplay);
    talentSelectB.addEventListener('change', updateSynergyDisplay);
    updateSynergyDisplay();
  }

  /* ==========================================================================
     9. ПРАКТИЧЕСКИЙ ЧЕК-ЛИСТ ПРИВЫЧЕК РАЗВИТИЯ
     ========================================================================== */
  const habitsList = document.getElementById('habitsList');
  const habitsProgressText = document.getElementById('habitsProgressText');

  let savedHabits = {};
  try {
    savedHabits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS)) || {};
  } catch (e) {
    savedHabits = {};
  }

  const updateHabitsUI = () => {
    if (!habitsList) return;
    const checkboxes = habitsList.querySelectorAll('input[type="checkbox"]');
    let completedCount = 0;

    checkboxes.forEach(cb => {
      const id = cb.dataset.habitId;
      if (savedHabits[id]) {
        cb.checked = true;
        completedCount++;
      } else {
        cb.checked = false;
      }
    });

    if (habitsProgressText) {
      habitsProgressText.textContent = `Выполнено ${completedCount} из ${checkboxes.length} привычек`;
    }
  };

  if (habitsList) {
    habitsList.addEventListener('change', (e) => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (!cb) return;
      const id = cb.dataset.habitId;
      savedHabits[id] = cb.checked;
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(savedHabits));
      updateHabitsUI();
      if (cb.checked) {
        showToast('Отличная привычка отмечена!');
      }
    });
    updateHabitsUI();
  }

  /* ==========================================================================
     10. МИФЫ И ФАКТЫ О ТАЛАНТЕ (ИНТЕРАКТИВНЫЙ АККОРДЕОН)
     ========================================================================== */
  const mythsContainer = document.getElementById('mythsContainer');
  if (mythsContainer) {
    mythsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.myth-card');
      if (!card) return;
      const isOpened = card.getAttribute('data-opened') === 'true';
      card.setAttribute('data-opened', String(!isOpened));
    });
  }

  /* ==========================================================================
     11. БЛОК АВТОРА ПРОЕКТА (РЕДАКТИРОВАНИЕ В БРАУЗЕРЕ)
     ========================================================================== */
  const authorNameDisplay = document.getElementById('authorNameDisplay');
  const authorTextContent = document.getElementById('authorTextContent');
  const editAuthorBtn = document.getElementById('editAuthorBtn');
  const authorEditForm = document.getElementById('authorEditForm');
  const authorNameInput = document.getElementById('authorNameInput');
  const authorTextInput = document.getElementById('authorTextInput');
  const saveAuthorBtn = document.getElementById('saveAuthorBtn');
  const cancelAuthorBtn = document.getElementById('cancelAuthorBtn');
  const resetAuthorBtn = document.getElementById('resetAuthorBtn');

  const defaultAuthorData = {
    name: "Автор проекта • Ученик 8 класса",
    text: "Работая над проектом «Маленький гений и герой: талант есть у каждого», я решил проанализировать и собственные склонности.\n\nМеня всегда привлекали современные цифровые технологии, программирование, алгоритмы и архитектура веб-интерфейсов. Однако в процессе создания этого сайта я понял, что чистой технической базы недостаточно: чтобы проект стал по-настоящему понятным и красивым, необходимо задействовать творческое воображение, литературное чувство слова и эмпатию к читателю.\n\nТаким образом, мои сильные стороны находятся на стыке технического мышления и творческого созидания. Создание этого интерактивного образовательного портала с 3D-графикой и структурированным психологическим материалом стало для меня личным примером того, как интерес перерастает в практику, преодолевает ошибки кода и воплощается в реальный общественно полезный результат."
  };

  const loadAuthorData = () => {
    let data = defaultAuthorData;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTHOR_DATA);
      if (stored) data = JSON.parse(stored);
    } catch (e) {
      data = defaultAuthorData;
    }

    if (authorNameDisplay) authorNameDisplay.textContent = data.name;
    if (authorTextContent) {
      const paragraphs = data.text.split('\n\n');
      authorTextContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    if (authorNameInput) authorNameInput.value = data.name;
    if (authorTextInput) authorTextInput.value = data.text;
  };

  loadAuthorData();

  if (editAuthorBtn && authorEditForm) {
    editAuthorBtn.addEventListener('click', () => {
      authorEditForm.style.display = 'flex';
      authorTextContent.style.display = 'none';
      editAuthorBtn.style.display = 'none';
    });
  }

  if (cancelAuthorBtn && authorEditForm) {
    cancelAuthorBtn.addEventListener('click', () => {
      authorEditForm.style.display = 'none';
      authorTextContent.style.display = 'flex';
      editAuthorBtn.style.display = 'inline-flex';
    });
  }

  if (saveAuthorBtn) {
    saveAuthorBtn.addEventListener('click', () => {
      const newName = authorNameInput.value.trim() || defaultAuthorData.name;
      const newText = authorTextInput.value.trim() || defaultAuthorData.text;
      const data = { name: newName, text: newText };
      localStorage.setItem(STORAGE_KEYS.AUTHOR_DATA, JSON.stringify(data));
      loadAuthorData();
      authorEditForm.style.display = 'none';
      authorTextContent.style.display = 'flex';
      editAuthorBtn.style.display = 'inline-flex';
      showToast('Текст автора сохранён!');
    });
  }

  if (resetAuthorBtn) {
    resetAuthorBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.AUTHOR_DATA);
      loadAuthorData();
      authorEditForm.style.display = 'none';
      authorTextContent.style.display = 'flex';
      editAuthorBtn.style.display = 'inline-flex';
      showToast('Восстановлен текст по умолчанию');
    });
  }

  /* ==========================================================================
     12. 3D ИНТЕРАКТИВНАЯ МОДЕЛЬ «СФЕРА ПОТЕНЦИАЛА И СОЗВЕЗДИЕ ТАЛАНТОВ» (THREE.JS)
     ========================================================================== */
  const canvasContainer = document.getElementById('canvas3dContainer');
  const nodeInfoOverlay = document.getElementById('nodeInfoOverlay');

  if (canvasContainer && typeof THREE !== 'undefined') {
    let scene, camera, renderer;
    let sphereGroup, coreMesh, wireframeMesh, pointCloud;
    let talentNodes = [];
    let isWireframeMode = false;
    let isAutoRotating = true;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const talentNodeLabels = [
      "Интеллектуальный", "Творческий", "Технический", "Музыкальный", "Спортивный",
      "Коммуникативный", "Лидерский", "Социальный", "Литературный", "Научный"
    ];

    const talentColors = [
      0x3b82f6, 0xa855f7, 0x06b6d4, 0xf97316, 0x10b981,
      0x14b8a6, 0xeab308, 0xf43f5e, 0xf59e0b, 0x6366f1
    ];

    const init3D = () => {
      const width = canvasContainer.clientWidth;
      const height = canvasContainer.clientHeight;

      // 1. Scene
      scene = new THREE.Scene();

      // 2. Camera
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 7.5;

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.appendChild(renderer.domElement);

      // 4. Object Group
      sphereGroup = new THREE.Group();
      scene.add(sphereGroup);

      // Inner Core Mesh (Glowing facets)
      const coreGeo = new THREE.IcosahedronGeometry(2.2, 2);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      const coreMat = new THREE.MeshPhongMaterial({
        color: isDark ? 0x6366f1 : 0x4f46e5,
        emissive: isDark ? 0x1e1b4b : 0x312e81,
        specular: 0x06b6d4,
        shininess: 40,
        flatShading: true,
        transparent: true,
        opacity: 0.65
      });
      coreMesh = new THREE.Mesh(coreGeo, coreMat);
      sphereGroup.add(coreMesh);

      // Wireframe Outer Cage
      const wireGeo = new THREE.IcosahedronGeometry(2.6, 1);
      const wireMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0x06b6d4 : 0x0284c7,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
      wireframeMesh = new THREE.Mesh(wireGeo, wireMat);
      sphereGroup.add(wireframeMesh);

      // Orbiting Talent Nodes (10 nodes representing the 10 talent categories)
      for (let i = 0; i < 10; i++) {
        const phi = Math.acos(-1 + (2 * i) / 10);
        const theta = Math.sqrt(10 * Math.PI) * phi;
        const radius = 3.2;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        // Node sphere
        const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: talentColors[i] });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.set(x, y, z);
        sphereGroup.add(nodeMesh);

        // Beam connection from center
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, z)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: talentColors[i],
          transparent: true,
          opacity: 0.25
        });
        const line = new THREE.Line(lineGeo, lineMat);
        sphereGroup.add(line);

        talentNodes.push({
          mesh: nodeMesh,
          line: line,
          basePos: new THREE.Vector3(x, y, z),
          phase: i * 0.6,
          label: talentNodeLabels[i]
        });
      }

      // Constellation Particle Dust
      const particleCount = 140;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 9;
        positions[i + 1] = (Math.random() - 0.5) * 9;
        positions[i + 2] = (Math.random() - 0.5) * 9;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: isDark ? 0x94a3b8 : 0x64748b,
        size: 0.045,
        transparent: true,
        opacity: 0.5
      });
      pointCloud = new THREE.Points(particleGeo, particleMat);
      scene.add(pointCloud);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.2);
      dirLight1.position.set(5, 6, 8);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x6366f1, 1.0);
      dirLight2.position.set(-6, -4, 4);
      scene.add(dirLight2);

      // Interactive Mouse / Touch Orbiting
      const onPointerDown = (clientX, clientY) => {
        isDragging = true;
        previousMousePosition = { x: clientX, y: clientY };
      };

      const onPointerMove = (clientX, clientY) => {
        if (!isDragging) return;
        const deltaX = clientX - previousMousePosition.x;
        const deltaY = clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.007;

        previousMousePosition = { x: clientX, y: clientY };
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      canvasContainer.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onPointerUp);

      canvasContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchend', onPointerUp);

      // Resize listener
      window.addEventListener('resize', onWindowResize);

      // Render Loop
      animate();
    };

    const onWindowResize = () => {
      if (!canvasContainer || !camera || !renderer) return;
      const width = canvasContainer.clientWidth;
      const height = canvasContainer.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth inertia rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;

      if (!isDragging && isAutoRotating) {
        targetRotationY += 0.003; // Gentle auto-rotation
      }

      if (sphereGroup) {
        sphereGroup.rotation.x = currentRotationX;
        sphereGroup.rotation.y = currentRotationY;
      }

      if (pointCloud) {
        pointCloud.rotation.y = -elapsed * 0.02;
      }

      // Breathing node pulses and closest node finder
      let closestNode = null;
      let maxZ = -999;

      talentNodes.forEach((node) => {
        const scale = 1 + Math.sin(elapsed * 2.5 + node.phase) * 0.25;
        node.mesh.scale.set(scale, scale, scale);

        // Compute world position to display closest node to viewer
        const worldPos = node.mesh.getWorldPosition(new THREE.Vector3());
        if (worldPos.z > maxZ) {
          maxZ = worldPos.z;
          closestNode = node;
        }
      });

      if (closestNode && nodeInfoOverlay) {
        nodeInfoOverlay.textContent = `Узел в фокусе: ${closestNode.label}`;
      }

      renderer.render(scene, camera);
    };

    // Update colors when theme changes
    window.update3DThemeColors = (theme) => {
      if (!coreMesh || !wireframeMesh) return;
      const isDark = (theme !== 'light');
      coreMesh.material.color.setHex(isDark ? 0x6366f1 : 0x4f46e5);
      coreMesh.material.emissive.setHex(isDark ? 0x1e1b4b : 0x312e81);
      wireframeMesh.material.color.setHex(isDark ? 0x06b6d4 : 0x0284c7);
    };

    // 3D Controls buttons
    const reset3DCameraBtn = document.getElementById('reset3DCamera');
    if (reset3DCameraBtn) {
      reset3DCameraBtn.addEventListener('click', () => {
        targetRotationX = 0;
        targetRotationY = 0;
        currentRotationX = 0;
        currentRotationY = 0;
        showToast('Положение 3D-модели сброшено');
      });
    }

    const toggleWireframeBtn = document.getElementById('toggleWireframe');
    if (toggleWireframeBtn) {
      toggleWireframeBtn.addEventListener('click', () => {
        isWireframeMode = !isWireframeMode;
        if (coreMesh) coreMesh.material.wireframe = isWireframeMode;
        toggleWireframeBtn.textContent = isWireframeMode ? 'Сплошная' : 'Структура';
        showToast(isWireframeMode ? 'Режим каркасной сетки' : 'Режим монолитных граней');
      });
    }

    const toggleAutoRotateBtn = document.getElementById('toggleAutoRotate');
    if (toggleAutoRotateBtn) {
      toggleAutoRotateBtn.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        toggleAutoRotateBtn.textContent = isAutoRotating ? 'Авто: Вкл' : 'Авто: Выкл';
        showToast(isAutoRotating ? 'Авто-вращение включено' : 'Авто-вращение выключено');
      });
    }

    // Launch Three.js
    init3D();
  } else if (canvasContainer) {
    // Fallback if Three.js is unavailable (e.g. strict offline mode)
    canvasContainer.innerHTML = `
      <div style="display:flex; height:100%; align-items:center; justify-content:center; text-align:center; padding:24px; color:var(--text-secondary);">
        <div>
          <div style="font-size:3rem; margin-bottom:12px;">🌐</div>
          <h4 style="color:var(--text-heading); margin-bottom:6px;">Сфера Потенциала</h4>
          <p style="font-size:0.88rem;">Интерактивная модель гармоничного развития человека и многообразия талантов.</p>
        </div>
      </div>
    `;
  }

});
