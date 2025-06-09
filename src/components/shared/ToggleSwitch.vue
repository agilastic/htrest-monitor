<template>
  <div class="toggle-switch-container">
    <label v-if="label" class="toggle-label">{{ label }}</label>
    <div 
      class="toggle-switch" 
      :class="{ 'toggle-on': modelValue, 'toggle-disabled': disabled }"
      @click="handleToggle"
      role="switch"
      :aria-checked="modelValue"
      :aria-disabled="disabled"
      tabindex="0"
      @keydown.space.prevent="handleToggle"
      @keydown.enter.prevent="handleToggle"
    >
      <div class="toggle-circle"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleToggle = () => {
  if (!disabled) {
    emit('update:modelValue', !modelValue)
  }
}
</script>

<script>
export default {
  name: 'ToggleSwitch'
}
</script>

<style scoped>
.toggle-switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-label {
  font-weight: 500;
  color: var(--color-text, #333);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: var(--toggle-bg-off, #ccc);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: none;
}

.toggle-switch:focus {
  box-shadow: 0 0 0 2px var(--color-primary, #4CAF50);
}

.toggle-switch.toggle-on {
  background-color: var(--toggle-bg-on, var(--color-primary, #4CAF50));
}

.toggle-switch.toggle-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-circle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: var(--toggle-circle, #fff);
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-on .toggle-circle {
  transform: translateX(26px);
}
</style>