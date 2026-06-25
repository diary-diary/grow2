// =====================
// КОНФИГУРАЦИЯ FIREBASE
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

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// =====================
// НАСТРОЙКИ СЕРВЕРА
// =====================
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565;

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
// ПЕРЕМЕННЫЕ
// =====================
let currentUser = null;
let userNickname = '';

// =====================
// АУТЕНТИФИКАЦИЯ
// =====================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    console.log('✅ Пользователь авторизован:', user.uid);
    
    // Загружаем профиль из Firestore через Cloud Function
    const profile = await getProfile();
    userNickname = profile.nickname || '';
    
    if (!userNickname) {
      userNickname = prompt('🎮 Введите ваш игровой никнейм:');
      if (!userNickname || userNickname.trim() === '') {
        userNickname = 'Садовод';
      }
      // Сохраняем никнейм в Firestore
      await saveNickname(userNickname);
    }
    
    updateProfileUI(profile);
    loadTransactionHistory();
  } else {
    console.log('🔑 Выполняю анонимный вход...');
    auth.signInAnonymically().catch(error => {
      console.error('❌ Ошибка анонимного входа:', error);
    });
  }
});

// =====================
// ФУНКЦИИ ПРОФИЛЯ
// =====================

// Получение профиля из Firestore
async function getProfile() {
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      // Создаём документ пользователя
      const defaultProfile = {
        nickname: '',
        balance: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(currentUser.uid).set(defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки профиля:', error);
    return { nickname: 'Ошибка', balance: 0 };
  }
}

// Сохранение никнейма
async function saveNickname(nickname) {
  try {
    await db.collection('users').doc(currentUser.uid).update({
      nickname: nickname
    });
    console.log('✅ Никнейм сохранён:', nickname);
  } catch (error) {
    console.error('❌ Ошибка сохранения никнейма:', error);
  }
}

// Обновление интерфейса профиля
function updateProfileUI(profile) {
  const nickname = profile.nickname || userNickname || 'Садовод';
  const balance = profile.balance || 0;

  nicknameDisplay.textContent = nickname;
  dropdownNickname.textContent = nickname;
  dropdownBalance.textContent = balance;

  // Аватарка на основе никнейма
  const gardenIcons = ['🌱', '🌿', '🍃', '🌳', '🌸', '🌻', '🍄', '🌾', '🌷', '🪴'];
  const iconIndex = nickname.length % gardenIcons.length;
  const icon = gardenIcons[iconIndex];
  
  avatar.textContent = icon;
  dropdownAvatar.textContent = icon;
}

// =====================
// ПОПОЛНЕНИЕ БАЛАНСА
// =====================
topUpBtn.addEventListener('click', async () => {
  if (!currentUser) {
    alert('❌ Вы не авторизованы!');
    return;
  }

  const amount = parseInt(prompt('💰 Введите сумму пополнения (монет):', '100'));
  if (!amount || amount <= 0) {
    alert('❌ Введите корректную сумму!');
    return;
  }

  try {
    topUpBtn.textContent = '⏳ Загрузка...';
    topUpBtn.disabled = true;

    // Обновляем баланс в Firestore
    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    const currentBalance = userDoc.data()?.balance || 0;

    await userRef.update({
      balance: firebase.firestore.FieldValue.increment(amount)
    });

    // Добавляем запись в историю транзакций
    await db.collection('transactions').add({
      userId: currentUser.uid,
      amount: amount,
      type: 'deposit',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Обновляем отображение
    const newBalance = currentBalance + amount;
    dropdownBalance.textContent = newBalance;
    loadTransactionHistory();

    alert(`✅ Баланс пополнен на ${amount} монет!`);
  } catch (error) {
    console.error('❌ Ошибка пополнения:', error);
    alert('❌ Ошибка пополнения: ' + error.message);
  } finally {
    topUpBtn.textContent = 'Пополнить +100';
    topUpBtn.disabled = false;
  }
});

// =====================
// ИСТОРИЯ ТРАНЗАКЦИЙ
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
      li.style.fontSize = '0.45rem';
      li.style.marginBottom = '4px';
      li.style.color = '#ddd';
      
      const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString('ru-RU') : '—';
      const type = data.type === 'deposit' ? '💎 Пополнение' : '🛒 Покупка';
      
      li.textContent = `${date}: ${type} — +${data.amount} монет`;
      historyList.appendChild(li);
    });
  } catch (error) {
    console.error('❌ Ошибка загрузки истории:', error);
    historyList.innerHTML = '<li class="dimmed">Ошибка загрузки</li>';
  }
}

// =====================
// ВЫХОД
// =====================
logoutBtn.addEventListener('click', async () => {
  if (confirm('🚪 Вы уверены, что хотите выйти?')) {
    try {
      await auth.signOut();
      profileDropdown.classList.add('hidden');
      // После выхода auth.onAuthStateChanged снова вызовет анонимный вход
    } catch (error) {
      console.error('❌ Ошибка выхода:', error);
    }
  }
});

// =====================
// ИНТЕРФЕЙС ПРОФИЛЯ
// =====================
profileArea.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
  // Обновляем историю при открытии
  if (!profileDropdown.classList.contains('hidden')) {
    loadTransactionHistory();
  }
});

// Закрытие по клику вне
document.addEventListener('click', (e) => {
  if (!profileArea.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.add('hidden');
  }
});

// =====================
// СТАТУС СЕРВЕРА
// =====================
async function fetchServerStatus() {
  const url = `https://api.mcsrvstat.us/2/${SERVER_IP}:${SERVER_PORT}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.online) {
      statusDiv.className = 'status online';
      statusDiv.textContent = '🟢 Сервер онлайн';
      if (data.players) {
        playersDiv.textContent = `Игроков: ${data.players.online} / ${data.players.max}`;
      } else {
        playersDiv.textContent = '';
      }
    } else {
      statusDiv.className = 'status offline';
      statusDiv.textContent = '🔴 Сервер оффлайн';
      playersDiv.textContent = '';
    }
  } catch (error) {
    statusDiv.className = 'status offline';
    statusDiv.textContent = '⚠️ Ошибка проверки';
    playersDiv.textContent = '';
  }
}

// Первая проверка и интервал
fetchServerStatus();
setInterval(fetchServerStatus, 60000);

// =====================
// КОПИРОВАНИЕ IP
// =====================
copyBtn.addEventListener('click', () => {
  const ip = ipText.textContent.trim();
  navigator.clipboard.writeText(ip).then(() => {
    copyBtn.textContent = '✅';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
  }).catch(() => {
    alert('Не удалось скопировать IP');
  });
});

console.log('🌱 Grow-a-Garden Market — готов к работе!');
