'use strict';
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/health', healthRoutes);
// Маршруты предметной области подключаются в спринтах 2–3:
// /api/auth, /api/books, /api/cart, /api/orders, /api/author-requests

// Единая обработка ошибок: ошибка не должна приводить к аварийному завершению приложения
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Внутренняя ошибка сервера' });
});

module.exports = app;
