'use strict';
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Проверка работоспособности: 1 — база данных подключена
router.get('/', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

module.exports = router;
