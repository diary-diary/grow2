// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', () => {

  // ========== ЭЛЕМЕНТЫ ==========
  const serverIp = document.getElementById('server-ip');
  const copyBtn = document.getElementById('copy-ip');
  const statusBadge = document.getElementById('server-status');
  const playersEl = document.getElementById('players-online');

  const profileCard = document.getElementById('profile-card');
  const profileTop = document.getElementById('profile-top');
  const profileExpand = document.getElementById('profile-expand');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileBalance = document.getElementById('profile-balance');

  const depositBtn = document.getElementById('deposit-btn');
  const historyBox = document.getElementById('history-box');
  const promoInput = document.getElementById('promo-input');
  const promoBtn = document.getElementById('promo-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // ========== ДАННЫЕ ==========
  let nickname = localStorage.getItem('mc_nick') || '';
  let balance = parseInt(localStorage.getItem('mc_bal') || '0');
  let history = JSON.parse(localStorage.getItem('mc_hist') || '[]');

  // ========== ИНИЦИАЛИЗАЦИЯ ==========
  function init() {
    if (!nickname) {
      nickname = prompt('🎮 Введите ваш никнейм:');
      if (!nickname || !nickname.trim()) nickname = 'Садовод';
      localStorage.setItem('mc_nick', nickname);
    }
    renderProfile();
    renderHistory();
  }

  // ========== ОТРИСОВКА ПРОФИЛЯ ==========
  function renderProfile() {
    profileName.textContent = nickname;
    profileBalance.textContent = balance.toLocaleString();
    
    const icons = ['🌱','🌿','🍃','🌳','🌸','🌻','🍄','🌾','🌷','🪴'];
    const icon = icons[nickname.length % icons.length];
    profileAvatar.textContent = icon;
  }

  // ========== ИСТОРИЯ ==========
  function renderHistory() {
    historyBox.innerHTML = '';
    if (history.length === 0) {
      historyBox.innerHTML = '<p class="empty-text">Пока пусто</p>';
      return;
    }
    const recent = history.slice(-8).reverse();
    recent.forEach(h => {
      const div = document.createElement('div');
      div.style.cssText = 'font-size:0.42rem;color:#ccc;margin-bottom:4px;';
      div.textContent = `${h.date}: 💎 +${h.amount} монет`;
      historyBox.appendChild(div);
    });
  }

  // ========== ПОПОЛНЕНИЕ ==========
  depositBtn.addEventListener('click', () => {
    const amount = parseInt(prompt('💰 Сумма пополнения (монет):', '100'));
    if (!amount || amount <= 0) return;

    balance += amount;
    localStorage.setItem('mc_bal', balance);
    
    history.push({
      date: new Date().toLocaleDateString('ru-RU'),
      amount: amount
    });
    localStorage.setItem('mc_hist', JSON.stringify(history));

    renderProfile();
    renderHistory();
    alert(`✅ Пополнено на ${amount} монет!`);
  });

  // ========== ПРОМОКОД ==========
  promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) return alert('Введите промокод!');
    
    // Демо-промокоды
    if (code === 'GARDEN') {
      balance += 500;
      localStorage.setItem('mc_bal', balance);
      history.push({ date: new Date().toLocaleDateString('ru-RU'), amount: 500 });
      localStorage.setItem('mc_hist', JSON.stringify(history));
      renderProfile();
      renderHistory();
      alert('🎉 Промокод активирован! +500 монет!');
    } else if (code === 'BLOOM') {
      balance += 200;
      localStorage.setItem('mc_bal', balance);
      history.push({ date: new Date().toLocaleDateString('ru-RU'), amount: 200 });
      localStorage.setItem('mc_hist', JSON.stringify(history));
      renderProfile();
      renderHistory();
      alert('🌸 Промокод активирован! +200 монет!');
    } else {
      alert('❌ Неверный промокод');
    }
    promoInput.value = '';
  });

  // ========== ВЫХОД ==========
  logoutBtn.addEventListener('click', () => {
    if (confirm('🚪 Выйти? Данные будут сброшены.')) {
      localStorage.clear();
      nickname = '';
      balance = 0;
      history = [];
      profileExpand.classList.add('hidden');
      profileTop.classList.remove('open');
      init();
    }
  });

  // ========== РАСКРЫТИЕ ПРОФИЛЯ ==========
  profileTop.addEventListener('click', () => {
    profileExpand.classList.toggle('hidden');
    profileTop.classList.toggle('open');
    if (!profileExpand.classList.contains('hidden')) {
      renderHistory();
    }
  });

  // ========== СТАТУС СЕРВЕРА ==========
  async function checkStatus() {
    try {
      const res = await fetch('https://api.mcsrvstat.us/2/play.growagarden.ru:25565');
      const data = await res.json();
      if (data.online) {
        statusBadge.className = 'status-badge online';
        statusBadge.innerHTML = '<span class="dot"></span> 🟢 Онлайн';
        playersEl.textContent = data.players ? `👥 ${data.players.online}/${data.players.max}` : '';
      } else {
        statusBadge.className = 'status-badge offline';
        statusBadge.innerHTML = '<span class="dot"></span> 🔴 Оффлайн';
        playersEl.textContent = '';
      }
    } catch {
      statusBadge.className = 'status-badge offline';
      statusBadge.innerHTML = '<span class="dot"></span> ⚠️ Ошибка';
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000);

  // ========== КОПИРОВАНИЕ IP ==========
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(serverIp.textContent.trim()).then(() => {
      copyBtn.textContent = '✅ Скопировано!';
      setTimeout(() => copyBtn.textContent = '📋 Копировать', 1500);
    });
  });

  // ========== ЗАПУСК ==========
  init();
});
