<template>
  <div>
    <div class="text-center mb-4">
      <i class="bi bi-building fs-1 text-primary"></i>
      <h3 class="mt-2">Вход в систему</h3>
      <p class="text-muted">Управление путеводителем</p>
    </div>

    <form @submit.prevent="submitLogin" novalidate>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
            type="email"
            class="form-control"
            id="email"
            v-model="form.email"
            :class="{ 'is-invalid': submitted && !form.email }"
            required
        >
        <div class="invalid-feedback">Введите корректный email</div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Пароль</label>
        <input
            type="password"
            class="form-control"
            id="password"
            v-model="form.password"
            :class="{ 'is-invalid': submitted && !form.password }"
            required
        >
        <div class="invalid-feedback">Введите пароль</div>
      </div>

      <div v-if="authError" class="alert alert-danger py-2" role="alert">
        {{ authError }}
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      submitted: false
    };
  },
  computed: {
    ...mapState(useAuthStore, ['isLoading', 'error']),
    authError() {
      return this.submitted ? this.error : null;
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['login']),
    async submitLogin() {
      this.submitted = true;
      if (!this.form.email || !this.form.password) {
        return;
      }

      const success = await this.login(this.form);
      if (success) {
        // Если login() вернул true, значит токен сохранен, и роутер пропустит нас на /dashboard
        this.$router.push('/dashboard');
      }
    }
  }
};
</script>