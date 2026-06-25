// =====================
// КОНФИГУРАЦИЯ FIREBASE (ТВОЯ)
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyCrSDxKoRPtLkmIVgXhVLVp_vAdlggKOU0",
  authDomain: "grow-f9770.firebaseapp.com",
  projectId: "grow-f9770",
  storageBucket: "grow-f9770.firebasestorage.app",
  messagingSenderId: "953892412762",
  appId: "1:953892412762:web:6effb58aa6a21fff6d2763",
  measurementId: "G-DSKCLM3PCT"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =====================
// НАСТРОЙКИ СЕРВЕРА
// =====================
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565;

// =====================
// ФОНОВЫЙ CANVAS С ЧАСТИЦАМИ
// =====================
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  // Частицы: листочки, семена, искры
  const particles = [];
  const particleCount = 50;
  
  const emojis = ['🌱', '🍃', '✨', '🌸', '💚', '🟢', '⭐', '🌿'];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 16 + 8,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      opacity: Math.random() * 0.3 + 0.05,
      rotation: Math.random() * 360
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем тёмные пиксельные блоки (как земля)
    ctx.fillStyle = 'rgba(20, 15, 10, 0.3)';
    const blockSize = 32;
    for (let x = 0; x < canvas.width; x += blockSize) {
      for (let y = 0; y < canvas.height; y += blockSize) {
        if (Math.random() < 0.03) {
          ctx.fillStyle = `rgba(${30 + Math.random()*20}, ${15 + Math.random()*10}, ${5 + Math.random()*10}, 0.2)`;
          ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
        }
      }
    }
    
    // Обновляем и рисуем частицы
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += 0.2;
      
      // Зацикливание
      if (p.x < -50) p.x = canvas.width + 50;
      if (p.x > canvas.width + 50) p.x = -50;
      if (p.y < -50) p.y = canvas.height + 50;
      if (p.y > canvas.height + 50) p.y = -50;
      
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
// DOM-ЭЛЕМЕНТЫ
// =====================
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
// СОСТОЯНИЕ
// =====================
let currentUser = null;
let userNickname = '';

// =====================
// АУТЕНТИФИКАЦИЯ
// =====================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const profile = await getProfile();
    userNickname = profile.nickname || '';
    
    if (!userNickname) {
      userNickname = prompt('🎮 Введите ваш игровой никнейм:') || 'Садовод';
      await saveNickname(userNickname);
    }
    
    updateProfileUI(profile);
    loadTransactionHistory();
  } else {
    auth.signInAnonymically().catch(err => console.error('Auth error:', err));
  }
});

// =====================
// ПРОФИЛЬ
// =====================
async function getProfile() {
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) return userDoc.data();
    
    const defaultProfile = {
      nickname: '',
      balance: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(currentUser.uid).set(defaultProfile);
    return defaultProfile;
  } catch (err) {
    console.error('❌ Ошибка профиля:', err);
    return { nickname: 'Ошибка', balance: 0 };
  }
}

async function saveNickname(nickname) {
  try {
    await db.collection('users').doc(currentUser.uid).update({ nickname });
  } catch (err) {
    console.error('❌ Ошибка сохранения ника:', err);
  }
}

function updateProfileUI(profile) {
  const nickname = profile.nickname || userNickname || 'Садовод';
  const balance = profile.balance || 0;
  
  nicknameDisplay.textContent = nickname;
  dropdownNickname.textContent = nickname;
  dropdownBalance.textContent = balance;
  
  const icons = ['🌱', '🌿', '🍃', '🌳', '🌸', '🌻', '🍄', '🌾', '🌷', '🪴'];
  const icon = icons[nickname.length % icons.length];
  avatar.textContent = icon;
  dropdownAvatar.textContent = icon;
}

// =====================
// ПОПОЛНЕНИЕ
// =====================
topUpBtn.addEventListener('click', async () => {
  if (!currentUser) return alert('❌ Вы не авторизованы!');
  
  const amount = parseInt(prompt('💰 Введите сумму пополнения (монет):', '100'));
  if (!amount || amount <= 0) return alert('❌ Введите корректную сумму!');
  
  try {
    topUpBtn.textContent = '⏳...';
    topUpBtn.disabled = true;
    
    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    const currentBalance = userDoc.data()?.balance || 0;
    
    await userRef.update({
      balance: firebase.firestore.FieldValue.increment(amount)
    });
    
    await db.collection('transactions').add({
      userId: currentUser.uid,
      amount,
      type: 'deposit',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    dropdownBalance.textContent = currentBalance + amount;
    loadTransactionHistory();
    alert(`✅ Баланс пополнен на ${amount} монет!`);
  } catch (err) {
    console.error('❌ Ошибка пополнения:', err);
    alert('❌ Ошибка пополнения: ' + err.message);
  } finally {
    topUpBtn.textContent = 'Пополнить +100';
    topUpBtn.disabled = false;
  }
});

// =====================
// ИСТОРИЯ
// =====================
async function loadTransactionHistory() {
  if (!currentUser) return;
  
  try {
    const snapshot = await db.collection('transactions')
      .where('userId', '==', currentUser.uid)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    historyList.innerHTML = '';
    
    if (snapshot.empty) {
      historyList.innerHTML = '<li class="dimmed">Пока пусто</li>';
      return;
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.style.cssText = 'font-size:0.45rem;margin-bottom:4px;color:#ddd;';
      
      const date = data.timestamp 
        ? new Date(data.timestamp.toDate()).toLocaleDateString('ru-RU') 
        : '—';
      const type = data.type === 'deposit' ? '💎 Пополнение' : '🛒 Покупка';
      
      li.textContent = `${date}: ${type} — +${data.amount} монет`;
      historyList.appendChild(li);
    });
  } catch (err) {
    console.error('❌ Ошибка истории:', err);
    historyList.innerHTML = '<li class="dimmed">Ошибка загрузки</li>';
  }
}

// =====================
// ВЫХОД
// =====================
logoutBtn.addEventListener('click', async () => {
  if (confirm('🚪 Вы уверены, что хотите выйти?')) {
    await auth.signOut();
    profileDropdown.classList.add('hidden');
  }
});

// =====================
// ИНТЕРФЕЙС ПРОФИЛЯ
// =====================
profileArea.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
  if (!profileDropdown.classList.contains('hidden')) {
    loadTransactionHistory();
  }
});

document.addEventListener('click', (e) => {
  if (!profileArea.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.add('hidden');
  }
});

// =====================
// СТАТУС СЕРВЕРА
// =====================
async function fetchServerStatus() {
  try {
    const url = `https://api.mcsrvstat.us/2/${SERVER_IP}:${SERVER_PORT}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.online) {
      statusDiv.className = 'status online';
      statusDiv.textContent = '🟢 Сервер онлайн';
      playersDiv.textContent = data.players 
        ? `Игроков: ${data.players.online} / ${data.players.max}` 
        : '';
    } else {
      statusDiv.className = 'status offline';
      statusDiv.textContent = '🔴 Сервер оффлайн';
      playersDiv.textContent = '';
    }
  } catch {
    statusDiv.className = 'status offline';
    statusDiv.textContent = '⚠️ Ошибка проверки';
    playersDiv.textContent = '';
  }
}

fetchServerStatus();
setInterval(fetchServerStatus, 60000);

// =====================
// КОПИРОВАНИЕ IP
// =====================
copyBtn.addEventListener('click', () => {
  const ip = ipText.textContent.trim();
  navigator.clipboard.writeText(ip).then(() => {
    copyBtn.textContent = '✅';
    setTimeout(() => (copyBtn.textContent = '📋'), 1500);
  }).catch(() => alert('Не удалось скопировать IP'));
});
