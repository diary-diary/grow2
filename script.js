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
  const supportBtn = $('support-btn');

  // ====== ДАННЫЕ ======
  let nickname = localStorage.getItem('mc_nick') || '';
  let tickets = JSON.parse(localStorage.getItem('mc_tickets') || '[]');

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

  nickInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveNickBtn.click(); });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('mc_nick');
    nickname = '';
    profileBody.classList.add('hidden');
    profileBar.classList.remove('open');
    renderAll();
  });

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
      <div class="rule-item"><div class="rule-title">4. Продажа аккаунтов</div><div class="rule-text">Продажа/покупка аккаунтов строго запрещена.</div><div class="rule-punish">Бан навсегда</div></div>
      <div class="rule-item"><div class="rule-title">5. Правила поведения</div><div class="rule-text">Запрещён оскорбительный и токсичный контент.</div><div class="rule-punish">Бан на 7 дней</div></div>
      <div class="rule-item"><div class="rule-title">6. Запрет на спам</div><div class="rule-text">Спам и реклама других проектов запрещены.</div><div class="rule-punish">Мут на 7 дней</div></div>
    `);
  });

  // ====== ПОДДЕРЖКА ======
  supportBtn.addEventListener('click', () => {
    const myTickets = tickets.filter(t => t.contact === (nickname || 'Гость'));
    if (myTickets.length > 0) showTicketList();
    else showNewTicketForm();
  });

  function showTicketList() {
    const myTickets = tickets.filter(t => t.contact === (nickname || 'Гость'));
    let html = '';
    myTickets.forEach(ticket => {
      const idx = tickets.indexOf(ticket);
      html += `<div class="ticket-card" data-index="${idx}">
        <div class="ticket-card-header"><span class="ticket-topic">${ticket.topicText}</span><span class="ticket-status ticket-open">Открыт</span></div>
        <div class="ticket-card-info"><span>${ticket.date.split('T')[0]}</span><span>${ticket.messages.length} сообщ.</span></div>
      </div>`;
    });
    openModal('Поддержка', `<div class="ticket-list-container"><button class="btn-new-ticket-top" id="btn-new-ticket-top">+ Новое обращение</button><div class="ticket-list">${html}</div></div>`);
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
        <div class="form-group"><label class="form-label"><span class="form-label-icon">3</span> Контакты</label><input class="form-input" id="contact" placeholder="Discord или ник" value="${nickname||''}"></div>
        <div class="form-buttons"><button type="button" class="btn-back-form" id="btn-back-form">← Назад</button><button type="submit" class="form-submit-btn">Отправить</button></div>
      </form>
    `);
    setTimeout(() => {
      const form = $('support-form'); if (!form) return;
      form.addEventListener('submit', e => {
        e.preventDefault();
        const topic = $('topic').value, desc = $('description').value.trim(), contact = $('contact').value.trim();
        if (!topic || !desc || !contact) return alert('Пожалуйста, заполни все поля.');
        const ticket = { id: Date.now(), topic, topicText: $('topic').selectedOptions[0].text, description: desc, contact, date: new Date().toISOString(), status:'open', messages:[
          {from:'user', text:desc, date:new Date().toISOString()},
          {from:'support', text:'Обращение получено. Наша команда скоро ответит.', date:new Date().toISOString()}
        ]};
        tickets.push(ticket);
        localStorage.setItem('mc_tickets', JSON.stringify(tickets));
        openTicketChat(tickets.length-1);
      });
      const back = $('btn-back-form'); if (back) back.addEventListener('click', ()=>{ const mt = tickets.filter(t=>t.contact===(nickname||'Гость')); if(mt.length) showTicketList(); else closeModal(); });
    }, 100);
  }

  function openTicketChat(idx) {
    const ticket = tickets[idx];
    function render() {
      let msgs = ticket.messages.map(m => {
        const isUser = m.from==='user';
        return `<div class="chat-message ${isUser?'chat-user':'chat-support'}"><div class="chat-avatar">${isUser?(nickname||'Я')[0]:'S'}</div><div class="chat-bubble"><div class="chat-sender">${isUser?(nickname||'Гость'):'Поддержка'}</div><div class="chat-text">${m.text}</div><div class="chat-time">${new Date(m.date).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</div></div></div>`;
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
          setTimeout(() => { ticket.messages.push({from:'support', text:'Спасибо за ответ! Модератор скоро подключится.', date: new Date().toISOString()}); localStorage.setItem('mc_tickets', JSON.stringify(tickets)); render(); }, 1500);
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

  // ====== СВЕТЛЯЧКИ (Улучшенные) ======
  (function() {
    const canvas = $('fireflies'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight * 0.7; }
    resize(); window.addEventListener('resize', resize);
    
    // Больше разнообразия в размере и скорости
    const flies = Array.from({length: 45}, () => ({ 
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height, 
      r: Math.random() * 2 + 0.8, 
      vx: (Math.random() - 0.5) * 0.4, 
      vy: (Math.random() - 0.5) * 0.4, 
      phase: Math.random() * Math.PI * 2, 
      brightness: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.8 ? '220, 255, 150' : '180, 255, 100' // Редкие желтоватые светлячки
    }));

    function animate(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      flies.forEach(f => {
        // Плавное движение на основе синусоид
        f.x += f.vx + Math.sin(t / 2500 + f.phase) * 0.3; 
        f.y += f.vy + Math.cos(t / 2000 + f.phase) * 0.3;
        
        // Перенос при выходе за экран
        if(f.x < -20) f.x = canvas.width + 20; 
        if(f.x > canvas.width + 20) f.x = -20; 
        if(f.y < -20) f.y = canvas.height + 20; 
        if(f.y > canvas.height + 20) f.y = -20;
        
        // Органичное пульсирующее свечение
        const alpha = Math.max(0.05, f.brightness + Math.sin(t / 600 + f.phase) * 0.5);
        
        ctx.beginPath(); 
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); 
        ctx.fillStyle = `rgba(${f.color}, ${alpha})`; 
        
        // Мягкий хвост/глоу
        ctx.shadowColor = `rgba(${f.color}, 0.8)`; 
        ctx.shadowBlur = 12; 
        ctx.fill(); 
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  })();

  // ====== ПАДАЮЩИЕ ЗВЁЗДЫ ======
  (function() {
    const container = $('shooting-stars-container');
    if (!container) return;

    function spawnShootingStar() {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      
      // Случайная позиция (в верхней половине экрана)
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 30 + 'vh';
      
      // Немного разная длина и скорость
      const duration = Math.random() * 1.5 + 1.5;
      star.style.animationDuration = duration + 's';
      
      container.appendChild(star);
      
      // Удаляем элемент после завершения анимации
      setTimeout(() => star.remove(), duration * 1000);
      
      // Следующая звезда через случайное время (от 3 до 10 секунд)
      setTimeout(spawnShootingStar, Math.random() * 7000 + 3000);
    }
    
    // Запуск первой звезды
    setTimeout(spawnShootingStar, 2000);
  })();

  renderAll();
});
