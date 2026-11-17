'use strict';
require('dotenv').config();
const app = require('./app');
const { connectDb } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Сначала подключаемся к базе данных, затем принимаем запросы
connectDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Не удалось подключиться к MongoDB:', err.message);
    process.exit(1);
  });
