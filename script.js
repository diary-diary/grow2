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

  // Модальное окно
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
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // ====== ИНФОРМАЦИЯ ======
  infoBtn.addEventListener('click', () => {
    const content = `
      <div class="info-step">
        <div class="info-step-num">Шаг 1. IP сервера</div>
        <p>Скопируй IP: <code>play.growagarden.ru</code> и вставь в Minecraft.<br>
        Зайди в «Сетевая игра» → «Добавить сервер».</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 2. Регистрация</div>
        <p>Зайдя на сервер, тебе нужно зарегистрироваться.<br>
        Введи команду: <code>/register твой_пароль</code><br>
        Запомни пароль — он понадобится для входа!</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 3. Выбери режим</div>
        <p>На сервере есть несколько режимов:<br>
        • Выживание — основной режим<br>
        • Фермерство — ухаживай за садом<br>
        • Строительство — создавай свой мир</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 4. Подойди к пчеле</div>
        <p>На спавне ты найдёшь большую пчелу. Подойди к ней и нажми ПКМ.<br>
        Она расскажет, как начать играть на сервере Grow-a-Garden,<br>
        какие команды использовать и что делать в первую очередь!</p>
      </div>
    `;
    openModal('Обучение', content);
  });

  // ====== ПРАВИЛА ======
  rulesBtn.addEventListener('click', () => {
    const content = `
      <div class="rule-item">
        <div class="rule-title">1. Взаимное уважение</div>
        <div class="rule-text">Запрещается оскорблять, унижать, провоцировать или каким-либо образом унижать других игроков, включая публичные высказывания в чатах и голосовых каналах. Агрессивное поведение, троллинг и флуд, мешающий игре других, также не допускаются.</div>
        <div class="rule-punish">Наказание: Бан на 1 день</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">2. Запрет на использование читов и стороннего ПО</div>
        <div class="rule-text">Строго запрещено использование читов, модификаций, макросов, багов игрового клиента и любых сторонних программ, дающих преимущества в игре. Любые подозрения на нечестную игру будут рассматриваться администрацией и могут привести к блокировке без предупреждения.</div>
        <div class="rule-punish">Наказание: Бан на 30 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">3. Запрет на взлом и мошенничество</div>
        <div class="rule-text">Взлом чужих аккаунтов, сбор и распространение личных данных игроков, а также мошеннические действия запрещены. Никакая ответственность за утрату аккаунта по причине передачи данных третьим лицам не возлагается на администрацию.</div>
        <div class="rule-punish">Наказание: Бан навсегда</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">4. Запрет на продажу и обмен аккаунтами</div>
        <div class="rule-text">Запрещается продажа, покупка или обмен учетных записей сервера. Нарушение данного правила ведет к блокировке всех связанных аккаунтов без возможности восстановления.</div>
        <div class="rule-punish">Наказание: Бан навсегда</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">5. Правила поведения на сервере и в игре</div>
        <div class="rule-text">Запрещено создавать запрещённый контент (оскорбительные символы, надписи, неприемлемые постройки и т.д.).</div>
        <div class="rule-punish">Наказание: Бан на 7 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">6. Запрет на спам и рекламу</div>
        <div class="rule-text">Запрещена рассылка спама, рекламы других серверов, сайтов, продуктов или услуг. Запрещено навязчивое приглашение других игроков в сторонние сообщества и проекты.</div>
        <div class="rule-punish">Наказание: Мут на 7 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">7. Ответственность за собственные действия</div>
        <div class="rule-text">Каждый игрок несет личную ответственность за свои действия в игре и на сервере. Администрация не несет ответственности за технические сбои, потерю данных, проблемы с интернет-соединением или клиентом игры.</div>
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
