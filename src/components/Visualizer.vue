<script setup lang="ts">
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
</script>

<template>
  <div class="visualizer">
    <div class="visualizer-container">
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
  gap: 1rem;
  flex-wrap: wrap;
  min-height: 120px;
}

.beat-indicator {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--beat-normal);
  color: white;
  transition: all 0.1s ease;
  position: relative;
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
  transform: scale(1.15);
  box-shadow: 0 0 20px var(--beat-accent);
}

.beat-indicator.is-active {
  transform: scale(1.3);
  box-shadow: 0 0 30px var(--beat-active);
}

.beat-indicator.is-active::before {
  border-color: var(--beat-active);
}

.beat-indicator.accent.is-active {
  transform: scale(1.4);
  box-shadow: 0 0 40px var(--beat-accent), 0 0 60px var(--beat-active);
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
  .beat-indicator {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
  
  .visualizer-container {
    gap: 0.75rem;
  }
}
</style>
