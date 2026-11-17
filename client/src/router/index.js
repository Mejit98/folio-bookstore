import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

// Остальные маршруты (каталог, корзина, заказы, заявки) добавляются в спринте 3
export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'home', component: HomeView }],
});
