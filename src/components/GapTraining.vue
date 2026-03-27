<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  enabled: boolean;
  measuresWithClick: number;
  measuresWithoutClick: number;
}>();

const emit = defineEmits<{
  'update:enabled': [value: boolean];
  'update:measuresWithClick': [value: number];
  'update:measuresWithoutClick': [value: number];
}>();

const localEnabled = ref(props.enabled);
const localWithClick = ref(props.measuresWithClick);
const localWithoutClick = ref(props.measuresWithoutClick);

watch(() => props.enabled, (newVal) => {
  localEnabled.value = newVal;
});

watch(() => props.measuresWithClick, (newVal) => {
  localWithClick.value = newVal;
});

watch(() => props.measuresWithoutClick, (newVal) => {
  localWithoutClick.value = newVal;
});

watch(localEnabled, (newVal) => {
  emit('update:enabled', newVal);
});

watch(localWithClick, (newVal) => {
  emit('update:measuresWithClick', newVal);
});

watch(localWithoutClick, (newVal) => {
  emit('update:measuresWithoutClick', newVal);
});
</script>

<template>
  <div class="gap-training">
    <div class="gap-header">
      <label class="gap-label">Gap Training</label>
      <label class="toggle-switch">
        <input
          type="checkbox"
          v-model="localEnabled"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    
    <div v-if="localEnabled" class="gap-controls">
      <div class="gap-input-group">
        <label class="gap-input-label">Measures with click</label>
        <input
          type="number"
          v-model.number="localWithClick"
          min="1"
          max="16"
          class="gap-input"
        />
      </div>
      
      <div class="gap-divider">→</div>
      
      <div class="gap-input-group">
        <label class="gap-input-label">Measures without</label>
        <input
          type="number"
          v-model.number="localWithoutClick"
          min="1"
          max="16"
          class="gap-input"
        />
      </div>
    </div>
    
    <p v-if="localEnabled" class="gap-description">
      Plays {{ localWithClick }} measure{{ localWithClick > 1 ? 's' : '' }} with click, 
      then {{ localWithoutClick }} measure{{ localWithoutClick > 1 ? 's' : '' }} silent.
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.gap-training {
  @include flex-column;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-tertiary;
  border-radius: $radius-md;
  border: 2px solid transparent;
  transition: border-color $transition-base;
}

.gap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gap-label {
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

.gap-controls {
  display: flex;
  align-items: flex-end;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.gap-input-group {
  @include flex-column;
  gap: $spacing-xs;
  flex: 1;
  min-width: 120px;
}

.gap-input-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.gap-input {
  padding: $spacing-sm;
  font-size: $font-xl;
  text-align: center;
  background: $bg-secondary;
  border: 2px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  width: 100%;

  &:focus {
    @include input-focus;
  }
}

.gap-divider {
  font-size: $font-xl;
  color: $text-muted;
  padding-bottom: $spacing-sm;
}

.gap-description {
  font-size: $font-base;
  color: $text-secondary;
  font-style: italic;
  margin: 0;
}
</style>
