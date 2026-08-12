import { computed, onUnmounted, ref } from 'vue';

export function useMetronome() {
  const audioContext = ref<AudioContext | null>(null);
  const isPlaying = ref(false);
  const isPaused = ref(false);
  const beatCounter = ref(0);
  const subdivisionCounter = ref(0);
  const nextNoteTime = ref(0);
  const timerID = ref<number | null>(null);
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

  const createClickSound = (isAccent: boolean, startTime: number) => {
    if (!audioContext.value) return;

    const oscillator = audioContext.value.createOscillator();
    const gainNode = audioContext.value.createGain();
    const duration = isAccent ? 0.09 : 0.055;
    const startFrequency = isAccent ? 1800 : 1100;
    const endFrequency = isAccent ? 650 : 350;
    const volume = isAccent ? 0.32 : 0.22;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.value.destination);

    oscillator.type = isAccent ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(startFrequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
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
        createClickSound(isAccent, nextNoteTime.value);
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
        createClickSound(leftBeat.includes('!'), nextNoteTime.value);
      }
    }

    // Play right hand beat if pattern exists
    if (rightHandPattern.value.length > 0) {
      const rightBeat = rightHandPattern.value[rightHandBeat.value % rightHandPattern.value.length];
      if (rightBeat.includes('R')) {
        createClickSound(rightBeat.includes('!'), nextNoteTime.value);
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

      subdivisionCounter.value++;
      if (subdivisionCounter.value === subdivisions.value) {
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

      nextNoteTime.value += 60.0 / tempo.value / subdivisions.value;
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
    subdivisions.value = Math.max(1, Math.min(16, Math.round(newSubdivisions)));
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
