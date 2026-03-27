<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const patternString = ref(props.modelValue.join(' '));
const error = ref('');

watch(() => props.modelValue, (newVal) => {
  patternString.value = newVal.join(' ');
}, { deep: true });

const isValid = computed(() => {
  return error.value === '' && patternString.value.trim().length > 0;
});

const validatePattern = (input: string): boolean => {
  // Remove spaces and check each character
  const clean = input.replace(/\s/g, '');
  if (clean.length === 0) {
    error.value = 'Pattern cannot be empty';
    return false;
  }
  
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '!') {
      // Check if ! is preceded by L or R
      if (i === 0 || (clean[i - 1] !== 'L' && clean[i - 1] !== 'R')) {
        error.value = 'Accent (!) must follow L or R';
        return false;
      }
    } else if (char !== 'L' && char !== 'R') {
      error.value = 'Pattern can only contain L, R, and !';
      return false;
    }
  }
  
  error.value = '';
  return true;
};

const parsePattern = (input: string): string[] => {
  const clean = input.replace(/\s/g, '');
  const result: string[] = [];
  
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '!') {
      // Append to previous character
      if (result.length > 0) {
        result[result.length - 1] += '!';
      }
    } else {
      result.push(clean[i]);
    }
  }
  
  return result;
};

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value.toUpperCase();
  patternString.value = value;
  
  if (validatePattern(value)) {
    const parsed = parsePattern(value);
    emit('update:modelValue', parsed);
  }
};

const clearPattern = () => {
  patternString.value = '';
  error.value = '';
  emit('update:modelValue', []);
};
</script>

<template>
  <div class="pattern-input">
    <label class="pattern-label">Sticking Pattern</label>
    <div class="pattern-input-wrapper">
      <input
        type="text"
        class="pattern-field"
        :value="patternString"
        @input="handleInput"
        placeholder="e.g., L!RL RLR!L"
        :class="{ 'has-error': error }"
      />
      <button v-if="patternString" class="clear-button" @click="clearPattern">
        ×
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="pattern-help">
      <span class="help-text">
        <strong>L</strong> = Left, <strong>R</strong> = Right, <strong>!</strong> = Accent
      </span>
    </div>
    
    <div class="pattern-preview" v-if="isValid && modelValue.length > 0">
      <span 
        v-for="(beat, index) in modelValue" 
        :key="index"
        class="beat-char"
        :class="{
          'is-left': beat.startsWith('L') && !beat.includes('!'),
          'is-right': beat.startsWith('R') && !beat.includes('!'),
          'is-accent': beat.includes('!')
        }"
      >
        {{ beat.replace('!', '') }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.pattern-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-label {
  font-weight: 600;
  color: var(--text-primary);
}

.pattern-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.pattern-field {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1.25rem;
  font-family: monospace;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.pattern-field:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.pattern-field.has-error {
  border-color: var(--beat-accent);
}

.clear-button {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: var(--beat-accent);
}

.error-message {
  color: var(--beat-accent);
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.pattern-help {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pattern-help strong {
  color: var(--text-primary);
}

.pattern-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.beat-char {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 50%;
  background: var(--beat-normal);
  color: white;
  transition: transform 0.2s ease;
}

.beat-char.is-left {
  background: var(--beat-left);
}

.beat-char.is-right {
  background: var(--beat-right);
}

.beat-char.is-accent {
  background: var(--beat-accent);
  transform: scale(1.1);
  box-shadow: 0 0 8px var(--beat-accent);
}
</style>
