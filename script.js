// Замени на реальный IP и порт своего сервера
const SERVER_IP = 'play.growagarden.ru';
const SERVER_PORT = 25565; // стандартный порт Java Edition

const statusDiv = document.getElementById('server-status');
const playersDiv = document.getElementById('players-online');
const copyBtn = document.getElementById('copy-ip');
const ipText = document.getElementById('server-ip');

// Функция получения статуса через API mcsrvstat.us
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

// Копирование IP в буфер обмена
copyBtn.addEventListener('click', () => {
  const ip = ipText.textContent.trim();
  navigator.clipboard.writeText(ip).then(() => {
    copyBtn.textContent = '✅';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
  }).catch(() => {
    alert('Не удалось скопировать IP');
  });
});

// Загружаем статус при открытии и обновляем каждые 60 секунд
fetchServerStatus();
setInterval(fetchServerStatus, 60000);