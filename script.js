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
  const passInput = $('pass-input');
  const loginBtn = $('login-btn');
  const registerBtn = $('register-btn');
  const authMsg = $('auth-msg');
  const logoutBtn = $('logout-btn');

  const modal = $('modal');
  const modalOverlay = $('modal-overlay');
  const modalTitle = $('modal-title');
  const modalBody = $('modal-body');
  const modalClose = $('modal-close');
  const infoBtn = $('info-btn');
  const rulesBtn = $('rules-btn');
  const supportBtn = $('support-btn');

  // ====== ДАННЫЕ ======
  let currentUser = null; // { nick, password }
  let tickets = JSON.parse(localStorage.getItem('mc_tickets') || '[]');
  const users = JSON.parse(localStorage.getItem('mc_users') || '{}');

  function saveUsers() {
    localStorage.setItem('mc_users', JSON.stringify(users));
  }

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

  function updateAvatar(nick) {
    const colors = getLeafColor(nick || 'Гость');
    avatarEl.style.background = 'linear-gradient(135deg, ' + colors.bg + ', ' + colors.inner + ')';
    avatarEl.style.borderColor = colors.border;
  }

  function renderProfile() {
    if (currentUser) {
      nicknameEl.textContent = currentUser.nick;
      updateAvatar(currentUser.nick);
      nickInput.value = currentUser.nick;
      // Показываем поле пароля, если ещё не вошёл
      if (authRow) authRow.style.display = 'flex';
      if (authMsg) authMsg.textContent = '';
    } else {
      nicknameEl.textContent = 'Гость';
      updateAvatar('Гость');
      nickInput.value = '';
      if (authRow) authRow.style.display = 'flex';
    }
  }

  // ====== АВТОРИЗАЦИЯ ======
  function showAuthMessage(text, isError = true) {
    if (authMsg) {
      authMsg.textContent = text;
      authMsg.style.color = isError ? '#ff8080' : '#80ff80';
    }
  }

  loginBtn.addEventListener('click', () => {
    const nick = nickInput.value.trim();
    const pass = passInput.value.trim();
    if (!nick || !pass) return showAuthMessage('Введи ник и пароль');
    if (users[nick] && users[nick] === pass) {
      currentUser = { nick, password: pass };
      showAuthMessage('Вход выполнен!', false);
      renderProfile();
    } else {
      showAuthMessage('Неверный ник или пароль');
    }
  });

  registerBtn.addEventListener('click', () => {
    const nick = nickInput.value.trim();
    const pass = passInput.value.trim();
    if (!nick || !pass) return showAuthMessage('Введи ник и пароль');
    if (users[nick]) return showAuthMessage('Такой ник уже занят');
    users[nick] = pass;
    saveUsers();
    currentUser = { nick, password: pass };
    showAuthMessage('Регистрация успешна!', false);
    renderProfile();
  });

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    renderProfile();
    profileBody.classList.add('hidden');
    profileBar.classList.remove('open');
    showAuthMessage('');
  });

  saveNickBtn.addEventListener('click', () => {
    const val = nickInput.value.trim();
    if (!val || val.length < 2) return;
    if (currentUser) {
      // Меняем ник в системе
      const oldNick = currentUser.nick;
      if (users[val] && val !== oldNick) return showAuthMessage('Ник занят');
      users[val] = users[oldNick];
      delete users[oldNick];
      saveUsers();
      currentUser.nick = val;
      // Обновляем тикеты
      tickets = tickets.map(t => t.contact === oldNick ? { ...t, contact: val } : t);
      localStorage.setItem('mc_tickets', JSON.stringify(tickets));
    }
    renderProfile();
  });

  profileBar.addEventListener('click', () => {
    profileBody.classList.toggle('hidden');
    profileBar.classList.toggle('open');
    if (!profileBody.classList.contains('hidden')) renderProfile();
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });

  // ====== ИНФОРМАЦИЯ ======
  infoBtn.addEventListener('click', () => {
    openModal('Обучение', `
      <div class="info-step"><div class="info-step-num">Шаг 1. IP сервера</div><p>Скопируй IP: <code>play.growagarden.ru</code><br>Открой Minecraft, зайди в «Сетевая игра», нажми «Добавить сервер» и вставь IP-адрес.</p></div>
      <div class="info-step"><div class="info-step-num">Шаг 2. Регистрация</div><p>В чате введи команду:<br><code>/register твой_пароль</code><br>Запомни пароль для входа!</p></div>
      <div class="info-step"><div class="info-step-num">Шаг 3. Выбери режим</div><p>• Выживание • Фермерство • Строительство</p></div>
      <div class="info-step"><div class="info-step-num">Шаг 4. Подойди к пчеле</div><p>На спавне нажми ПКМ на пчелу — она проведёт обучение.</p></div>
    `);
  });

  // ====== ПРАВИЛА ======
  rulesBtn.addEventListener('click', () => {
    openModal('Правила сервера', `
      <div class="rule-item"><div class="rule-title">1. Взаимное уважение</div><div class="rule-text">Запрещены оскорбления и агрессивное поведение.</div><div class="rule-punish">Бан на 1 день</div></div>
      <div class="rule-item"><div class="rule-title">2. Запрет на читы</div><div class="rule-text">Запрещено использование читов и стороннего ПО.</div><div class="rule-punish">Бан на 30 дней</div></div>
      <div class="rule-item"><div class="rule-title">3. Запрет на взлом</div><div class="rule-text">Взлом аккаунтов и мошенничество запрещены.</div><div class="rule-punish">Бан навсегда</div></div>
      <div class="rule-item"><div class="rule-title">4. Запрет на продажу аккаунтов</div><div class="rule-text">Продажа/покупка аккаунтов запрещена.</div><div class="rule-punish">Бан навсегда</div></div>
      <div class="rule-item"><div class="rule-title">5. Правила поведения</div><div class="rule-text">Запрещён оскорбительный контент.</div><div class="rule-punish">Бан на 7 дней</div></div>
      <div class="rule-item"><div class="rule-title">6. Запрет на спам</div><div class="rule-text">Спам и реклама запрещены.</div><div class="rule-punish">Мут на 7 дней</div></div>
      <div class="rule-item"><div class="rule-title">7. Ответственность</div><div class="rule-text">Игрок несёт ответственность за свои действия.</div></div>
    `);
  });

  // ====== ПОДДЕРЖКА ======
  supportBtn.addEventListener('click', () => {
    if (!currentUser) return alert('Сначала войди в аккаунт!');
    const myTickets = tickets.filter(t => t.contact === currentUser.nick);
    if (myTickets.length > 0) showTicketList();
    else showNewTicketForm();
  });

  function showTicketList() {
    const myTickets = tickets.filter(t => t.contact === currentUser.nick);
    let html = '';
    myTickets.forEach(ticket => {
      const idx = tickets.indexOf(ticket);
      html += `<div class="ticket-card" data-index="${idx}">
        <div class="ticket-card-header"><span class="ticket-topic">${ticket.topicText}</span><span class="ticket-status ticket-open">Открыт</span></div>
        <div class="ticket-card-info"><span>${ticket.date.split('T')[0]}</span><span>${ticket.messages.length} сообщ.</span></div>
      </div>`;
    });
    openModal('Мои обращения', `<div class="ticket-list-container"><button class="btn-new-ticket-top" id="btn-new-ticket-top">+ Новое обращение</button><div class="ticket-list">${html}</div></div>`);
    setTimeout(() => {
      document.querySelectorAll('.ticket-card').forEach(c => c.addEventListener('click', function(){ openTicketChat(parseInt(this.dataset.index)); }));
      const btn = $('btn-new-ticket-top'); if (btn) btn.addEventListener('click', showNewTicketForm);
    }, 100);
  }

  function showNewTicketForm() {
    openModal('Новое обращение', `
      <form class="support-form" id="support-form">
        <div class="form-group"><label class="form-label"><span class="form-label-icon">1</span> Тема</label><select class="form-select" id="topic"><option value="">Выбери...</option><option value="bug">Баг</option><option value="player">Жалоба</option><option value="other">Другое</option></select></div>
        <div class="form-group"><label class="form-label"><span class="form-label-icon">2</span> Описание</label><textarea class="form-textarea" id="description" rows="5" placeholder="Опиши ситуацию..."></textarea></div>
        <div class="form-group"><label class="form-label"><span class="form-label-icon">3</span> Контакты</label><input class="form-input" id="contact" value="${currentUser.nick}" readonly></div>
        <div class="form-buttons"><button type="submit" class="form-submit-btn">Отправить</button></div>
      </form>
    `);
    setTimeout(() => {
      const form = $('support-form'); if (!form) return;
      form.addEventListener('submit', e => {
        e.preventDefault();
        const topic = $('topic').value, desc = $('description').value.trim();
        if (!topic || !desc) return alert('Заполни все поля');
        const ticket = { id: Date.now(), topic, topicText: $('topic').selectedOptions[0].text, description: desc, contact: currentUser.nick, date: new Date().toISOString(), status:'open', messages:[
          {from:'user', text:desc, date:new Date().toISOString()},
          {from:'support', text:'Обращение получено. Ожидайте ответа.', date:new Date().toISOString()}
        ]};
        tickets.push(ticket);
        localStorage.setItem('mc_tickets', JSON.stringify(tickets));
        openTicketChat(tickets.length-1);
      });
    }, 100);
  }

  function openTicketChat(idx) {
    const ticket = tickets[idx];
    function render() {
      let msgs = ticket.messages.map(m => {
        const isUser = m.from==='user';
        return `<div class="chat-message ${isUser?'chat-user':'chat-support'}"><div class="chat-avatar">${isUser?(currentUser.nick||'Я')[0]:'S'}</div><div class="chat-bubble"><div class="chat-sender">${isUser?currentUser.nick:'Поддержка'}</div><div class="chat-text">${m.text}</div><div class="chat-time">${new Date(m.date).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</div></div></div>`;
      }).join('');
      openModal('Чат поддержки', `<div class="chat-container"><div class="chat-header-info"><span>Тикет #${ticket.id}</span></div><div class="chat-messages" id="chat-messages">${msgs}</div><div class="chat-input-area"><input class="chat-input" id="chat-input" placeholder="Сообщение..."><button class="chat-send-btn" id="chat-send-btn">Отпр.</button></div><button class="btn-back-tickets" id="btn-back-tickets">← К списку</button></div>`);
      setTimeout(() => {
        $('chat-messages').scrollTop = $('chat-messages').scrollHeight;
        $('chat-send-btn').addEventListener('click', send);
        $('chat-input').addEventListener('keydown', e=>{ if(e.key==='Enter') send(); });
        $('btn-back-tickets').addEventListener('click', ()=> showTicketList());
        function send() {
          const text = $('chat-input').value.trim(); if(!text) return;
          ticket.messages.push({from:'user', text, date: new Date().toISOString()});
          setTimeout(() => { ticket.messages.push({from:'support', text:'Спасибо за обращение!', date: new Date().toISOString()}); localStorage.setItem('mc_tickets', JSON.stringify(tickets)); render(); }, 1500);
          localStorage.setItem('mc_tickets', JSON.stringify(tickets));
          render();
        }
      }, 100);
    }
    render();
  }

  // ====== СТАТУС СЕРВЕРА ======
  async function checkStatus() {
    try {
      const res = await fetch('https://api.mcsrvstat.us/2/play.growagarden.ru:25565');
      const data = await res.json();
      statusEl.className = 'status ' + (data.online ? 'online' : 'offline');
      statusEl.innerHTML = data.online ? '<span class="status-dot"></span> онлайн' : '<span class="status-dot"></span> оффлайн';
      playersEl.textContent = data.players ? 'игроков ' + data.players.online + '/' + data.players.max : '';
    } catch { statusEl.className = 'status offline'; statusEl.innerHTML = '<span class="status-dot"></span> нет связи'; }
  }
  checkStatus();
  setInterval(checkStatus, 60000);

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(serverIp.textContent.trim()).then(() => {
      copyBtn.textContent = 'OK'; setTimeout(() => copyBtn.innerHTML = '<span class="copy-icon"></span>', 1500);
    });
  });

  // ====== СВЕТЛЯЧКИ ======
  (function() {
    const canvas = $('fireflies'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight * 0.7; }
    resize(); window.addEventListener('resize', resize);
    const flies = Array.from({length:35}, () => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*2.5+1, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, phase: Math.random()*Math.PI*2, brightness: Math.random()*0.5+0.3 }));
    function animate(t) {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      flies.forEach(f => {
        f.x += f.vx + Math.sin(t/3000+f.phase)*0.4; f.y += f.vy + Math.cos(t/2500+f.phase)*0.4;
        if(f.x<-20) f.x=canvas.width+20; if(f.x>canvas.width+20) f.x=-20; if(f.y<-20) f.y=canvas.height+20; if(f.y>canvas.height+20) f.y=-20;
        const alpha = Math.max(0.05, f.brightness + Math.sin(t/800+f.phase)*0.3);
        ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fillStyle = `rgba(180,255,100,${alpha})`; ctx.fill();
        ctx.shadowColor = 'rgba(150,255,80,0.8)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  })();

  renderProfile();
});
