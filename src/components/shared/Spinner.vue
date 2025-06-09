<template>
  <div class="loading-container" :class="{ 'spinner-overlay': overlay }">
    <div class="spinner" :class="[size, { simple: simple }]">
      <div v-if="!simple" class="spinner-ring"></div>
      <div v-if="!simple" class="spinner-ring"></div>
      <div v-if="!simple" class="spinner-ring"></div>
      <div v-if="!simple" class="spinner-ring"></div>
    </div>
    <p v-if="message" class="loading-text">{{ message }}</p>
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
  },
  simple: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
/* Custom spinner rings for multi-ring effect */
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

.spinner-overlay .loading-text {
  color: white;
}
</style>