'use strict';
const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Не задана переменная окружения MONGODB_URI');
  await mongoose.connect(uri);
  console.log('Подключение к MongoDB установлено');
}

module.exports = { connectDb };
