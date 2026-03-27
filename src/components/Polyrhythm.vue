<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  enabled: boolean;
  leftHandPattern: string[];
  rightHandPattern: string[];
}>();

const emit = defineEmits<{
  'update:enabled': [value: boolean];
  'update:leftHandPattern': [value: string[]];
  'update:rightHandPattern': [value: string[]];
}>();

const localEnabled = ref(props.enabled);
const leftPatternStr = ref(props.leftHandPattern.join(' '));
const rightPatternStr = ref(props.rightHandPattern.join(' '));

watch(() => props.enabled, (newVal) => {
  localEnabled.value = newVal;
});

watch(() => props.leftHandPattern, (newVal) => {
  leftPatternStr.value = newVal.join(' ');
}, { deep: true });

watch(() => props.rightHandPattern, (newVal) => {
  rightPatternStr.value = newVal.join(' ');
}, { deep: true });

watch(localEnabled, (newVal) => {
  emit('update:enabled', newVal);
});

const parsePattern = (input: string): string[] => {
  const clean = input.replace(/\s/g, '').toUpperCase();
  const result: string[] = [];
  
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '!') {
      if (result.length > 0) {
        result[result.length - 1] += '!';
      }
    } else if (clean[i] === 'L' || clean[i] === 'R') {
      result.push(clean[i]);
    }
  }
  
  return result;
};

const handleLeftInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  leftPatternStr.value = value;
  emit('update:leftHandPattern', parsePattern(value));
};

const handleRightInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  rightPatternStr.value = value;
  emit('update:rightHandPattern', parsePattern(value));
};
</script>

<template>
  <div class="polyrhythm">
    <div class="poly-header">
      <label class="poly-label">Polyrhythm</label>
      <label class="toggle-switch">
        <input
          type="checkbox"
          v-model="localEnabled"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    
    <div v-if="localEnabled" class="poly-controls">
      <div class="poly-input-group">
        <label class="poly-input-label">Left Hand</label>
        <input
          type="text"
          :value="leftPatternStr"
          @input="handleLeftInput"
          placeholder="e.g., L L L"
          class="poly-input"
        />
        <span class="poly-hint">Use L and L!</span>
      </div>
      
      <div class="poly-input-group">
        <label class="poly-input-label">Right Hand</label>
        <input
          type="text"
          :value="rightPatternStr"
          @input="handleRightInput"
          placeholder="e.g., R R R R"
          class="poly-input"
        />
        <span class="poly-hint">Use R and R!</span>
      </div>
    </div>
    
    <p v-if="localEnabled" class="poly-description">
      Play different rhythms simultaneously with each hand.
      <br>
      <strong>Example:</strong> 3 against 4 (LLL vs RRRR)
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.polyrhythm {
  @include flex-column;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-tertiary;
  border-radius: $radius-md;
  border: 2px solid transparent;
  transition: border-color $transition-base;
}

.poly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poly-label {
  font-weight: 600;
  color: $text-primary;
  font-size: $font-lg;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .toggle-slider {
      background: $accent-primary;
    }

    &:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
  }
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $beat-normal;
  transition: $transition-base;
  border-radius: 26px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background: white;
    transition: $transition-base;
    border-radius: 50%;
  }
}

.poly-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.poly-input-group {
  @include flex-column;
  gap: $spacing-xs;
}

.poly-input-label {
  font-size: $font-base;
  font-weight: 600;
  color: $text-primary;
}

.poly-input {
  padding: $spacing-md;
  font-size: $font-lg;
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
}

.poly-hint {
  font-size: $font-sm;
  color: $text-muted;
}

.poly-description {
  font-size: $font-base;
  color: $text-secondary;
  font-style: italic;
  margin: 0;
  
  strong {
    color: $text-primary;
  }
}
</style>
