<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  pattern: string[];
  currentBeat: number;
  isPlaying: boolean;
}>();

const getBeatClass = (beat: string): string => {
  if (beat.includes('!')) return 'accent';
  if (beat === 'L') return 'left';
  if (beat === 'R') return 'right';
  return 'normal';
};

const getBeatLabel = (beat: string): string => {
  return beat.replace('!', '');
};

const containerStyle = computed(() => {
  const beatCount = props.pattern.length;
  if (beatCount === 0) return {};

  // Calculate size based on number of beats
  // Base size is 64px, minimum is 32px
  const baseSize = 64;
  const minSize = 32;
  const maxBeats = 16; // At 16+ beats, use minimum size

  let size = baseSize;
  if (beatCount > 8) {
    // Linear interpolation between baseSize and minSize
    const ratio = Math.min((beatCount - 8) / (maxBeats - 8), 1);
    size = baseSize - (baseSize - minSize) * ratio;
  }

  return {
    '--beat-size': `${size}px`,
    '--beat-font-size': `${size * 0.375}px`
  };
});
</script>

<template>
  <div class="visualizer">
    <div class="visualizer-container" :style="containerStyle">
      <div
        v-for="(beat, index) in pattern"
        :key="index"
        class="beat-indicator"
        :class="[
          getBeatClass(beat),
          {
            'is-active': isPlaying && currentBeat === index,
            'is-playing': isPlaying
          }
        ]"
      >
        <span class="beat-label">{{ getBeatLabel(beat) }}</span>
      </div>
      <div v-if="pattern.length === 0" class="empty-pattern">
        Enter a pattern to see visualization
      </div>
    </div>
  </div>
</template>

<style scoped>
.visualizer {
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.visualizer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  min-height: 120px;
  padding: 0.5rem;
}

.beat-indicator {
  width: var(--beat-size, 64px);
  height: var(--beat-size, 64px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--beat-font-size, 1.5rem);
  font-weight: 700;
  background: var(--beat-normal);
  color: white;
  transition: all 0.1s ease;
  position: relative;
  flex-shrink: 0;
}

.beat-indicator::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 3px solid transparent;
  transition: border-color 0.1s ease;
}

.beat-indicator.left {
  background: var(--beat-left);
}

.beat-indicator.right {
  background: var(--beat-right);
}

.beat-indicator.accent {
  background: var(--beat-accent);
  transform: scale(1.1);
  box-shadow: 0 0 15px var(--beat-accent);
}

.beat-indicator.is-active {
  transform: scale(1.2);
  box-shadow: 0 0 25px var(--beat-active);
}

.beat-indicator.is-active::before {
  border-color: var(--beat-active);
}

.beat-indicator.accent.is-active {
  transform: scale(1.3);
  box-shadow: 0 0 30px var(--beat-accent), 0 0 45px var(--beat-active);
}

.beat-indicator.is-playing {
  opacity: 0.6;
}

.beat-indicator.is-active {
  opacity: 1;
}

.empty-pattern {
  color: var(--text-muted);
  font-style: italic;
  text-align: center;
}

@media (max-width: 640px) {
  .visualizer {
    padding: 1rem;
  }

  .visualizer-container {
    gap: 0.5rem;
    min-height: 80px;
  }
}
</style>
