// =====================
// FIREBASE (опционально)
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyCrSDxKoRPtLkmIVgXhVLVp_vAdlggKOU0",
  authDomain: "grow-f9770.firebaseapp.com",
  projectId: "grow-f9770",
  storageBucket: "grow-f9770.firebasestorage.app",
  messagingSenderId: "953892412762",
  appId: "1:953892412762:web:6effb58aa6a21fff6d2763"
};

let db = null;
let auth = null;
let firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  firebaseReady = true;
} catch (e) {
  console.warn('Firebase не инициализирован, используем localStorage');
}

// =====================
// СЕРВЕР
// =====================
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565;

// =====================
// ЧАСТИЦЫ НА CANVAS (запускаем сразу)
// =====================
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  const particles = [];
  const emojis = ['🍃', '🌸', '✨', '🌱', '🦋', '💚', '🍀', '🌾', '🟢', '⭐'];
  
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.7,
      size: Math.random() * 14 + 6,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.2) * 0.4,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      opacity: Math.random() * 0.35 + 0.08,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.3
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      
      if (p.x < -60) p.x = canvas.width + 60;
      if (p.x > canvas.width + 60) p.x = -60;
      if (p.y < -60) p.y = canvas.height + 60;
      if (p.y > canvas.height * 0.75) p.y = -60;
      
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
})();

// =====================
// DOM (ждём загрузки)
// =====================
document.addEventListener('DOMContentLoaded', () => {
  
  const statusDiv = document.getElementById('server-status');
  const playersDiv = document.getElementById('players-online');
  const copyBtn = document.getElementById('copy-ip');
  const ipText = document.getElementById('server-ip');
  const profileArea = document.getElementById('profile-area');
  const profileDropdown = document.getElementById('profile-dropdown');
  const nicknameDisplay = document.getElementById('nickname-display');
  const dropdownNickname = document.getElementById('dropdown-nickname');
  const dropdownBalance = document.getElementById('dropdown-balance-value');
  const topUpBtn = document.getElementById('top-up-btn');
  const historyList = document.getElementById('history-list');
  const logoutBtn = document.getElementById('logout-btn');
  const avatar = document.getElementById('avatar');
  const dropdownAvatar = document.getElementById('dropdown-avatar');

  // =====================
  // ЛОКАЛЬНЫЕ ДАННЫЕ (работает всегда)
  // =====================
  let nickname = localStorage.getItem('mc_nickname') || '';
  let balance = parseInt(localStorage.getItem('mc_balance') || '0');
  let history = JSON.parse(localStorage.getItem('mc_history') || '[]');

  // =====================
  // БЫСТРАЯ ИНИЦИАЛИЗАЦИЯ
  // =====================
  function initProfile() {
    if (!nickname) {
      nickname = prompt('🎮 Введите ваш игровой никнейм:');
      if (!nickname || nickname.trim() === '') nickname = 'Садовод';
      localStorage.setItem('mc_nickname', nickname);
    }
    updateProfileUI();
    updateHistoryUI();
  }

  function updateProfileUI() {
    if (nicknameDisplay) nicknameDisplay.textContent = nickname;
    if (dropdownNickname) dropdownNickname.textContent = nickname;
    if (dropdownBalance) dropdownBalance.textContent = balance;
    
    const icons = ['🌱','🌿','🍃','🌳','🌸','🌻','🍄','🌾','🌷','🪴'];
    const icon = icons[nickname.length % icons.length];
    if (avatar) avatar.textContent = icon;
    if (dropdownAvatar) dropdownAvatar.textContent = icon;
  }

  function updateHistoryUI() {
    if (!historyList) return;
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      historyList.innerHTML = '<li class="dimmed">Пока пусто</li>';
      return;
    }
    
    history.slice(-10).reverse().forEach(entry => {
      const li = document.createElement('li');
      li.style.cssText = 'font-size:0.42rem;margin-bottom:4px;color:#CCC;';
      li.textContent = `${entry.date}: 💎 ${entry.type} — +${entry.amount} монет`;
      historyList.appendChild(li);
    });
  }

  // =====================
  // ПОПОЛНЕНИЕ
  // =====================
  if (topUpBtn) {
    topUpBtn.addEventListener('click', () => {
      const amount = parseInt(prompt('💰 Сумма пополнения (монет):', '100'));
      if (!amount || amount <= 0) return alert('❌ Неверная сумма!');
      
      balance += amount;
      localStorage.setItem('mc_balance', balance);
      
      history.push({
        date: new Date().toLocaleDateString('ru-RU'),
        type: 'Пополнение',
        amount: amount
      });
      localStorage.setItem('mc_history', JSON.stringify(history));
      
      updateProfileUI();
      updateHistoryUI();
      alert(`✅ Баланс пополнен на ${amount} монет!`);
    });
  }

  // =====================
  // ВЫХОД
  // =====================
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('🚪 Выйти из аккаунта? Все данные будут сброшены.')) {
        localStorage.removeItem('mc_nickname');
        localStorage.removeItem('mc_balance');
        localStorage.removeItem('mc_history');
        nickname = '';
        balance = 0;
        history = [];
        profileDropdown.classList.add('hidden');
        nickname = prompt('🎮 Введите ваш игровой никнейм:') || 'Садовод';
        localStorage.setItem('mc_nickname', nickname);
        updateProfileUI();
        updateHistoryUI();
      }
    });
  }

  // =====================
  // UI ПРОФИЛЯ
  // =====================
  if (profileArea && profileDropdown) {
    profileArea.addEventListener('click', e => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
      if (!profileDropdown.classList.contains('hidden')) {
        updateProfileUI();
        updateHistoryUI();
      }
    });
    
    document.addEventListener('click', e => {
      if (!profileArea.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }

  // =====================
  // СТАТУС СЕРВЕРА
  // =====================
  async function fetchServerStatus() {
    if (!statusDiv) return;
    
    try {
      const res = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}:${SERVER_PORT}`);
      const data = await res.json();
      
      if (data.online) {
        statusDiv.className = 'status online';
        statusDiv.innerHTML = '<span class="status-dot"></span> 🟢 Сервер онлайн';
        if (playersDiv && data.players) {
          playersDiv.textContent = `👥 ${data.players.online}/${data.players.max}`;
        }
      } else {
        statusDiv.className = 'status offline';
        statusDiv.innerHTML = '<span class="status-dot"></span> 🔴 Сервер оффлайн';
        if (playersDiv) playersDiv.textContent = '';
      }
    } catch {
      statusDiv.className = 'status offline';
      statusDiv.innerHTML = '<span class="status-dot"></span> ⚠️ Ошибка проверки';
      if (playersDiv) playersDiv.textContent = '';
    }
  }

  fetchServerStatus();
  setInterval(fetchServerStatus, 60000);

  // =====================
  // КОПИРОВАНИЕ IP
  // =====================
  if (copyBtn && ipText) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(ipText.textContent.trim()).then(() => {
        copyBtn.innerHTML = '✅ <span>Скопировано!</span>';
        setTimeout(() => copyBtn.innerHTML = '📋 <span>Копировать</span>', 1500);
      }).catch(() => alert('Не удалось скопировать'));
    });
  }

  // =====================
  // ЗАПУСК
  // =====================
  initProfile();

  // Если Firebase работает — подгружаем данные оттуда
  if (firebaseReady && auth && db) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const doc = await db.collection('users').doc(user.uid).get();
          if (doc.exists) {
            const data = doc.data();
            if (data.nickname) {
              nickname = data.nickname;
              localStorage.setItem('mc_nickname', nickname);
            }
            if (data.balance !== undefined) {
              balance = data.balance;
              localStorage.setItem('mc_balance', balance);
            }
            updateProfileUI();
          }
        } catch(e) {
          console.log('Firebase загружен, но данные из localStorage');
        }
      } else {
        auth.signInAnonymically().catch(() => {});
      }
    });
  }
});
