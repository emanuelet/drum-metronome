<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMetronome } from '../composables/useMetronome';
import TempoControl from './TempoControl.vue';
import PatternInput from './PatternInput.vue';
import Visualizer from './Visualizer.vue';
import PresetSelector from './PresetSelector.vue';

const pattern = ref<string[]>(['R', 'L', 'R', 'L']);
const tempo = ref(120);

const { 
  isPlaying, 
  currentBeat, 
  start, 
  stop, 
  setTempo, 
  setPattern,
  initAudioContext 
} = useMetronome();

const togglePlay = () => {
  initAudioContext();
  if (isPlaying.value) {
    stop();
  } else {
    if (pattern.value.length > 0) {
      setPattern(pattern.value);
      start();
    }
  }
};

const handleTempoChange = (newTempo: number) => {
  tempo.value = newTempo;
  setTempo(newTempo);
};

const handlePatternChange = (newPattern: string[]) => {
  pattern.value = newPattern;
  setPattern(newPattern);
};

const handlePresetSelect = (presetPattern: string[]) => {
  pattern.value = presetPattern;
  setPattern(presetPattern);
};

const playButtonText = computed(() => {
  return isPlaying.value ? 'STOP' : 'START';
});

const canPlay = computed(() => {
  return pattern.value.length > 0;
});
</script>

<template>
  <div class="metronome">
    <header class="metronome-header">
      <h1 class="title">Drum Metronome</h1>
      <p class="subtitle">Practice with sticking patterns</p>
    </header>
    
    <main class="metronome-main">
      <section class="visualizer-section">
        <Visualizer
          :pattern="pattern"
          :current-beat="currentBeat"
          :is-playing="isPlaying"
        />
      </section>
      
      <section class="control-section">
        <TempoControl
          :model-value="tempo"
          @update:model-value="handleTempoChange"
        />
      </section>
      
      <section class="pattern-section">
        <PatternInput
          v-model="pattern"
          @update:model-value="handlePatternChange"
        />
      </section>
      
      <section class="presets-section">
        <PresetSelector @select="handlePresetSelect" />
      </section>
      
      <section class="play-section">
        <button
          class="play-button"
          :class="{ 'is-playing': isPlaying, 'is-disabled': !canPlay }"
          @click="togglePlay"
          :disabled="!canPlay"
        >
          {{ playButtonText }}
        </button>
        <p v-if="!canPlay" class="play-hint">
          Enter a pattern to start
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.metronome {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-xl;
  min-height: 100vh;

  &-header {
    text-align: center;
    margin-bottom: $spacing-2xl;
  }

  &-main {
    @include flex-column;
    gap: $spacing-xl;
  }
}

.title {
  font-size: $font-4xl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.subtitle {
  color: $text-secondary;
  font-size: $font-lg;
}

.control-section,
.visualizer-section,
.pattern-section,
.presets-section {
  width: 100%;
}

.play-section {
  @include flex-column;
  align-items: center;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.play-button {
  width: 100%;
  max-width: 300px;
  padding: 1.25rem 3rem;
  font-size: $font-3xl;
  font-weight: 700;
  background: $accent-primary;
  color: white;
  border: none;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:hover:not(.is-disabled) {
    background: $accent-secondary;
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }

  &:active:not(.is-disabled) {
    transform: translateY(0);
  }

  &.is-playing {
    background: $beat-accent;

    &:hover {
      background: #ff5252;
    }
  }

  &.is-disabled {
    background: $beat-normal;
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.play-hint {
  color: $text-muted;
  font-size: $font-base;
}

@media (min-width: $breakpoint-md) {
  .metronome {
    padding: $spacing-2xl;
  }

  .title {
    font-size: $font-5xl;
  }
}
</style>
