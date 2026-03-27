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

watch(
  () => props.modelValue,
  (newVal) => {
    patternString.value = newVal.join(' ');
  },
  { deep: true }
);

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

<style scoped lang="scss">
@use '../styles/variables' as *;

.pattern-input {
  @include flex-column;
  gap: $spacing-sm;
}

.pattern-label {
  font-weight: 600;
  color: $text-primary;
}

.pattern-input-wrapper {
  position: relative;
  @include flex-center;
}

.pattern-field {
  width: 100%;
  padding: $spacing-md 2.5rem $spacing-md $spacing-lg;
  font-size: $font-2xl;
  font-family: monospace;
  background: $bg-secondary;
  border: 2px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:focus {
    @include input-focus;
  }

  &.has-error {
    border-color: $beat-accent;
  }
}

.clear-button {
  position: absolute;
  right: $spacing-sm;
  @include button-reset;
  color: $text-muted;
  font-size: $font-3xl;
  padding: 0 $spacing-sm;
  transition: color $transition-base;

  &:hover {
    color: $beat-accent;
  }
}

.error-message {
  color: $beat-accent;
  font-size: $font-base;
  padding: $spacing-xs 0;
}

.pattern-help {
  font-size: $font-base;
  color: $text-secondary;

  strong {
    color: $text-primary;
  }
}

.pattern-preview {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  padding: $spacing-md;
  background: $bg-tertiary;
  border-radius: $radius-md;
  margin-top: $spacing-sm;
}

.beat-char {
  width: 32px;
  height: 32px;
  @include flex-center;
  font-weight: 700;
  font-size: $font-lg;
  border-radius: 50%;
  background: $beat-normal;
  color: white;
  transition: transform $transition-base;

  &.is-left {
    background: $beat-left;
  }

  &.is-right {
    background: $beat-right;
  }

  &.is-accent {
    background: $beat-accent;
    transform: scale(1.1);
    box-shadow: 0 0 8px $beat-accent;
  }
}
</style>
