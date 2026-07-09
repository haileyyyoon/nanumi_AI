(() => {
  const chatLog = document.getElementById('chat-log');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const suggestions = document.getElementById('suggestions');
  const resetBtn = document.getElementById('reset-btn');
  const langSelect = document.getElementById('lang-select');

  // ----- Interface translations -------------------------------------------
  // Keys mirror the data-i18n attributes in chatbot.html. "auto" reuses the
  // English chrome but still tells the server to reply in the user's language.
  const I18N = {
    en: {
      lang: 'en',
      title: 'House of Sharing Chatbot',
      intro:
        'This archive answers questions using testimony, historical records, and research ' +
        'gathered by the House of Sharing (나눔의 집) and related sources documenting Japan’s ' +
        'wartime military sexual slavery system. Answers are drawn strictly from the archive — ' +
        'if something isn’t in the record, the assistant will say so.',
      welcome:
        'Welcome. You can ask about survivors’ testimonies, the history of the comfort station ' +
        'system, the Wednesday Demonstrations, government responses, or the House of Sharing itself. ' +
        'What would you like to know?',
      reset: 'New conversation',
      placeholder: 'Ask a question about this history…',
      botLabel: 'Archive',
      youLabel: 'You',
      languageLabel: 'Answer language',
      suggestions: [
        'Who was Kim Hak-soon?',
        'What was the Kono Statement?',
        'What is the House of Sharing?',
        'Where is the House of Sharing located?',
      ],
      noAnswer: 'Sorry, no answer was found.',
      errorGeneric: 'Something went wrong. Please try again.',
      errorNetwork: 'Could not reach the server. Please check your connection and try again.',
    },
    ko: {
      lang: 'ko',
      title: '나눔의 집 챗봇',
      intro:
        '이 아카이브는 나눔의 집과 관련 자료가 수집한 증언, 역사 기록, 연구 자료를 바탕으로 일본군 ' +
        '위안부(전시 군 성노예) 제도에 관한 질문에 답합니다. 답변은 오직 이 아카이브의 자료에만 ' +
        '근거하며, 기록에 없는 내용은 그렇다고 알려드립니다.',
      welcome:
        '환영합니다. 피해자들의 증언, 위안소 제도의 역사, 수요시위, 정부의 대응, 또는 나눔의 집에 ' +
        '대해 질문하실 수 있습니다. 무엇이 궁금하신가요?',
      reset: '새 대화',
      placeholder: '이 역사에 대해 질문해 보세요…',
      botLabel: '아카이브',
      youLabel: '나',
      languageLabel: '답변 언어',
      suggestions: [
        '김학순은 누구인가요?',
        '고노 담화란 무엇인가요?',
        '나눔의 집은 무엇인가요?',
        '나눔의 집은 어디에 있나요?',
      ],
      noAnswer: '죄송합니다. 답변을 찾을 수 없습니다.',
      errorGeneric: '문제가 발생했습니다. 다시 시도해 주세요.',
      errorNetwork: '서버에 연결할 수 없습니다. 연결 상태를 확인한 후 다시 시도해 주세요.',
    },
    ja: {
      lang: 'ja',
      title: 'ナヌムの家チャットボット',
      intro:
        'このアーカイブは、ナヌムの家（House of Sharing）や関連資料が収集した証言・歴史記録・研究に基づき、' +
        '日本の戦時における軍性奴隷制度に関する質問にお答えします。回答はこのアーカイブの資料のみに基づいており、' +
        '記録にない場合はその旨をお伝えします。',
      welcome:
        'ようこそ。被害者の証言、慰安所制度の歴史、水曜デモ、政府の対応、あるいはナヌムの家そのものについて' +
        '質問できます。何をお知りになりたいですか？',
      reset: '新しい会話',
      placeholder: 'この歴史について質問してください…',
      botLabel: 'アーカイブ',
      youLabel: 'あなた',
      languageLabel: '回答の言語',
      suggestions: [
        '金学順（キム・ハクスン）とは誰ですか？',
        '河野談話とは何ですか？',
        'ナヌムの家とは何ですか？',
        'ナヌムの家はどこにありますか？',
      ],
      noAnswer: '申し訳ありません。回答が見つかりませんでした。',
      errorGeneric: '問題が発生しました。もう一度お試しください。',
      errorNetwork: 'サーバーに接続できませんでした。接続を確認して再度お試しください。',
    },
    zh: {
      lang: 'zh',
      title: '分享之家聊天机器人',
      intro:
        '本资料库依据分享之家（나눔의 집）及相关来源收集的证词、历史记录与研究，回答有关日本战时军队性奴役' +
        '制度的问题。回答仅依据本资料库的内容；如果记录中没有相关信息，助手会如实说明。',
      welcome:
        '欢迎。您可以询问幸存者的证词、慰安所制度的历史、周三示威、政府的回应，或分享之家本身。您想了解什么？',
      reset: '新对话',
      placeholder: '就这段历史提出问题…',
      botLabel: '资料库',
      youLabel: '您',
      languageLabel: '回答语言',
      suggestions: [
        '金学顺是谁？',
        '河野谈话是什么？',
        '分享之家是什么？',
        '分享之家在哪里？',
      ],
      noAnswer: '抱歉，未找到答案。',
      errorGeneric: '出现问题，请重试。',
      errorNetwork: '无法连接服务器，请检查网络后重试。',
    },
    es: {
      lang: 'es',
      title: 'Chatbot de la Casa del Compartir',
      intro:
        'Este archivo responde preguntas a partir de testimonios, registros históricos e investigaciones ' +
        'reunidos por la Casa del Compartir (나눔의 집) y fuentes relacionadas que documentan el sistema de ' +
        'esclavitud sexual militar de Japón durante la guerra. Las respuestas se basan únicamente en el ' +
        'archivo; si algo no consta en el registro, el asistente lo indicará.',
      welcome:
        'Bienvenido/a. Puede preguntar sobre los testimonios de las sobrevivientes, la historia del sistema ' +
        'de «estaciones de consuelo», las Manifestaciones de los Miércoles, las respuestas de los gobiernos ' +
        'o la propia Casa del Compartir. ¿Qué le gustaría saber?',
      reset: 'Nueva conversación',
      placeholder: 'Haga una pregunta sobre esta historia…',
      botLabel: 'Archivo',
      youLabel: 'Usted',
      languageLabel: 'Idioma de la respuesta',
      suggestions: [
        '¿Quién fue Kim Hak-soon?',
        '¿Qué fue la Declaración de Kono?',
        '¿Qué es la Casa del Compartir?',
        '¿Dónde se encuentra la Casa del Compartir?',
      ],
      noAnswer: 'Lo sentimos, no se encontró ninguna respuesta.',
      errorGeneric: 'Algo salió mal. Inténtelo de nuevo.',
      errorNetwork: 'No se pudo conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.',
    },
    fr: {
      lang: 'fr',
      title: 'Chatbot de la Maison du Partage',
      intro:
        'Ces archives répondent aux questions à partir de témoignages, de documents historiques et de ' +
        'recherches rassemblés par la Maison du Partage (나눔의 집) et des sources connexes documentant le ' +
        'système d’esclavage sexuel militaire du Japon pendant la guerre. Les réponses s’appuient ' +
        'uniquement sur ces archives ; si une information n’y figure pas, l’assistant le précisera.',
      welcome:
        'Bienvenue. Vous pouvez poser des questions sur les témoignages des survivantes, l’histoire du ' +
        'système des « stations de réconfort », les Manifestations du mercredi, les réponses des ' +
        'gouvernements ou la Maison du Partage elle-même. Que souhaitez-vous savoir ?',
      reset: 'Nouvelle conversation',
      placeholder: 'Posez une question sur cette histoire…',
      botLabel: 'Archives',
      youLabel: 'Vous',
      languageLabel: 'Langue de la réponse',
      suggestions: [
        'Qui était Kim Hak-soon ?',
        'Qu’était la déclaration de Kono ?',
        'Qu’est-ce que la Maison du Partage ?',
        'Où se trouve la Maison du Partage ?',
      ],
      noAnswer: 'Désolé, aucune réponse n’a été trouvée.',
      errorGeneric: 'Une erreur s’est produite. Veuillez réessayer.',
      errorNetwork: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
    },
    de: {
      lang: 'de',
      title: 'House-of-Sharing-Chatbot',
      intro:
        'Dieses Archiv beantwortet Fragen auf der Grundlage von Zeugenaussagen, historischen Aufzeichnungen ' +
        'und Forschungen, die vom House of Sharing (나눔의 집) und verwandten Quellen zum System der ' +
        'militärischen Sexsklaverei Japans während des Krieges zusammengetragen wurden. Die Antworten stützen ' +
        'sich ausschließlich auf dieses Archiv; fehlt eine Information, weist der Assistent darauf hin.',
      welcome:
        'Willkommen. Sie können nach den Zeugenaussagen der Überlebenden, der Geschichte des Systems der ' +
        '„Troststationen“, den Mittwochsdemonstrationen, den Reaktionen der Regierungen oder dem ' +
        'House of Sharing selbst fragen. Was möchten Sie wissen?',
      reset: 'Neues Gespräch',
      placeholder: 'Stellen Sie eine Frage zu dieser Geschichte…',
      botLabel: 'Archiv',
      youLabel: 'Sie',
      languageLabel: 'Antwortsprache',
      suggestions: [
        'Wer war Kim Hak-soon?',
        'Was war die Kono-Erklärung?',
        'Was ist das House of Sharing?',
        'Wo befindet sich das House of Sharing?',
      ],
      noAnswer: 'Leider wurde keine Antwort gefunden.',
      errorGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
      errorNetwork: 'Der Server ist nicht erreichbar. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
  };

  // Maps a <select> value (also the language sent to the server) to a chrome
  // translation set. "auto" keeps the English interface.
  const CHROME_FOR_VALUE = {
    auto: 'en',
    English: 'en',
    Korean: 'ko',
    Japanese: 'ja',
    'Chinese (Simplified)': 'zh',
    Spanish: 'es',
    French: 'fr',
    German: 'de',
  };

  const STORAGE_KEY = 'cw-answer-language';
  let t = I18N.en; // current chrome translation set

  function scrollToBottom() {
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function applyLanguage(value) {
    t = I18N[CHROME_FOR_VALUE[value] || 'en'];
    document.documentElement.lang = t.lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    userInput.placeholder = t.placeholder;

    if (suggestions) {
      suggestions.querySelectorAll('.chip').forEach((chip, i) => {
        if (t.suggestions[i]) chip.textContent = t.suggestions[i];
      });
    }
  }

  function appendMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `msg msg-${role}`;

    const label = document.createElement('span');
    label.className = 'msg-label';
    label.textContent = role === 'user' ? t.youLabel : t.botLabel;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    chatLog.appendChild(wrap);
    scrollToBottom();
    return bubble;
  }

  function appendLoading() {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-bot';

    const label = document.createElement('span');
    label.className = 'msg-label';
    label.textContent = t.botLabel;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble is-loading';
    bubble.innerHTML = '<span></span><span></span><span></span>';

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    chatLog.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  async function sendQuestion(question) {
    if (!question) return;

    appendMessage('user', question);
    if (suggestions) suggestions.style.display = 'none';

    const loadingEl = appendLoading();

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language: langSelect ? langSelect.value : 'auto' }),
      });

      const data = await res.json().catch(() => ({}));
      loadingEl.remove();

      if (!res.ok) {
        const bubble = appendMessage('bot', data.response || t.errorGeneric);
        bubble.classList.add('is-error');
        return;
      }

      appendMessage('bot', data.response || t.noAnswer);
    } catch (err) {
      loadingEl.remove();
      const bubble = appendMessage('bot', t.errorNetwork);
      bubble.classList.add('is-error');
    }
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const question = userInput.value.trim();
    if (!question) return;
    userInput.value = '';
    sendQuestion(question);
  });

  if (suggestions) {
    suggestions.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        sendQuestion(chip.textContent.trim());
      });
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      applyLanguage(langSelect.value);
      try {
        localStorage.setItem(STORAGE_KEY, langSelect.value);
      } catch (err) {
        // localStorage may be unavailable (private mode); selection still works for this session.
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      try {
        await fetch('/reset', { method: 'POST' });
      } catch (err) {
        // Non-fatal: the server session will just carry over.
      }
      chatLog.innerHTML = '';
      appendMessage('bot', t.welcome);
      if (suggestions) suggestions.style.display = 'flex';
    });
  }

  // ----- Init --------------------------------------------------------------
  let saved = 'auto';
  try {
    saved = localStorage.getItem(STORAGE_KEY) || 'auto';
  } catch (err) {
    // ignore
  }
  if (langSelect && CHROME_FOR_VALUE[saved]) {
    langSelect.value = saved;
  }
  applyLanguage(langSelect ? langSelect.value : 'auto');

  userInput.focus();
})();
