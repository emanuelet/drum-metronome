<script setup lang="ts">
const emit = defineEmits<{
  select: [pattern: string[]];
}>();

interface Preset {
  name: string;
  pattern: string[];
  description: string;
}

const presets: Preset[] = [
  {
    name: 'Single Stroke',
    pattern: ['R', 'L', 'R', 'L'],
    description: 'Alternating hands'
  },
  {
    name: 'Double Stroke',
    pattern: ['R', 'R', 'L', 'L'],
    description: 'Two hits per hand'
  },
  {
    name: 'Paradiddle',
    pattern: ['R', 'L', 'R', 'R', 'L', 'R', 'L', 'L'],
    description: 'RLRR LRLL'
  },
  {
    name: 'Triplets',
    pattern: ['R', 'L', 'L'],
    description: 'Right hand lead'
  },
  {
    name: 'Flam Accent',
    pattern: ['R!', 'L', 'R', 'L!', 'R', 'L'],
    description: 'Accented flams'
  },
  {
    name: 'Single Seven',
    pattern: ['R', 'L', 'R', 'L', 'R', 'L', 'L'],
    description: '7-stroke roll'
  }
];

const selectPreset = (preset: Preset) => {
  emit('select', [...preset.pattern]);
};
</script>

<template>
  <div class="preset-selector">
    <label class="preset-label">Quick Presets</label>
    <div class="preset-grid">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="preset-button"
        @click="selectPreset(preset)"
      >
        <span class="preset-name">{{ preset.name }}</span>
        <span class="preset-desc">{{ preset.description }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.preset-selector {
  @include flex-column;
  gap: $spacing-sm;
}

.preset-label {
  font-weight: 600;
  color: $text-primary;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: $spacing-sm;
}

.preset-button {
  @include flex-column;
  padding: $spacing-md;
  background: $bg-secondary;
  border: 2px solid $border-color;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  text-align: left;

  &:hover {
    border-color: $accent-primary;
    background: $bg-tertiary;
    transform: translateY(-2px);
  }
}

.preset-name {
  font-weight: 600;
  color: $text-primary;
  font-size: 0.9rem;
}

.preset-desc {
  font-size: $font-sm;
  color: $text-muted;
  margin-top: $spacing-xs;
}
</style>
