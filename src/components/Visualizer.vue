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

<style scoped lang="scss">
@use '../styles/variables' as *;

.visualizer {
  padding: $spacing-2xl;
  @include card;
}

.visualizer-container {
  @include flex-center;
  gap: $spacing-md;
  flex-wrap: nowrap;
  overflow-x: auto;
  min-height: 120px;
  padding: $spacing-sm;
}

.beat-indicator {
  width: var(--beat-size, 64px);
  height: var(--beat-size, 64px);
  border-radius: 50%;
  @include flex-center;
  font-size: var(--beat-font-size, 1.5rem);
  font-weight: 700;
  background: $beat-normal;
  color: white;
  transition: all $transition-fast;
  position: relative;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 3px solid transparent;
    transition: border-color $transition-fast;
  }

  &.left {
    background: $beat-left;
  }

  &.right {
    background: $beat-right;
  }

  &.accent {
    background: $beat-accent;
    transform: scale(1.1);
    box-shadow: 0 0 15px $beat-accent;
  }

  &.is-active {
    transform: scale(1.2);
    box-shadow: 0 0 25px $beat-active;

    &::before {
      border-color: $beat-active;
    }

    &.accent {
      transform: scale(1.3);
      box-shadow: 0 0 30px $beat-accent, 0 0 45px $beat-active;
    }
  }

  &.is-playing {
    opacity: 0.6;
  }

  &.is-active {
    opacity: 1;
  }
}

.empty-pattern {
  color: $text-muted;
  font-style: italic;
  text-align: center;
}

@media (max-width: $breakpoint-sm) {
  .visualizer {
    padding: $spacing-lg;
  }

  .visualizer-container {
    gap: $spacing-sm;
    min-height: 80px;
  }
}
</style>
