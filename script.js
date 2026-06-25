// =====================
// FIREBASE
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyCrSDxKoRPtLkmIVgXhVLVp_vAdlggKOU0",
  authDomain: "grow-f9770.firebaseapp.com",
  projectId: "grow-f9770",
  storageBucket: "grow-f9770.firebasestorage.app",
  messagingSenderId: "953892412762",
  appId: "1:953892412762:web:6effb58aa6a21fff6d2763"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =====================
// СЕРВЕР
// =====================
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565;

// =====================
// ЧАСТИЦЫ НА CANVAS
// =====================
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
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
// DOM
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
    auth.signInAnonymically().catch(err => console.error('Auth:', err));
  }
});

// =====================
// ПРОФИЛЬ
// =====================
async function getProfile() {
  try {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) return doc.data();
    
    const def = { nickname: '', balance: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    await db.collection('users').doc(currentUser.uid).set(def);
    return def;
  } catch (e) {
    console.error(e);
    return { nickname: 'Ошибка', balance: 0 };
  }
}

async function saveNickname(nick) {
  try { await db.collection('users').doc(currentUser.uid).update({ nickname: nick }); } catch(e) {}
}

function updateProfileUI(p) {
  const nick = p.nickname || userNickname || 'Садовод';
  const bal = p.balance || 0;
  
  nicknameDisplay.textContent = nick;
  dropdownNickname.textContent = nick;
  dropdownBalance.textContent = bal;
  
  const icons = ['🌱','🌿','🍃','🌳','🌸','🌻','🍄','🌾','🌷','🪴'];
  const icon = icons[nick.length % icons.length];
  avatar.textContent = icon;
  dropdownAvatar.textContent = icon;
}

// =====================
// ПОПОЛНЕНИЕ
// =====================
topUpBtn.addEventListener('click', async () => {
  if (!currentUser) return alert('❌ Вы не авторизованы!');
  
  const amount = parseInt(prompt('💰 Сумма пополнения (монет):', '100'));
  if (!amount || amount <= 0) return alert('❌ Неверная сумма!');
  
  try {
    topUpBtn.textContent = '⏳...';
    topUpBtn.disabled = true;
    
    const ref = db.collection('users').doc(currentUser.uid);
    const doc = await ref.get();
    const cur = doc.data()?.balance || 0;
    
    await ref.update({ balance: firebase.firestore.FieldValue.increment(amount) });
    await db.collection('transactions').add({
      userId: currentUser.uid,
      amount,
      type: 'deposit',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    dropdownBalance.textContent = cur + amount;
    loadTransactionHistory();
    alert(`✅ +${amount} монет!`);
  } catch(e) {
    alert('❌ Ошибка:
