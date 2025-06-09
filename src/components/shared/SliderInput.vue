<template>
  <div class="slider-input-container">
    <label v-if="label" class="slider-label">{{ label }}</label>
    <div class="slider-wrapper">
      <input
        type="range"
        class="slider"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @input="handleInput"
        @change="handleChange"
      />
      <div class="slider-value">
        {{ formatValue(modelValue) }}{{ unit }}
      </div>
    </div>
    <div v-if="showMinMax" class="slider-range">
      <span class="range-min">{{ formatValue(min) }}{{ unit }}</span>
      <span class="range-max">{{ formatValue(max) }}{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showMinMax: {
    type: Boolean,
    default: true
  },
  precision: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const formatValue = (value) => {
  if (props.precision !== null) {
    return Number(value).toFixed(props.precision)
  }
  return props.step < 1 ? Number(value).toFixed(1) : Math.round(value)
}

const handleInput = (event) => {
  const value = parseFloat(event.target.value)
  emit('update:modelValue', value)
}

const handleChange = (event) => {
  const value = parseFloat(event.target.value)
  emit('update:modelValue', value)
}
</script>

<script>
export default {
  name: 'SliderInput'
}
</script>

<style scoped>
.slider-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-label {
  font-weight: 500;
  color: var(--color-text, #333);
  font-size: 0.9em;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--slider-track, #e0e0e0);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--slider-thumb, var(--color-primary, #4CAF50));
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--slider-thumb, var(--color-primary, #4CAF50));
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider:focus {
  box-shadow: 0 0 0 2px var(--color-primary, #4CAF50);
}

.slider-value {
  min-width: 60px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text, #333);
  background: var(--color-background, #fff);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border, #e0e0e0);
  font-size: 0.9em;
}

.slider-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: var(--color-text-secondary, #666);
}

.range-min,
.range-max {
  font-weight: 500;
}
</style>