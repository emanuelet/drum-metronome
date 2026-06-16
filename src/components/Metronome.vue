<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Play, Square } from '@lucide/vue';
import { useMetronome } from '../composables/useMetronome';
import TempoControl from './TempoControl.vue';
import PatternInput from './PatternInput.vue';
import Visualizer from './Visualizer.vue';
import PresetSelector from './PresetSelector.vue';
import GapTraining from './GapTraining.vue';
import Polyrhythm from './Polyrhythm.vue';

const pattern = ref<string[]>(['R', 'L', 'R', 'L']);
const tempo = ref(120);

// Gap training state
const gapEnabled = ref(false);
const measuresWithClick = ref(4);
const measuresWithoutClick = ref(2);

// Polyrhythm state
const polyrhythmEnabled = ref(false);
const leftHandPattern = ref<string[]>(['L', 'L', 'L']);
const rightHandPattern = ref<string[]>(['R', 'R', 'R', 'R']);

const {
  isPlaying,
  currentBeat,
  isInGap,
  currentMeasure,
  leftHandBeat,
  rightHandBeat,
  start,
  stop,
  setTempo,
  setPattern,
  initAudioContext,
  toggleGapTraining,
  setGapMeasures,
  togglePolyrhythm,
  setPolyrhythmPatterns,
} = useMetronome();

// Watch for gap training changes
watch(gapEnabled, (enabled) => {
  toggleGapTraining(enabled);
});

watch([measuresWithClick, measuresWithoutClick], ([withClick, withoutClick]) => {
  setGapMeasures(withClick, withoutClick);
});

// Watch for polyrhythm changes
watch(polyrhythmEnabled, (enabled) => {
  togglePolyrhythm(enabled);
});

watch([leftHandPattern, rightHandPattern], ([left, right]) => {
  setPolyrhythmPatterns(left, right);
});

const togglePlay = () => {
  initAudioContext();
  if (isPlaying.value) {
    stop();
  } else {
    if (polyrhythmEnabled.value) {
      if (leftHandPattern.value.length > 0 || rightHandPattern.value.length > 0) {
        setPolyrhythmPatterns(leftHandPattern.value, rightHandPattern.value);
        start();
      }
    } else if (pattern.value.length > 0) {
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
  if (polyrhythmEnabled.value) {
    // Disable polyrhythm when selecting a standard preset
    polyrhythmEnabled.value = false;
  }
  pattern.value = presetPattern;
  setPattern(presetPattern);
};

const canPlay = computed(() => {
  if (polyrhythmEnabled.value) {
    return leftHandPattern.value.length > 0 || rightHandPattern.value.length > 0;
  }
  return pattern.value.length > 0;
});
</script>

<template>
  <div class="metronome">
    <header class="metronome-header">
      <div class="title-group">
        <h1 class="title">Drum Metronome</h1>
        <p class="subtitle">Practice with sticking patterns</p>
      </div>
      <button
        class="play-button"
        :class="{ 'is-playing': isPlaying, 'is-disabled': !canPlay }"
        @click="togglePlay"
        :disabled="!canPlay"
        :title="isPlaying ? 'Stop' : 'Start'"
      >
        <Play v-if="!isPlaying" :size="24" />
        <Square v-else :size="24" />
      </button>
    </header>

    <main class="metronome-main">
      <section class="visualizer-section">
        <Visualizer
          :pattern="pattern"
          :current-beat="currentBeat"
          :is-playing="isPlaying"
          :gap-enabled="gapEnabled"
          :is-in-gap="isInGap"
          :current-measure="currentMeasure"
          :measures-with-click="measuresWithClick"
          :measures-without-click="measuresWithoutClick"
          :polyrhythm-enabled="polyrhythmEnabled"
          :left-hand-pattern="leftHandPattern"
          :right-hand-pattern="rightHandPattern"
          :left-hand-beat="leftHandBeat"
          :right-hand-beat="rightHandBeat"
        />
      </section>

      <section class="control-section">
        <TempoControl :model-value="tempo" @update:model-value="handleTempoChange" />
      </section>

      <section class="features-section">
        <GapTraining
          v-model:enabled="gapEnabled"
          v-model:measures-with-click="measuresWithClick"
          v-model:measures-without-click="measuresWithoutClick"
        />
        <Polyrhythm
          v-model:enabled="polyrhythmEnabled"
          v-model:left-hand-pattern="leftHandPattern"
          v-model:right-hand-pattern="rightHandPattern"
        />
      </section>

      <section v-if="!polyrhythmEnabled" class="pattern-section">
        <PatternInput v-model="pattern" @update:model-value="handlePatternChange" />
      </section>

      <section v-if="!polyrhythmEnabled" class="presets-section">
        <PresetSelector @select="handlePresetSelect" />
      </section>

      <p v-if="!canPlay" class="play-hint">
        <span v-if="polyrhythmEnabled">Enter left or right hand pattern</span>
        <span v-else>Enter a pattern to start</span>
      </p>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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
.presets-section,
.features-section {
  width: 100%;
}

.features-section {
  @include flex-column;
  gap: $spacing-lg;
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  background: $beat-active;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all $transition-base;
  flex-shrink: 0;

  &:hover:not(.is-disabled) {
    transform: scale(1.1);
    box-shadow: $shadow-lg;
  }

  &:active:not(.is-disabled) {
    transform: scale(1);
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
  text-align: center;
  color: $text-muted;
  font-size: $font-base;
  margin-top: -$spacing-lg;
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
