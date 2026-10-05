<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">Профиль</h4>
    <Loading v-if="loading" />
    <div v-else-if="user" class="card border-0 shadow-sm">
      <div class="card-body p-3">
        <div class="mb-3">
          <label class="small text-muted">Имя</label>
          <input type="text" class="form-control" v-model="form.name" />
        </div>
        <div class="mb-3">
          <label class="small text-muted">Роль</label>
          <select class="form-select" v-model="form.role">
            <option value="applicant">Абитуриент</option>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
            <option value="staff">Сотрудник</option>
            <option value="guest">Гость</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="small text-muted">Интересы</label>
          <div class="d-flex flex-wrap gap-2">
            <label v-for="i in allInterests" :key="i" class="btn btn-sm" :class="form.interests.includes(i) ? 'btn-primary' : 'btn-outline-secondary'">
              <input type="checkbox" class="d-none" :value="i" v-model="form.interests" />{{ i }}
            </label>
          </div>
        </div>
        <div class="mb-3">
          <label class="small text-muted">Факультет</label>
          <input type="text" class="form-control" v-model="form.faculty" />
        </div>
        <div class="mb-3">
          <label class="small text-muted">Курс</label>
          <input type="number" class="form-control" v-model.number="form.course" />
        </div>
        <button class="btn btn-primary w-100" @click="save">Сохранить</button>

        <hr class="my-4" />

        <button class="btn btn-outline-danger w-100" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>Выйти из аккаунта
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import Loading from '@/components/common/Loading.vue';
import { useAuthStore } from '@/stores/authStore'; // <-- Импортируем authStore
export default defineComponent({
  name: 'ProfileView',
  components: { Loading },
  setup() {
    const user = useUserStore();
    const auth = useAuthStore(); // <-- Используем
    const form = reactive({ name: '', role: 'guest' as any, interests: [] as string[], faculty: '', course: undefined as number | undefined });
    const allInterests = ['программирование', 'робототехника', 'ИИ', 'информационные системы', 'веб-разработка', 'сети', 'исследования'];

    function handleLogout() {
      auth.logout();
    }

    onMounted(async () => {
      await user.load();
      if (user.user) Object.assign(form, user.user);
    });

    async function save() { await user.update({ ...form }); }

    return {
      user: user.user,
      form,
      allInterests,
      save,
      loading: user.loading,
      handleLogout // <-- Возвращаем
    };
  },
});
</script>