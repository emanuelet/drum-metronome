<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTapTempo } from '../composables/useTapTempo';

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const localTempo = ref(props.modelValue);
const { tap, reset, tapCount } = useTapTempo();
const tapMessage = ref('');

watch(
  () => props.modelValue,
  (newVal) => {
    localTempo.value = newVal;
  }
);

watch(localTempo, (newVal) => {
  emit('update:modelValue', newVal);
});

const handleTap = () => {
  const bpm = tap();
  const count = tapCount();

  if (count === 1) {
    tapMessage.value = 'Tap again...';
  } else if (bpm !== null) {
    localTempo.value = bpm;
    tapMessage.value = `BPM: ${bpm}`;
  }

  setTimeout(() => {
    if (tapCount() === 0) {
      tapMessage.value = '';
    }
  }, 2000);
};

const handleSliderChange = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  localTempo.value = value;
  reset();
};

const handleInputChange = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  if (!isNaN(value) && value >= 20 && value <= 300) {
    localTempo.value = value;
  }
};

// Italian tempo markings
interface TempoMark {
  name: string;
  bpm: number;
  description: string;
}

const tempoMarks: TempoMark[] = [
  { name: 'Largo', bpm: 50, description: 'Broadly' },
  { name: 'Adagio', bpm: 70, description: 'Slowly' },
  { name: 'Andante', bpm: 95, description: 'At a walking pace' },
  { name: 'Moderato', bpm: 115, description: 'Moderately' },
  { name: 'Allegro', bpm: 135, description: 'Fast' },
  { name: 'Presto', bpm: 180, description: 'Very fast' },
  { name: 'Prestissimo', bpm: 220, description: 'Extremely fast' },
];

const setTempoFromMark = (bpm: number) => {
  localTempo.value = bpm;
  reset();
};

const getSliderPosition = (bpm: number): string => {
  const min = 20;
  const max = 300;
  const percentage = ((bpm - min) / (max - min)) * 100;
  return `${percentage}%`;
};
</script>

<template>
  <div class="tempo-control">
    <div class="tempo-display">
      <input
        type="number"
        class="tempo-input"
        :value="localTempo"
        @change="handleInputChange"
        min="20"
        max="300"
      />
      <span class="tempo-label">BPM</span>
    </div>

    <div class="slider-container">
      <input
        type="range"
        class="tempo-slider"
        :value="localTempo"
        @input="handleSliderChange"
        min="20"
        max="300"
      />

      <div class="tempo-marks">
        <button
          v-for="mark in tempoMarks"
          :key="mark.name"
          class="tempo-mark"
          :class="{ 'is-active': localTempo >= mark.bpm - 10 && localTempo <= mark.bpm + 10 }"
          :style="{ left: getSliderPosition(mark.bpm) }"
          @click="setTempoFromMark(mark.bpm)"
          :title="`${mark.name}: ${mark.description} (~${mark.bpm} BPM)`"
        >
          <span class="mark-tick"></span>
          <span class="mark-label">{{ mark.name }}</span>
        </button>
      </div>
    </div>

    <div class="tempo-range">
      <span>20</span>
      <span>300</span>
    </div>

    <button class="tap-button" @click="handleTap">
      TAP TEMPO
      <span v-if="tapMessage" class="tap-message">{{ tapMessage }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.tempo-control {
  @include flex-column;
  gap: $spacing-lg;
  padding: $spacing-xl;
  @include card;
}

.tempo-display {
  @include flex-center;
  gap: $spacing-sm;
}

.tempo-input {
  font-size: $font-6xl;
  font-weight: 700;
  width: 120px;
  text-align: center;
  background: transparent;
  border: 2px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  padding: $spacing-xs;

  &:focus {
    @include input-focus;
  }
}

.tempo-label {
  font-size: $font-xl;
  color: $text-secondary;
}

.slider-container {
  position: relative;
  padding-bottom: 2.5rem;
}

.tempo-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: $bg-tertiary;
  border-radius: $radius-sm;
  outline: none;
  position: relative;
  z-index: 2;

  &::-webkit-slider-thumb {
    @include slider-thumb;

    &:hover {
      transform: scale(1.1);
      background: $accent-secondary;
    }
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: $accent-primary;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    z-index: 3;
  }
}

.tempo-marks {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  height: 40px;
  pointer-events: none;
}

.tempo-mark {
  position: absolute;
  transform: translateX(-50%);
  @include button-reset;
  pointer-events: auto;
  @include flex-column;
  align-items: center;
  gap: $spacing-xs;
  transition: all $transition-base;

  &:hover {
    transform: translateX(-50%) translateY(-2px);
  }

  &.is-active {
    .mark-tick {
      background: $accent-primary;
      height: 16px;
    }

    .mark-label {
      color: $accent-primary;
      font-weight: 600;
    }
  }

  &:hover {
    .mark-tick {
      background: $accent-secondary;
      height: 14px;
    }

    .mark-label {
      color: $accent-secondary;
    }
  }
}

.mark-tick {
  width: 2px;
  height: 10px;
  background: $text-muted;
  transition: all $transition-base;
}

.mark-label {
  font-size: $font-xs;
  color: $text-muted;
  white-space: nowrap;
  transition: all $transition-base;
}

.tempo-range {
  display: flex;
  justify-content: space-between;
  font-size: $font-base;
  color: $text-muted;
  margin-top: -$spacing-lg;
}

.tap-button {
  padding: $spacing-lg $spacing-2xl;
  font-size: $font-lg;
  font-weight: 600;
  background: $accent-primary;
  color: white;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  position: relative;

  &:hover {
    background: $accent-secondary;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.tap-message {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: $bg-tertiary;
  color: $text-primary;
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-sm;
  font-size: $font-base;
  white-space: nowrap;
}

@media (max-width: $breakpoint-sm) {
  .tempo-control {
    padding: $spacing-lg;
  }

  .tempo-input {
    font-size: $font-5xl;
    width: 100px;
  }

  .mark-label {
    font-size: 0.55rem;
  }
}
</style>
