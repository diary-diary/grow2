// Настройки сервера (замени на свои)
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565;

// Элементы статуса
const statusDiv = document.getElementById('server-status');
const playersDiv = document.getElementById('players-online');
const copyBtn = document.getElementById('copy-ip');
const ipText = document.getElementById('server-ip');

// Элементы профиля
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

// Демо-данные пользователя (localStorage)
let nickname = localStorage.getItem('mc_garden_nickname') || null;
let balance = parseInt(localStorage.getItem('mc_garden_balance') || '0');
let history = JSON.parse(localStorage.getItem('mc_garden_history') || '[]');

// Если нет ника — запрашиваем
if (!nickname) {
  nickname = prompt('Введи свой игровой никнейм:');
  if (!nickname) nickname = 'Садовод';
  localStorage.setItem('mc_garden_nickname', nickname);
}

// Инициализация интерфейса
function updateProfileUI() {
  nicknameDisplay.textContent = nickname;
  dropdownNickname.textContent = nickname;
  dropdownBalance.textContent = balance;

  // Случайная аватарка (можно заменить на фиксированную)
  const icons = ['🌱', '🌿', '🍃', '🌳', '🌸', '🌻', '🍄'];
  const icon = icons[nickname.length % icons.length];
  avatar.textContent = icon;
  dropdownAvatar.textContent = icon;

  // История покупок
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<li class="dimmed">Пока пусто</li>';
  } else {
    history.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = entry;
      li.style.fontSize = '0.45rem';
      li.style.marginBottom = '4px';
      historyList.appendChild(li);
    });
  }
}

// Пополнение баланса (демо)
topUpBtn.addEventListener('click', () => {
  balance += 100;
  localStorage.setItem('mc_garden_balance', balance);
  updateProfileUI();
});

// Выход
logoutBtn.addEventListener('click', () => {
  if (confirm('Выйти из аккаунта? Все локальные данные будут сброшены.')) {
    localStorage.removeItem('mc_garden_nickname');
    localStorage.removeItem('mc_garden_balance');
    localStorage.removeItem('mc_garden_history');
    nickname = 'Гость';
    balance = 0;
    history = [];
    updateProfileUI();
    profileDropdown.classList.add('hidden');
  }
});

// Открытие/закрытие меню профиля
profileArea.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
  updateProfileUI(); // актуализация при открытии
});

// Закрытие при клике вне
document.addEventListener('click', (e) => {
  if (!profileArea.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.add('hidden');
  }
});

// Первичное отображение
updateProfileUI();

// === Статус сервера ===
async function fetchServerStatus() {
  const url = `https://api.mcsrvstat.us/2/${SERVER_IP}:${SERVER_PORT}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
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
  } catch {
    statusDiv.className = 'status offline';
    statusDiv.textContent = '⚠️ Ошибка проверки';
    playersDiv.textContent = '';
  }
}

// Копирование IP
copyBtn.addEventListener('click', () => {
  const ip = ipText.textContent.trim();
  navigator.clipboard.writeText(ip).then(() => {
    copyBtn.textContent = '✅';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
  }).catch(() => alert('Не удалось скопировать'));
});

// Запуск
fetchServerStatus();
setInterval(fetchServerStatus, 60000);
