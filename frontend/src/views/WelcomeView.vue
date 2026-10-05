<template>
  <div class="welcome min-vh-100 d-flex flex-column bg-white">
    <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 text-center">
      <div class="welcome-icon mb-4">
        <i :class="slides[step].icon" class="text-primary" style="font-size: 80px;"></i>
      </div>
      <h2 class="fw-bold">{{ slides[step].title }}</h2>
      <p class="text-muted mt-3 px-3" style="max-width: 400px;">{{ slides[step].text }}</p>
      <div class="d-flex gap-2 mt-4">
        <span v-for="(_, i) in slides" :key="i" class="dot" :class="{ active: i === step }"></span>
      </div>
    </div>
    <div class="p-4 d-flex gap-2">
      <button v-if="step > 0" class="btn btn-outline-secondary flex-grow-1" @click="step--">Назад</button>
      <button class="btn btn-link text-muted" @click="finish">Пропустить</button>
      <button class="btn btn-primary flex-grow-1" @click="next">{{ step === slides.length - 1 ? 'Начать' : 'Далее' }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'WelcomeView',
  setup() {
    const router = useRouter();
    const step = ref(0);
    const slides = [
      { icon: 'bi-map', title: 'Исследуйте пространство кафедры', text: 'Интерактивная карта всех помещений, лабораторий и точек интереса.' },
      { icon: 'bi-signpost-split', title: 'Стройте маршруты', text: 'Оптимальный путь между любыми объектами с учётом этажей и лестниц.' },
      { icon: 'bi-stars', title: 'Получайте рекомендации', text: 'Персональные подсказки на основе ваших интересов и контекста.' },
    ];
    function next() {
      if (step.value < slides.length - 1) step.value++;
      else finish();
    }
    function finish() {
      localStorage.setItem('onboarding_done', '1');
      router.replace('/');
    }
    return { step, slides, next, finish };
  },
});
</script>

<style scoped>
.dot { width: 8px; height: 8px; border-radius: 50%; background: #E5E7EB; transition: all 0.2s; }
.dot.active { background: #172B4D; width: 24px; border-radius: 4px; }
</style>