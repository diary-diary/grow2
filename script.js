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
        • Строительство — создавай постройки</p>
      </div>
      <div class="info-step">
        <div class="info-step-num">Шаг 4. Подойди к пчеле</div>
        <p>На спавне ты увидишь большую дружелюбную пчелу. Нажми на неё ПКМ.<br>
        Она проведёт обучение и расскажет что делать дальше.</p>
      </div>
    `;
    openModal('Обучение', content);
  });

  // ====== ПРАВИЛА ======
  rulesBtn.addEventListener('click', () => {
    const content = `
      <div class="rule-item">
        <div class="rule-title">1. Взаимное уважение</div>
        <div class="rule-text">Запрещается оскорблять, унижать, провоцировать или каким-либо образом принижать других игроков.</div>
        <div class="rule-punish">Наказание: Бан на 1 день</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">2. Запрет на читы и стороннее ПО</div>
        <div class="rule-text">Строго запрещено использование читов, модификаций, макросов, эксплойтов.</div>
        <div class="rule-punish">Наказание: Бан на 30 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">3. Запрет на взлом и мошенничество</div>
        <div class="rule-text">Взлом чужих аккаунтов, сбор и распространение личных данных запрещены.</div>
        <div class="rule-punish">Наказание: Бан навсегда</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">4. Запрет на продажу аккаунтов</div>
        <div class="rule-text">Запрещается продажа, покупка или обмен учетных записей сервера.</div>
        <div class="rule-punish">Наказание: Бан навсегда</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">5. Правила поведения</div>
        <div class="rule-text">Запрещено создавать оскорбительный контент.</div>
        <div class="rule-punish">Наказание: Бан на 7 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">6. Запрет на спам и рекламу</div>
        <div class="rule-text">Запрещена рассылка спама и рекламы.</div>
        <div class="rule-punish">Наказание: Мут на 7 дней</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">7. Ответственность игрока</div>
        <div class="rule-text">Каждый игрок несёт личную ответственность за свои действия.</div>
      </div>
    `;
    openModal('Правила сервера', content);
  });

  // ====== ПОДДЕРЖКА - ГЛАВНАЯ ЛОГИКА ======
  supportBtn.addEventListener('click', () => {
    const myTickets = tickets.filter(t => t.contact === (nickname || 'Гость'));
    
    if (myTickets.length > 0) {
      // Есть обращения - показываем список
      showTicketList();
    } else {
      // Нет обращений - показываем форму
      showNewTicketForm();
    }
  });

  // ====== ПОКАЗАТЬ СПИСОК ТИКЕТОВ ======
  function showTicketList() {
    const myTickets = tickets.filter(t => t.contact === (nickname || 'Гость'));
    
    let ticketsHtml = '';
    
    myTickets.forEach((ticket) => {
      const realIndex = tickets.indexOf(ticket);
      const status = ticket.status || 'open';
      const statusText = status === 'open' ? 'Открыт' : 'Закрыт';
      const statusClass = status === 'open' ? 'ticket-open' : 'ticket-closed';
      const msgCount = ticket.messages ? ticket.messages.length : 0;
      
      ticketsHtml += `
        <div class="ticket-card" data-index="${realIndex}">
          <div class="ticket-card-header">
            <span class="ticket-topic">${ticket.topicText}</span>
            <span class="ticket-status ${statusClass}">${statusText}</span>
          </div>
          <div class="ticket-card-info">
            <span>${ticket.date.split('T')[0]}</span>
            <span>${msgCount} сообщ.</span>
          </div>
        </div>
      `;
    });

    const content = `
      <div class="ticket-list-container">
        <button class="btn-new-ticket-top" id="btn-new-ticket-top">+ Создать новое обращение</button>
        <div class="ticket-list-header">
          <h3>Мои обращения (${myTickets.length})</h3>
        </div>
        <div class="ticket-list" id="ticket-list">
          ${ticketsHtml}
        </div>
      </div>
    `;
    
    openModal('Поддержка', content);
    
    // Вешаем обработчики
    setTimeout(() => {
      // Кнопка "Создать новое"
      const btnNewTop = document.getElementById('btn-new-ticket-top');
      if (btnNewTop) {
        btnNewTop.addEventListener('click', showNewTicketForm);
      }
      
      // Карточки тикетов
      document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', function() {
          const index = parseInt(this.dataset.index);
          openTicketChat(index);
        });
      });
    }, 100);
  }

  // ====== ПОКАЗАТЬ ФОРМУ НОВОГО ТИКЕТА ======
  function showNewTicketForm() {
    const content = `
      <form class="support-form" id="support-form">
        
        <div class="form-group">
          <label class="form-label">
            <span class="form-label-icon">1</span> Тема обращения
          </label>
          <select class="form-select" id="topic" required>
            <option value="">Выбери тему...</option>
            <option value="bug">Ошибка / Баг</option>
            <option value="player">Жалоба на игрока</option>
            <option value="payment">Проблема с оплатой</option>
            <option value="account">Проблема с аккаунтом</option>
            <option value="suggestion">Предложение</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="form-label-icon">2</span> Опиши ситуацию
          </label>
          <textarea class="form-textarea" id="description" rows="5" placeholder="Опиши что произошло, когда и при каких обстоятельствах..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="form-label-icon">3</span> Контакты
          </label>
          <input type="text" class="form-input" id="contact" placeholder="Discord: User#1234 или Ник в Minecraft" value="${nickname || ''}" required>
          <p class="form-hint">Укажи свой Discord ID или никнейм в игре</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="form-label-icon">4</span> Скриншоты
          </label>
          
          <div class="file-upload-area" id="file-upload-area">
            <div class="file-upload-icon">
              <span class="upload-icon-img"></span>
            </div>
            <p class="file-upload-text">Нажми сюда или перетащи файлы</p>
            <p class="file-upload-hint">PNG, JPG, GIF до 5 МБ (макс. 5 файлов)</p>
            <input type="file" class="file-input" id="file-input" accept="image/png,image/jpeg,image/gif" multiple>
          </div>

          <div class="file-preview-list" id="file-preview-list"></div>
        </div>

        <div class="form-buttons">
          <button type="button" class="btn-back-form" id="btn-back-form">← Назад</button>
          <button type="submit" class="form-submit-btn" id="submit-ticket">
            <span class="send-icon"></span> Отправить
          </button>
        </div>
      </form>
    `;
    
    openModal('Новое обращение', content);
    
    setTimeout(() => {
      const form = document.getElementById('support-form');
      const fileInput = document.getElementById('file-input');
      const fileUploadArea = document.getElementById('file-upload-area');
      const filePreviewList = document.getElementById('file-preview-list');
      const btnBack = document.getElementById('btn-back-form');
      
      if (!form) return;
      
      // Кнопка назад
      if (btnBack) {
        btnBack.addEventListener('click', () => {
          const myTickets = tickets.filter(t => t.contact === (nickname || 'Гость'));
          if (myTickets.length > 0) {
            showTicketList();
          } else {
            closeModal();
          }
        });
      }
      
      let selectedFiles = [];

      fileUploadArea.addEventListener('click', () => fileInput.click());

      fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
      });

      fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
      });

      fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
      });

      fileInput.addEventListener('change', () => handleFiles(fileInput.files));

      function handleFiles(files) {
        for (let file of files) {
          if (!file.type.match(/^image\/(png|jpeg|gif)$/)) continue;
          if (file.size > 5 * 1024 * 1024) continue;
          if (selectedFiles.length >= 5) break;
          selectedFiles.push(file);
        }
        renderPreviews();
      }

      function renderPreviews() {
        filePreviewList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'file-preview-item';
            preview.innerHTML = `
              <img src="${e.target.result}" class="file-preview-img">
              <span class="file-preview-name">${file.name}</span>
              <button type="button" class="file-preview-remove" data-index="${index}">
                <span class="remove-icon"></span>
              </button>
            `;
            filePreviewList.appendChild(preview);
            preview.querySelector('.file-preview-remove').addEventListener('click', () => {
              selectedFiles.splice(index, 1);
              renderPreviews();
            });
          };
          reader.readAsDataURL(file);
        });
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value;
        const description = document.getElementById('description').value.trim();
        const contact = document.getElementById('contact').value.trim();

        if (!topic || !description || !contact) {
          alert('Заполни все обязательные поля!');
          return;
        }

        const newTicket = {
          id: Date.now(),
          topic: topic,
          topicText: document.getElementById('topic').selectedOptions[0].text,
          description: description,
          contact: contact,
          date: new Date().toISOString(),
          status: 'open',
          messages: [
            {
              from: 'user',
              text: description,
              date: new Date().toISOString()
            },
            {
              from: 'support',
              text: 'Здравствуйте! Ваше обращение получено и зарегистрировано. Мы рассмотрим его в ближайшее время. Если у вас появятся дополнительные вопросы — пишите прямо сюда.',
              date: new Date().toISOString()
            }
          ]
        };

        tickets.push(newTicket);
        localStorage.setItem('mc_tickets', JSON.stringify(tickets));
        
        // Открываем чат с новым тикетом
        openTicketChat(tickets.length - 1);
      });
    }, 100);
  }

  // ====== ОТКРЫТЬ ЧАТ ТИКЕТА ======
  function openTicketChat(ticketIndex) {
    const ticket = tickets[ticketIndex];
    if (!ticket) return;
    
    function renderChat() {
      let messagesHtml = '';
      
      ticket.messages.forEach(msg => {
        const isUser = msg.from === 'user';
        const senderName = isUser ? (nickname || 'Гость') : 'Поддержка';
        const time = new Date(msg.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        messagesHtml += `
          <div class="chat-message ${isUser ? 'chat-user' : 'chat-support'}">
            <div class="chat-avatar">${isUser ? (nickname || 'Я')[0].toUpperCase() : 'S'}</div>
            <div class="chat-bubble">
              <div class="chat-sender">${senderName}</div>
              <div class="chat-text">${msg.text.replace(/\n/g, '<br>')}</div>
              <div class="chat-time">${time}</div>
            </div>
          </div>
        `;
      });

      const content = `
        <div class="chat-container">
          <div class="chat-header-info">
            <span class="chat-ticket-id">Тикет #${ticket.id}</span>
            <span class="ticket-status ticket-open">${ticket.status === 'open' ? 'Открыт' : 'Закрыт'}</span>
          </div>
          <div class="chat-messages" id="chat-messages">
            ${messagesHtml}
          </div>
          <div class="chat-input-area">
            <input type="text" class="chat-input" id="chat-input" placeholder="Введи сообщение..." maxlength="500">
            <button class="chat-send-btn" id="chat-send-btn">Отпр.</button>
          </div>
          <button class="btn-back-tickets" id="btn-back-tickets">← К списку обращений</button>
        </div>
      `;

      openModal('Чат поддержки', content);

      setTimeout(() => {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const btnBack = document.getElementById('btn-back-tickets');

        function sendMessage() {
          const text = chatInput.value.trim();
          if (!text) return;

          ticket.messages.push({
            from: 'user',
            text: text,
            date: new Date().toISOString()
          });

          // Автоответ поддержки
          setTimeout(() => {
            ticket.messages.push({
              from: 'support',
              text: 'Спасибо за дополнительную информацию! Мы приняли её к сведению и скоро ответим.',
              date: new Date().toISOString()
            });
            localStorage.setItem('mc_tickets', JSON.stringify(tickets));
            renderChat();
          }, 1500);

          localStorage.setItem('mc_tickets', JSON.stringify(tickets));
          renderChat();
        }

        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') sendMessage();
        });

        btnBack.addEventListener('click', () => {
          const myTickets = tickets.filter(t => t.contact === (nickname || 'Гость'));
          showTicketList();
        });
      }, 100);
    }

    renderChat();
  }

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
