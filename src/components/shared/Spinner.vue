<template>
  <div class="spinner-container" :class="{ overlay: overlay }">
    <div class="spinner" :class="size">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner-container.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner {
  position: relative;
  display: inline-block;
}

.spinner.small {
  width: 20px;
  height: 20px;
}

.spinner.medium {
  width: 40px;
  height: 40px;
}

.spinner.large {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  border: 3px solid transparent;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner.small .spinner-ring {
  border-width: 2px;
  border-top-width: 2px;
}

.spinner.large .spinner-ring {
  border-width: 4px;
  border-top-width: 4px;
}

.spinner-ring:nth-child(1) {
  width: 100%;
  height: 100%;
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  animation-delay: -0.3s;
  border-top-color: var(--success-color);
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  animation-delay: -0.15s;
  border-top-color: var(--warning-color);
}

.spinner-ring:nth-child(4) {
  width: 40%;
  height: 40%;
  top: 30%;
  left: 30%;
  border-top-color: var(--danger-color);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-message {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.overlay .spinner-message {
  color: white;
}

/* Alternative simple spinner styles */
.spinner.simple {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin-simple 1s linear infinite;
}

.spinner.simple .spinner-ring {
  display: none;
}

@keyframes spin-simple {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>