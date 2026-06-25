// IP и порт сервера
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565;

// Элементы
const statusDiv = document.getElementById('server-status');
const playersDiv = document.getElementById('players-online');
const copyBtn = document.getElementById('copy-ip');
const ipText = document.getElementById('server-ip');

// Профиль
const profileIcon = document.getElementById('profile-icon');
const profileDropdown = document.getElementById('profile-dropdown');
const nicknameDisplay = document.getElementById('nickname-display');
const dropdownNickname = document.getElementById('dropdown-nickname');
const dropdownBalance = document.getElementById('dropdown-balance');
const topUpBtn = document.getElementById('top-up-btn');
const historyList = document.getElementById('history-list');
const logoutBtn = document.getElementById('logout-btn');

// === Управление профилем (демо) ===
let nickname = localStorage.getItem('mc_nickname') || null;
let balance = parseInt(localStorage.getItem('mc_balance') || '0');
let purchaseHistory = JSON.parse(localStorage.getItem('mc_history') || '[]');

// Если нет ника, запросим при загрузке
if (!nickname) {
  nickname = prompt('Введите ваш игровой никнейм:');
  if (!nickname) nickname = 'Гость';
  localStorage.setItem('mc_nickname', nickname);
}

// Отображаем ник в шапке
nicknameDisplay.textContent = nickname;
dropdownNickname.textContent = nickname;

// Функция обновления интерфейса профиля
function updateProfileUI() {
  dropdownBalance.textContent = `${balance} монет`;
  // История
  historyList.innerHTML = '';
  if (purchaseHistory.length === 0) {
    historyList.innerHTML = '<li class="empty-history">Пока пусто</li>';
  } else {
    purchaseHistory.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      li.style.fontSize = '0.5rem';
      li.style.marginBottom = '4px';
      historyList.appendChild(li);
    });
  }
}

// Пополнение баланса
topUpBtn.addEventListener('click', () => {
  balance += 100;
  localStorage.setItem('mc_balance', balance);
  updateProfileUI();
});

// Выход (сброс данных)
logoutBtn.addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите выйти? Все локальные данные будут сброшены.')) {
    localStorage.removeItem('mc_nickname');
    localStorage.removeItem('mc_balance');
    localStorage.removeItem('mc_history');
    balance = 0;
    purchaseHistory = [];
    nickname = 'Гость';
    nicknameDisplay.textContent = 'Гость';
    dropdownNickname.textContent = 'Гость';
    updateProfileUI();
    profileDropdown.classList.add('hidden');
  }
});

// Открытие/закрытие выпадающего меню
profileIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
  updateProfileUI(); // обновляем при открытии
});

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
  if (!profileIcon.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.add('hidden');
  }
});

// Инициализация отображения
updateProfileUI();

// === Статус сервера ===
async function fetchServerStatus() {
  const url = `https://api.mcsrvstat.us/2/${SERVER_IP}:${SERVER_PORT}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.online) {
      statusDiv.className = 'status online';
      statusDiv.textContent = '🟢 Сервер онлайн';
      if (data.players) {
        playersDiv.textContent = `Игроков онлайн: ${data.players.online} / ${data.players.max}`;
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
    statusDiv.textContent = '⚠️ Не удалось проверить статус';
    playersDiv.textContent = '';
  }
}

// Копирование IP
copyBtn.addEventListener('click', () => {
  const ip = ipText.textContent.trim();
  navigator.clipboard.writeText(ip).then(() => {
    copyBtn.textContent = '✅';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
  }).catch(() => {
    alert('Не удалось скопировать IP');
  });
});

// Запуск проверки статуса
fetchServerStatus();
setInterval(fetchServerStatus, 60000);
