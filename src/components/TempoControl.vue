<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTapTempo } from '../composables/useTapTempo';

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const localTempo = ref(props.modelValue);
const { tap, reset, tapCount } = useTapTempo();
const tapMessage = ref('');

watch(() => props.modelValue, (newVal) => {
  localTempo.value = newVal;
});

watch(localTempo, (newVal) => {
  emit('update:modelValue', newVal);
});

const handleTap = () => {
  const bpm = tap();
  const count = tapCount();
  
  if (count === 1) {
    tapMessage.value = 'Tap again...';
  } else if (bpm !== null) {
    localTempo.value = bpm;
    tapMessage.value = `BPM: ${bpm}`;
  }
  
  setTimeout(() => {
    if (tapCount() === 0) {
      tapMessage.value = '';
    }
  }, 2000);
};

const handleSliderChange = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  localTempo.value = value;
  reset();
};

const handleInputChange = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  if (!isNaN(value) && value >= 20 && value <= 300) {
    localTempo.value = value;
  }
};
</script>

<template>
  <div class="tempo-control">
    <div class="tempo-display">
      <input
        type="number"
        class="tempo-input"
        :value="localTempo"
        @change="handleInputChange"
        min="20"
        max="300"
      />
      <span class="tempo-label">BPM</span>
    </div>
    
    <input
      type="range"
      class="tempo-slider"
      :value="localTempo"
      @input="handleSliderChange"
      min="20"
      max="300"
    />
    
    <div class="tempo-range">
      <span>20</span>
      <span>300</span>
    </div>
    
    <button class="tap-button" @click="handleTap">
      TAP TEMPO
      <span v-if="tapMessage" class="tap-message">{{ tapMessage }}</span>
    </button>
  </div>
</template>

<style scoped>
.tempo-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.tempo-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
}

.tempo-input {
  font-size: 3rem;
  font-weight: 700;
  width: 120px;
  text-align: center;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0.25rem;
}

.tempo-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.tempo-label {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.tempo-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  outline: none;
}

.tempo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: var(--accent-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.2s ease;
}

.tempo-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: var(--accent-secondary);
}

.tempo-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: var(--accent-primary);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.tempo-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.tap-button {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tap-button:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
}

.tap-button:active {
  transform: translateY(0);
}

.tap-message {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
