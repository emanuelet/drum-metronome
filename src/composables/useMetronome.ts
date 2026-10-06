import { computed, onUnmounted, ref } from 'vue';

export const clicksPerBeatOptions = [
  0.125,
  0.25,
  0.33,
  0.5,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
] as const;

export function useMetronome() {
  const audioContext = ref<AudioContext | null>(null);
  const isPlaying = ref(false);
  const isPaused = ref(false);
  const beatCounter = ref(0);
  const subdivisionCounter = ref(0);
  const nextNoteTime = ref(0);
  const timerID = ref<number | null>(null);
  const snareNoiseBuffer = ref<AudioBuffer | null>(null);
  const lookahead = 25.0;
  const scheduleAheadTime = 0.1;

  const tempo = ref(120);
  const subdivisions = ref(1);
  const pattern = ref<string[]>([]);

  // Gap Training feature
  const gapTrainingEnabled = ref(false);
  const measuresWithClick = ref(4);
  const measuresWithoutClick = ref(2);
  const currentMeasure = ref(0);
  const isInGap = ref(false);

  // Polyrhythm feature
  const polyrhythmEnabled = ref(false);
  const leftHandPattern = ref<string[]>([]);
  const rightHandPattern = ref<string[]>([]);
  const leftHandBeat = ref(0);
  const rightHandBeat = ref(0);

  const currentBeat = computed(() => {
    if (pattern.value.length === 0) return 0;
    return beatCounter.value % pattern.value.length;
  });

  const initAudioContext = () => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume();
    }
  };

  const getSnareNoiseBuffer = () => {
    if (!audioContext.value) return null;
    if (snareNoiseBuffer.value) return snareNoiseBuffer.value;

    const buffer = audioContext.value.createBuffer(
      1,
      audioContext.value.sampleRate * 0.16,
      audioContext.value.sampleRate
    );
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index++) {
      samples[index] = Math.random() * 2 - 1;
    }
    snareNoiseBuffer.value = buffer;
    return buffer;
  };

  const createSnareSound = (isAccent: boolean, startTime: number, volumeMultiplier = 1) => {
    if (!audioContext.value) return;

    const noiseBuffer = getSnareNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = audioContext.value.createBufferSource();
    const noiseFilter = audioContext.value.createBiquadFilter();
    const noiseGain = audioContext.value.createGain();
    const body = audioContext.value.createOscillator();
    const bodyGain = audioContext.value.createGain();
    const duration = isAccent ? 0.16 : 0.11;
    const volume = (isAccent ? 0.26 : 0.18) * volumeMultiplier;

    noise.buffer = noiseBuffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(isAccent ? 1200 : 900, startTime);
    noiseGain.gain.setValueAtTime(volume, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    body.type = 'triangle';
    body.frequency.setValueAtTime(isAccent ? 240 : 200, startTime);
    body.frequency.exponentialRampToValueAtTime(110, startTime + 0.06);
    bodyGain.gain.setValueAtTime(volume * 0.55, startTime);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.value.destination);
    body.connect(bodyGain);
    bodyGain.connect(audioContext.value.destination);

    noise.start(startTime);
    noise.stop(startTime + duration);
    body.start(startTime);
    body.stop(startTime + 0.08);
  };

  const createFlamSound = (startTime: number) => {
    // A quiet grace note immediately precedes the full primary stroke.
    createSnareSound(false, startTime, 0.4);
    createSnareSound(false, startTime + 0.03);
  };

  const playBeat = (beatType: string) => {
    if (!audioContext.value) return;

    // Don't play if in gap mode
    if (gapTrainingEnabled.value && isInGap.value) return;

    const isAccent = beatType.includes('!');
    switch (beatType) {
      case 'L':
      case 'R':
      case 'L!':
      case 'R!':
        createSnareSound(isAccent, nextNoteTime.value);
        break;
      case 'F':
        createFlamSound(nextNoteTime.value);
        break;
    }
  };

  const playPolyrhythmBeats = () => {
    if (!audioContext.value) return;
    if (gapTrainingEnabled.value && isInGap.value) return;

    // Play left hand beat if pattern exists
    if (leftHandPattern.value.length > 0) {
      const leftBeat = leftHandPattern.value[leftHandBeat.value % leftHandPattern.value.length];
      if (leftBeat.includes('L')) {
        createSnareSound(leftBeat.includes('!'), nextNoteTime.value);
      }
    }

    // Play right hand beat if pattern exists
    if (rightHandPattern.value.length > 0) {
      const rightBeat = rightHandPattern.value[rightHandBeat.value % rightHandPattern.value.length];
      if (rightBeat.includes('R')) {
        createSnareSound(rightBeat.includes('!'), nextNoteTime.value);
      }
    }
  };

  const updateGapStatus = () => {
    if (!gapTrainingEnabled.value) {
      isInGap.value = false;
      return;
    }

    const totalMeasures = measuresWithClick.value + measuresWithoutClick.value;
    const measureInCycle = currentMeasure.value % totalMeasures;
    isInGap.value = measureInCycle >= measuresWithClick.value;
  };

  const scheduler = () => {
    if (!isPlaying.value || !audioContext.value) return;

    while (nextNoteTime.value < audioContext.value.currentTime + scheduleAheadTime) {
      const isFractionalRate = subdivisions.value < 1;
      const beatsPerClick = isFractionalRate ? Math.round(1 / subdivisions.value) : 1;
      const shouldPlayClick = !isFractionalRate || subdivisionCounter.value === 0;

      if (shouldPlayClick) {
        if (polyrhythmEnabled.value) {
          // Polyrhythm mode - play both hands
          playPolyrhythmBeats();
        } else {
          // Standard mode - play single pattern
          if (pattern.value.length > 0) {
            const beatType = pattern.value[beatCounter.value % pattern.value.length];
            playBeat(beatType);
          }
        }
      }

      if (isFractionalRate) {
        subdivisionCounter.value = (subdivisionCounter.value + 1) % beatsPerClick;
      } else {
        subdivisionCounter.value++;
      }

      if (isFractionalRate || subdivisionCounter.value === subdivisions.value) {
        subdivisionCounter.value = 0;

        if (polyrhythmEnabled.value) {
          leftHandBeat.value++;
          rightHandBeat.value++;

          if (
            leftHandPattern.value.length > 0 &&
            leftHandBeat.value % leftHandPattern.value.length === 0
          ) {
            currentMeasure.value++;
            updateGapStatus();
          }
        } else {
          beatCounter.value++;

          if (pattern.value.length > 0 && beatCounter.value % pattern.value.length === 0) {
            currentMeasure.value++;
            updateGapStatus();
          }
        }
      }

      nextNoteTime.value += 60.0 / tempo.value / Math.max(1, subdivisions.value);
    }

    timerID.value = window.setTimeout(scheduler, lookahead);
  };

  const start = () => {
    if (isPlaying.value) return;

    initAudioContext();
    isPlaying.value = true;
    isPaused.value = false;
    beatCounter.value = 0;
    subdivisionCounter.value = 0;
    leftHandBeat.value = 0;
    rightHandBeat.value = 0;
    currentMeasure.value = 0;
    isInGap.value = false;
    nextNoteTime.value = audioContext.value!.currentTime;
    scheduler();
  };

  const clearScheduler = () => {
    if (timerID.value) {
      clearTimeout(timerID.value);
      timerID.value = null;
    }
  };

  const pause = () => {
    isPlaying.value = false;
    isPaused.value = true;
    clearScheduler();
  };

  const resume = () => {
    if (!isPaused.value) return;

    initAudioContext();
    isPlaying.value = true;
    isPaused.value = false;
    nextNoteTime.value = audioContext.value!.currentTime;
    scheduler();
  };

  const stop = () => {
    isPlaying.value = false;
    isPaused.value = false;
    clearScheduler();
    beatCounter.value = 0;
    subdivisionCounter.value = 0;
    leftHandBeat.value = 0;
    rightHandBeat.value = 0;
    currentMeasure.value = 0;
    isInGap.value = false;
  };

  const setTempo = (newTempo: number) => {
    tempo.value = Math.max(20, Math.min(300, newTempo));
  };

  const setSubdivisions = (newSubdivisions: number) => {
    subdivisions.value = clicksPerBeatOptions.reduce((closest, option) =>
      Math.abs(option - newSubdivisions) < Math.abs(closest - newSubdivisions)
        ? option
        : closest
    );
    subdivisionCounter.value = 0;
  };

  const setPattern = (newPattern: string[]) => {
    pattern.value = newPattern;
    beatCounter.value = 0;
  };

  const toggleGapTraining = (enabled: boolean) => {
    gapTrainingEnabled.value = enabled;
    if (!enabled) {
      isInGap.value = false;
      currentMeasure.value = 0;
    }
  };

  const setGapMeasures = (withClick: number, withoutClick: number) => {
    measuresWithClick.value = Math.max(1, withClick);
    measuresWithoutClick.value = Math.max(1, withoutClick);
    currentMeasure.value = 0;
    isInGap.value = false;
  };

  const togglePolyrhythm = (enabled: boolean) => {
    polyrhythmEnabled.value = enabled;
    if (!enabled) {
      leftHandBeat.value = 0;
      rightHandBeat.value = 0;
    }
  };

  const setPolyrhythmPatterns = (leftPattern: string[], rightPattern: string[]) => {
    leftHandPattern.value = leftPattern;
    rightHandPattern.value = rightPattern;
    leftHandBeat.value = 0;
    rightHandBeat.value = 0;
  };

  onUnmounted(() => {
    stop();
    if (audioContext.value) {
      audioContext.value.close();
    }
  });

  return {
    isPlaying,
    isPaused,
    currentBeat,
    tempo,
    subdivisions,
    pattern,
    // Gap training
    gapTrainingEnabled,
    measuresWithClick,
    measuresWithoutClick,
    isInGap,
    currentMeasure,
    // Polyrhythm
    polyrhythmEnabled,
    leftHandPattern,
    rightHandPattern,
    leftHandBeat,
    rightHandBeat,
    // Methods
    start,
    pause,
    resume,
    stop,
    setTempo,
    setSubdivisions,
    setPattern,
    initAudioContext,
    toggleGapTraining,
    setGapMeasures,
    togglePolyrhythm,
    setPolyrhythmPatterns,
  };
}
