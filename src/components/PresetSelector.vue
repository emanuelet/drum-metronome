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

<style scoped>
.preset-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-label {
  font-weight: 600;
  color: var(--text-primary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.preset-button {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.preset-button:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.preset-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.preset-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}
</style>
