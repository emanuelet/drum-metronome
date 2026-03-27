import { ref, computed, onUnmounted } from 'vue';

export function useMetronome() {
  const audioContext = ref<AudioContext | null>(null);
  const isPlaying = ref(false);
  const beatCounter = ref(0);
  const nextNoteTime = ref(0);
  const timerID = ref<number | null>(null);
  const lookahead = 25.0;
  const scheduleAheadTime = 0.1;

  const tempo = ref(120);
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

  const createClickSound = (frequency: number, volume: number, duration: number) => {
    if (!audioContext.value) return;

    const oscillator = audioContext.value.createOscillator();
    const gainNode = audioContext.value.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.value.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    const now = audioContext.value.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const playBeat = (beatType: string) => {
    if (!audioContext.value) return;

    // Don't play if in gap mode
    if (gapTrainingEnabled.value && isInGap.value) return;

    // Soft click sounds
    switch (beatType) {
      case 'L':
        createClickSound(800, 0.5, 0.05);
        break;
      case 'R':
        createClickSound(800, 0.5, 0.05);
        break;
      case 'L!':
        createClickSound(1200, 0.8, 0.08);
        break;
      case 'R!':
        createClickSound(1200, 0.8, 0.08);
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
        const isAccent = leftBeat.includes('!');
        createClickSound(isAccent ? 1000 : 700, isAccent ? 0.6 : 0.4, 0.05);
      }
    }

    // Play right hand beat if pattern exists
    if (rightHandPattern.value.length > 0) {
      const rightBeat = rightHandPattern.value[rightHandBeat.value % rightHandPattern.value.length];
      if (rightBeat.includes('R')) {
        const isAccent = rightBeat.includes('!');
        createClickSound(isAccent ? 1300 : 900, isAccent ? 0.6 : 0.4, 0.05);
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
        
        // Update beat counters for polyrhythm
        leftHandBeat.value++;
        rightHandBeat.value++;
        
        // Update measure counter for gap training
        if (leftHandPattern.value.length > 0) {
          const beatsPerMeasure = leftHandPattern.value.length;
          if (leftHandBeat.value % beatsPerMeasure === 0) {
            currentMeasure.value++;
            updateGapStatus();
          }
        }
      } else {
        // Standard mode - play single pattern
        if (pattern.value.length > 0) {
          const beatType = pattern.value[beatCounter.value % pattern.value.length];
          playBeat(beatType);
          
          // Update measure counter for gap training
          if (beatCounter.value % pattern.value.length === 0 && beatCounter.value > 0) {
            currentMeasure.value++;
            updateGapStatus();
          }
        }
      }

      const secondsPerBeat = 60.0 / tempo.value;
      nextNoteTime.value += secondsPerBeat;
      beatCounter.value++;
    }

    timerID.value = window.setTimeout(scheduler, lookahead);
  };

  const start = () => {
    if (isPlaying.value) return;

    initAudioContext();
    isPlaying.value = true;
    beatCounter.value = 0;
    leftHandBeat.value = 0;
    rightHandBeat.value = 0;
    currentMeasure.value = 0;
    isInGap.value = false;
    nextNoteTime.value = audioContext.value!.currentTime;
    scheduler();
  };

  const stop = () => {
    isPlaying.value = false;
    if (timerID.value) {
      clearTimeout(timerID.value);
      timerID.value = null;
    }
    beatCounter.value = 0;
    leftHandBeat.value = 0;
    rightHandBeat.value = 0;
    currentMeasure.value = 0;
    isInGap.value = false;
  };

  const setTempo = (newTempo: number) => {
    tempo.value = Math.max(20, Math.min(300, newTempo));
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
    currentBeat,
    tempo,
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
    stop,
    setTempo,
    setPattern,
    initAudioContext,
    toggleGapTraining,
    setGapMeasures,
    togglePolyrhythm,
    setPolyrhythmPatterns,
  };
}
