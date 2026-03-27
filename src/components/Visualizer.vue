<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  pattern: string[];
  currentBeat: number;
  isPlaying: boolean;
  // Gap training props
  gapEnabled?: boolean;
  isInGap?: boolean;
  currentMeasure?: number;
  measuresWithClick?: number;
  measuresWithoutClick?: number;
  // Polyrhythm props
  polyrhythmEnabled?: boolean;
  leftHandPattern?: string[];
  rightHandPattern?: string[];
  leftHandBeat?: number;
  rightHandBeat?: number;
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
  const baseSize = 64;
  const minSize = 32;
  const maxBeats = 16;

  let size = baseSize;
  if (beatCount > 8) {
    const ratio = Math.min((beatCount - 8) / (maxBeats - 8), 1);
    size = baseSize - (baseSize - minSize) * ratio;
  }

  return {
    '--beat-size': `${size}px`,
    '--beat-font-size': `${size * 0.375}px`,
  };
});

const gapProgress = computed(() => {
  if (
    !props.gapEnabled ||
    props.measuresWithClick === undefined ||
    props.measuresWithoutClick === undefined
  ) {
    return null;
  }
  const total = props.measuresWithClick + props.measuresWithoutClick;
  const current = (props.currentMeasure || 0) % total;
  return {
    current,
    total,
    inGap: props.isInGap || false,
    withClick: props.measuresWithClick,
    withoutClick: props.measuresWithoutClick,
  };
});
</script>

<template>
  <div class="visualizer" :class="{ 'is-in-gap': isInGap }">
    <!-- Gap Mode Indicator -->
    <div v-if="gapEnabled && gapProgress" class="gap-indicator">
      <div class="gap-status" :class="{ 'in-gap': isInGap }">
        {{ isInGap ? '🔇 GAP MODE' : '🔊 PLAYING' }}
      </div>
      <div class="gap-progress-bar">
        <div
          v-for="i in gapProgress.total"
          :key="i"
          class="gap-progress-segment"
          :class="{
            'is-past': i - 1 < gapProgress.current,
            'is-current': i - 1 === gapProgress.current,
            'is-gap': i > gapProgress.withClick
          }"
        />
      </div>
    </div>

    <!-- Standard Pattern Visualizer -->
    <div v-if="!polyrhythmEnabled" class="visualizer-container" :style="containerStyle">
      <div
        v-for="(beat, index) in pattern"
        :key="index"
        class="beat-indicator"
        :class="[
          getBeatClass(beat),
          {
            'is-active': isPlaying && currentBeat === index,
            'is-playing': isPlaying,
            'is-muted': isInGap
          }
        ]"
      >
        <span class="beat-label">{{ getBeatLabel(beat) }}</span>
      </div>
      <div v-if="pattern.length === 0" class="empty-pattern">
        Enter a pattern to see visualization
      </div>
    </div>

    <!-- Polyrhythm Visualizer -->
    <div v-else class="polyrhythm-visualizer">
      <div class="hand-pattern">
        <label class="hand-label">Left Hand</label>
        <div class="hand-beats">
          <div
            v-for="(beat, index) in leftHandPattern"
            :key="`left-${index}`"
            class="beat-indicator small"
            :class="[
              getBeatClass(beat),
              {
                'is-active': isPlaying && (leftHandBeat || 0) % (leftHandPattern?.length || 1) === index,
                'is-playing': isPlaying,
                'is-muted': isInGap
              }
            ]"
          >
            <span class="beat-label">{{ getBeatLabel(beat) }}</span>
          </div>
        </div>
      </div>
      
      <div class="hand-pattern">
        <label class="hand-label">Right Hand</label>
        <div class="hand-beats">
          <div
            v-for="(beat, index) in rightHandPattern"
            :key="`right-${index}`"
            class="beat-indicator small"
            :class="[
              getBeatClass(beat),
              {
                'is-active': isPlaying && (rightHandBeat || 0) % (rightHandPattern?.length || 1) === index,
                'is-playing': isPlaying,
                'is-muted': isInGap
              }
            ]"
          >
            <span class="beat-label">{{ getBeatLabel(beat) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.visualizer {
  padding: $spacing-2xl;
  @include card;
  transition: background-color $transition-base;

  &.is-in-gap {
    background: rgba($bg-secondary, 0.5);
  }
}

// Gap Indicator
.gap-indicator {
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.gap-status {
  text-align: center;
  font-weight: 700;
  font-size: $font-lg;
  color: $beat-active;
  margin-bottom: $spacing-sm;
  padding: $spacing-sm;
  background: rgba($beat-active, 0.1);
  border-radius: $radius-md;

  &.in-gap {
    color: $text-muted;
    background: rgba($text-muted, 0.1);
  }
}

.gap-progress-bar {
  display: flex;
  gap: 4px;
  justify-content: center;
  height: 8px;
}

.gap-progress-segment {
  flex: 1;
  max-width: 40px;
  height: 100%;
  background: $bg-tertiary;
  border-radius: 4px;
  transition: background-color $transition-base;

  &.is-past {
    background: $beat-active;
  }

  &.is-current {
    background: $accent-primary;
    box-shadow: 0 0 8px $accent-primary;
  }

  &.is-gap {
    background: rgba($text-muted, 0.3);

    &.is-past {
      background: $text-muted;
    }

    &.is-current {
      background: $beat-accent;
    }
  }
}

// Standard Visualizer
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

  &.small {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
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

  &.is-muted {
    opacity: 0.3;
    filter: grayscale(100%);
  }
}

.empty-pattern {
  color: $text-muted;
  font-style: italic;
  text-align: center;
}

// Polyrhythm Visualizer
.polyrhythm-visualizer {
  @include flex-column;
  gap: $spacing-lg;
}

.hand-pattern {
  @include flex-column;
  gap: $spacing-sm;
}

.hand-label {
  font-weight: 600;
  color: $text-primary;
  font-size: $font-base;
}

.hand-beats {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: $breakpoint-sm) {
  .visualizer {
    padding: $spacing-lg;
  }

  .visualizer-container {
    gap: $spacing-sm;
    min-height: 80px;
  }

  .beat-indicator.small {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
