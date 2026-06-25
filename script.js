document.addEventListener('DOMContentLoaded', () => {

  // ====== ЭЛЕМЕНТЫ ======
  const $ = id => document.getElementById(id);
  
  const serverIp = $('server-ip');
  const copyBtn = $('copy-ip');
  const statusEl = $('server-status');
  const playersEl = $('players-count');

  const profileBar = $('profile-bar');
  const profileBody = $('profile-body');
  const avatarEl = $('avatar');
  const nicknameEl = $('nickname');
  const balanceEl = $('balance');
  const arrowEl = $('arrow');

  const nickInput = $('nick-input');
  const saveNickBtn = $('save-nick');
  const depositAmount = $('deposit-amount');
  const depositBtn = $('deposit-btn');
  const quickBtns = document.querySelectorAll('.quick-amounts button');
  const historyList = $('history-list');
  const promoInput = $('promo-input');
  const promoBtn = $('promo-btn');
  const promoMsg = $('promo-msg');
  const logoutBtn = $('logout-btn');

  // ====== ДАННЫЕ ======
  let nickname = localStorage.getItem('mc_nick') || '';
  let balance = parseInt(localStorage.getItem('mc_bal') || '0');
  let history = JSON.parse(localStorage.getItem('mc_hist') || '[]');

  // ====== АВАТАРКИ ======
  const avatars = ['🌱','🌿','🍃','🌳','🌸','🌻','🍄','🌾','🌷','🪴'];
  function getAvatar(name) {
    return avatars[name.length % avatars.length];
  }

  // ====== ОТРИСОВКА ======
  function renderAll() {
    nicknameEl.textContent = nickname || 'Гость';
    balanceEl.textContent = balance.toLocaleString();
    avatarEl.textContent = getAvatar(nickname || 'Гость');
    nickInput.value = nickname;
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyList.innerHTML = '<span class="empty">Пока пусто</span>';
      return;
    }
    history.slice(-8).reverse().forEach(h => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.textContent = `${h.date}: +${h.amount} монет`;
      historyList.appendChild(div);
    });
  }

  function saveData() {
    localStorage.setItem('mc_nick', nickname);
    localStorage.setItem('mc_bal', balance);
    localStorage.setItem('mc_hist', JSON.stringify(history));
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
    saveData();
    renderAll();
  });

  nickInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveNickBtn.click();
  });

  // ====== ПОПОЛНЕНИЕ ======
  function addBalance(amount) {
    balance += amount;
    history.push({
      date: new Date().toLocaleDateString('ru-RU'),
      amount: amount
    });
    saveData();
    renderAll();
    depositAmount.value = '';
    // Подсветка баланса
    balanceEl.style.color = '#d0ff80';
    setTimeout(() => balanceEl.style.color = '#80c060', 800);
  }

  depositBtn.addEventListener('click', () => {
    const amount = parseInt(depositAmount.value);
    if (!amount || amount <= 0) {
      depositAmount.style.borderColor = '#803030';
      setTimeout(() => depositAmount.style.borderColor = '#3a5020', 1500);
      return;
    }
    addBalance(amount);
  });

  depositAmount.addEventListener('keydown', e => {
    if (e.key === 'Enter') depositBtn.click();
  });

  // Быстрые суммы
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      addBalance(parseInt(btn.dataset.amount));
    });
  });

  // ====== ПРОМОКОД ======
  const promoCodes = {
    'GARDEN': 500,
    'BLOOM': 300,
    'GROW': 200,
    'SEED': 100
  };

  promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) {
      showPromoMsg('Введи код', 'error');
      return;
    }
    if (promoCodes[code]) {
      addBalance(promoCodes[code]);
      showPromoMsg(`+${promoCodes[code]} монет!`, 'success');
    } else {
      showPromoMsg('Неверный код', 'error');
    }
    promoInput.value = '';
  });

  promoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') promoBtn.click();
  });

  function showPromoMsg(text, type) {
    promoMsg.textContent = text;
    promoMsg.className = 'promo-msg ' + type;
    setTimeout(() => { promoMsg.textContent = ''; promoMsg.className = 'promo-msg'; }, 2500);
  }

  // ====== ВЫХОД ======
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    nickname = '';
    balance = 0;
    history = [];
    profileBody.classList.add('hidden');
    profileBar.classList.remove('open');
    renderAll();
  });

  // ====== РАСКРЫТИЕ ПРОФИЛЯ ======
  profileBar.addEventListener('click', () => {
    profileBody.classList.toggle('hidden');
    profileBar.classList.toggle('open');
    if (!profileBody.classList.contains('hidden')) {
      renderAll();
    }
  });

  // ====== СТАТУС СЕРВЕРА ======
  async function checkStatus() {
    try {
      const res = await fetch('https://api.mcsrvstat.us/2/play.growagarden.ru:25565');
      const data = await res.json();
      if (data.online) {
        statusEl.className = 'status online';
        statusEl.textContent = '● онлайн';
        playersEl.textContent = data.players ? `игроков ${data.players.online}/${data.players.max}` : '';
      } else {
        statusEl.className = 'status offline';
        statusEl.textContent = '● оффлайн';
        playersEl.textContent = '';
      }
    } catch {
      statusEl.className = 'status offline';
      statusEl.textContent = '● нет связи';
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000);

  // ====== КОПИРОВАНИЕ IP ======
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(serverIp.textContent.trim()).then(() => {
      copyBtn.textContent = '✓';
      setTimeout(() => copyBtn.textContent = '📋', 1200);
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
    for (let i = 0; i < 30; i++) {
      flies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }

    function animate(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      flies.forEach(f => {
        f.x += f.vx + Math.sin(t/3000 + f.phase) * 0.3;
        f.y += f.vy + Math.cos(t/2500 + f.phase) * 0.3;
        
        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;
        if (f.y < 0) f.y = canvas.height;
        if (f.y > canvas.height) f.y = 0;
        
        const alpha = 0.3 + Math.sin(t/800 + f.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 100, ${alpha})`;
        ctx.fill();
        ctx.shadowColor = 'rgba(150, 255, 80, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
  })();

  // ====== ПЕРВИЧНАЯ ОТРИСОВКА ======
  renderAll();
});
