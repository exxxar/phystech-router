<template>
  <div class="auth-wrapper d-flex align-items-center min-vh-100 bg-light py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <i class="bi bi-person-plus-fill text-primary" style="font-size: 48px;"></i>
                <h3 class="fw-bold mt-2 mb-1">Регистрация</h3>
                <p class="text-muted small">Создайте аккаунт для доступа к путеводителю</p>
              </div>

              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Имя и Фамилия</label>
                  <input type="text" class="form-control form-control-lg" v-model="form.name" required />
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Email</label>
                  <input type="email" class="form-control form-control-lg" v-model="form.email" required />
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Роль</label>
                  <select class="form-select form-select-lg" v-model="form.role" required>
                    <option value="student">Студент</option>
                    <option value="applicant">Абитуриент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="staff">Сотрудник</option>
                    <option value="guest">Гость</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="form-label small fw-semibold">Пароль</label>
                  <input type="password" class="form-control form-control-lg" v-model="form.password" required minlength="6" />
                </div>

                <div v-if="auth.error" class="alert alert-danger small py-2 mb-3">
                  <i class="bi bi-exclamation-circle me-1"></i>{{ auth.error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="auth.loading">
                  <span v-if="auth.loading" class="spinner-border spinner-border-sm me-2"></span>
                  Зарегистрироваться
                </button>

                <div class="text-center small">
                  Уже есть аккаунт?
                  <router-link to="/login" class="text-primary fw-semibold text-decoration-none">Войти</router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const auth = useAuthStore();
    const router = useRouter();
    const form = reactive({ name: '', email: '', password: '', role: 'student' });

    async function handleRegister() {
      const success = await auth.register(form);
      if (success) {
        localStorage.setItem('onboarding_done', '1'); // Пропускаем онбординг при регистрации
        router.push('/');
      }
    }

    return { auth, form, handleRegister };
  },
});
</script>

<style scoped>
.auth-wrapper { background: #F5F7FA; }
.text-primary { color: #172B4D !important; }
.btn-primary { background: #172B4D; border-color: #172B4D; }
.btn-primary:hover { background: #10213D; border-color: #10213D; }
</style>