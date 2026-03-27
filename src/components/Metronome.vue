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
      <section class="control-section">
        <TempoControl
          :model-value="tempo"
          @update:model-value="handleTempoChange"
        />
      </section>
      
      <section class="visualizer-section">
        <Visualizer
          :pattern="pattern"
          :current-beat="currentBeat"
          :is-playing="isPlaying"
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

<style scoped>
.metronome {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
}

.metronome-header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.metronome-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-section,
.visualizer-section,
.pattern-section,
.presets-section {
  width: 100%;
}

.play-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.play-button {
  width: 100%;
  max-width: 300px;
  padding: 1.25rem 3rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.play-button:hover:not(.is-disabled) {
  background: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.play-button:active:not(.is-disabled) {
  transform: translateY(0);
}

.play-button.is-playing {
  background: var(--beat-accent);
}

.play-button.is-playing:hover {
  background: #ff5252;
}

.play-button.is-disabled {
  background: var(--beat-normal);
  cursor: not-allowed;
  opacity: 0.5;
}

.play-hint {
  color: var(--text-muted);
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .metronome {
    padding: 2rem;
  }
  
  .title {
    font-size: 2.5rem;
  }
  
  .metronome-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "control visualizer"
      "pattern pattern"
      "presets presets"
      "play play";
    gap: 2rem;
  }
  
  .control-section {
    grid-area: control;
  }
  
  .visualizer-section {
    grid-area: visualizer;
  }
  
  .pattern-section {
    grid-area: pattern;
  }
  
  .presets-section {
    grid-area: presets;
  }
  
  .play-section {
    grid-area: play;
  }
}
</style>
