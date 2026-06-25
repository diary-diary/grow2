document.addEventListener('DOMContentLoaded', () => {

  const $ = id => document.getElementById(id);
  
  const serverIp = $('server-ip');
  const copyBtn = $('copy-ip');
  const statusEl = $('server-status');
  const playersEl = $('players-count');

  const profileBar = $('profile-bar');
  const profileBody = $('profile-body');
  const avatarEl = $('avatar');
  const nicknameEl = $('nickname');

  const nickInput = $('nick-input');
  const saveNickBtn = $('save-nick');
  const logoutBtn = $('logout-btn');

  const modal = $('modal');
  const modalOverlay = $('modal-overlay');
  const modalTitle = $('modal-title');
  const modalBody = $('modal-body');
  const modalClose = $('modal-close');
  const infoBtn = $('info-btn');
  const rulesBtn = $('rules-btn');

  // ====== ДАННЫЕ ======
  let nickname = localStorage.getItem('mc_nick') || '';

  const leafColors = [
    { bg: '#3a6020', border: '#5a8030', inner: '#4a8a20' },
    { bg: '#2a5018', border: '#4a7028', inner: '#3a7820' },
    { bg: '#305820', border: '#508030', inner: '#408020' },
    { bg: '#284818', border: '#487028', inner: '#387820' },
    { bg: '#3a5828', border: '#5a7838', inner: '#4a8830' },
    { bg: '#265020', border: '#467828', inner: '#368018' },
    { bg: '#345828', border: '#547838', inner: '#448028' },
  ];

  function getLeafColor(name) {
    return leafColors[name.length % leafColors.length];
  }

  // ====== ОТРИСОВКА ======
  function renderAll() {
    const displayName = nickname || 'Гость';
    nicknameEl.textContent = displayName;
    
    const colors = getLeafColor(displayName);
    avatarEl.style.background = 'linear-gradient(135deg, ' + colors.bg + ', ' + colors.inner + ')';
    avatarEl.style.borderColor = colors.border;
    
    nickInput.value = nickname;
  }

  // ====== СОХРАНЕНИЕ НИКА ======
  saveNickBtn.addEventListener('click', () => {
    const val = nickInput.value.trim();
    if (!val || val.length < 2) {
      nickInput.style.borderColor = '#803030';
      setTimeout(() => nickInput.style.borderColor = '#3a5020', 1500);
      return;
    }
    nickname = val;
    localStorage.setItem('mc_nick', nickname);
    renderAll();
    nickInput.style.borderColor = '#70a040';
    setTimeout(() => nickInput.style.borderColor = '#3a5020', 1000);
  });

  nickInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveNickBtn.click();
  });

  // ====== ВЫХОД ======
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('mc_nick');
    nickname = '';
    profileBody.classList.add('hidden');
    profileBar.classList.remove('open');
    renderAll();
  });

  // ====== РАСКРЫТИЕ ПРОФИЛЯ ======
  profileBar.addEventListener('click', () => {
    profileBody.classList.toggle('hidden');
    profileBar.classList.toggle('open');
    if (!profileBody.classList.contains('hidden')) renderAll();
  });

  // ====== МОДАЛЬНОЕ ОКНО ======
  function openModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // ====== ИНФОРМАЦИЯ ======
  infoBtn.addEventListener('click', () => {
    const content = `
      <div class="info-step">
        <div class="info-step-num">Шаг 1. IP сервера</div>
        <p>Скопируй IP: <code>play.growagarden.ru</code><br>
        Открой Minecraft, зайди в раздел «Сетевая игра», нажми «Добавить сервер» и вставь IP-адрес.</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 2. Регистрация</div>
        <p>После подключения к серверу тебе нужно зарегистрироваться.<br>
        В чате введи команду:<br>
        <code>/register твой_пароль</code><br>
        Обязательно запомни пароль — он нужен для входа!</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 3. Выбери режим</div>
        <p>На сервере есть несколько режимов игры:<br>
        • Выживание — классический режим<br>
        • Фермерство — ухаживай за растениями<br>
        • Строительство — создавай постройки<br>
        Выбрать режим можно в меню при входе.</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 4. Подойди к пчеле</div>
        <p>На спавне ты увидишь большую дружелюбную пчелу. Нажми на неё ПКМ (правой кнопкой мыши).<br>
        Она проведёт обучение, расскажет про команды, покажет где брать семена, как сажать растения и зарабатывать игровую валюту.</p>
      </div>
    `;
    openModal('Обучение', content);
  });

  // ====== ПРАВИЛА ======
  rulesBtn.addEventListener('click', () => {
    const content = `
      <div class="rule-item">
        <div class="rule-title">1. Взаимное уважение</div>
        <div class="rule-text">Запрещается оскорблять, унижать, провоцировать или каким-либо образом принижать других игроков. Это касается публичных высказываний в чатах и голосовых каналах. Агрессивное поведение, троллинг и флуд, мешающий игре других участников, также не допускаются.</div>
        <div class="rule-punish">Наказание: Бан на 1 день</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">2. Запрет на читы и стороннее ПО</div>
        <div class="rule-text">Строго запрещено использование читов, модификаций, макросов, эксплойтов игрового клиента и любых сторонних программ, дающих преимущества в игре. Любые подозрения на нечестную игру рассматриваются администрацией и могут привести к блокировке без предупреждения.</div>
        <div class="rule-punish">Наказание: Бан на 30 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">3. Запрет на взлом и мошенничество</div>
        <div class="rule-text">Взлом чужих аккаунтов, сбор и распространение личных данных игроков, а также любые мошеннические действия строго запрещены. Администрация не несёт ответственности за утрату аккаунта по причине передачи данных третьим лицам.</div>
        <div class="rule-punish">Наказание: Бан навсегда</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">4. Запрет на продажу аккаунтов</div>
        <div class="rule-text">Запрещается продажа, покупка или обмен учетных записей сервера. Нарушение данного правила ведёт к блокировке всех связанных аккаунтов без возможности восстановления.</div>
        <div class="rule-punish">Наказание: Бан навсегда</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">5. Правила поведения</div>
        <div class="rule-text">Запрещено создавать оскорбительный контент: неприемлемые символы, надписи, постройки, а также любые формы дискриминации и провокаций.</div>
        <div class="rule-punish">Наказание: Бан на 7 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">6. Запрет на спам и рекламу</div>
        <div class="rule-text">Запрещена рассылка спама, рекламы других серверов, сайтов, продуктов или услуг. Также запрещено навязчивое приглашение игроков в сторонние сообщества и проекты.</div>
        <div class="rule-punish">Наказание: Мут на 7 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">7. Ответственность игрока</div>
        <div class="rule-text">Каждый игрок несёт личную ответственность за свои действия в игре и на сервере. Администрация не несёт ответственности за технические сбои, потерю данных, проблемы с интернет-соединением или клиентом игры.</div>
      </div>
    `;
    openModal('Правила сервера', content);
  });

  // ====== СТАТУС СЕРВЕРА ======
  async function checkStatus() {
    try {
      const res = await fetch('https://api.mcsrvstat.us/2/play.growagarden.ru:25565');
      const data = await res.json();
      if (data.online) {
        statusEl.className = 'status online';
        statusEl.innerHTML = '<span class="status-dot"></span> онлайн';
        playersEl.textContent = data.players ? 'игроков ' + data.players.online + '/' + data.players.max : '';
      } else {
        statusEl.className = 'status offline';
        statusEl.innerHTML = '<span class="status-dot"></span> оффлайн';
        playersEl.textContent = '';
      }
    } catch {
      statusEl.className = 'status offline';
      statusEl.innerHTML = '<span class="status-dot"></span> нет связи';
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000);

  // ====== КОПИРОВАНИЕ IP ======
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(serverIp.textContent.trim()).then(() => {
      copyBtn.textContent = 'OK';
      copyBtn.style.color = '#80ff80';
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="copy-icon"></span>';
        copyBtn.style.color = '#a0c060';
      }, 1500);
    });
  });

  // ====== СВЕТЛЯЧКИ ======
  (function fireflies() {
    const canvas = $('fireflies');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.7;
    }
    resize();
    window.addEventListener('resize', resize);

    const flies = [];
    for (let i = 0; i < 35; i++) {
      flies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.5 + 0.3
      });
    }

    function animate(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      flies.forEach(f => {
        f.x += f.vx + Math.sin(t/3000 + f.phase) * 0.4;
        f.y += f.vy + Math.cos(t/2500 + f.phase) * 0.4;
        
        if (f.x < -20) f.x = canvas.width + 20;
        if (f.x > canvas.width + 20) f.x = -20;
        if (f.y < -20) f.y = canvas.height + 20;
        if (f.y > canvas.height + 20) f.y = -20;
        
        const alpha = f.brightness + Math.sin(t/800 + f.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 255, 100, ' + Math.max(0.05, alpha) + ')';
        ctx.fill();
        ctx.shadowColor = 'rgba(150, 255, 80, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
  })();

  renderAll();
});
