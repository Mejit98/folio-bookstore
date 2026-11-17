<script setup>
import { ref, onMounted } from 'vue';

const apiStatus = ref('проверка…');

// Проверяем связь клиента с сервером
onMounted(async () => {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    apiStatus.value = data.status === 'ok' ? 'сервер доступен' : 'сервер отвечает с ошибкой';
  } catch (e) {
    apiStatus.value = 'сервер недоступен';
  }
});
</script>

<template>
  <main>
    <h1>Фолиант</h1>
    <p>Каркас клиентской части. Состояние API: {{ apiStatus }}.</p>
  </main>
</template>
