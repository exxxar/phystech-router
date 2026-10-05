<template>
  <div class="auth-wrapper d-flex align-items-center min-vh-100 bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <i class="bi bi-geo-alt-fill text-primary" style="font-size: 48px;"></i>
                <h3 class="fw-bold mt-2 mb-1">Вход в систему</h3>
                <p class="text-muted small">Путеводитель по кафедре КТ</p>
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Email</label>
                  <input
                      type="email"
                      class="form-control form-control-lg"
                      v-model="form.email"
                      placeholder="name@university.ru"
                      required
                  />
                </div>
                <div class="mb-4">
                  <label class="form-label small fw-semibold">Пароль</label>
                  <input
                      type="password"
                      class="form-control form-control-lg"
                      v-model="form.password"
                      placeholder="••••••••"
                      required
                  />
                </div>

                <div v-if="auth.error" class="alert alert-danger small py-2 mb-3">
                  <i class="bi bi-exclamation-circle me-1"></i>{{ auth.error }}
                </div>

                <button
                    type="submit"
                    class="btn btn-primary btn-lg w-100 mb-3"
                    :disabled="auth.loading"
                >
                  <span v-if="auth.loading" class="spinner-border spinner-border-sm me-2"></span>
                  Войти
                </button>

                <div class="text-center small">
                  Нет аккаунта?
                  <router-link to="/register" class="text-primary fw-semibold text-decoration-none">Зарегистрироваться</router-link>
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
  name: 'LoginView',
  setup() {
    const auth = useAuthStore();
    const router = useRouter();
    const form = reactive({ email: '', password: '' });

    async function handleLogin() {
      const success = await auth.login(form.email, form.password);
      if (success) router.push('/');
    }

    return { auth, form, handleLogin };
  },
});
</script>

<style scoped>
.auth-wrapper { background: #F5F7FA; }
.text-primary { color: #172B4D !important; }
.btn-primary { background: #172B4D; border-color: #172B4D; }
.btn-primary:hover { background: #10213D; border-color: #10213D; }
</style>