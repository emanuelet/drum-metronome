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
  
  const scheduler = () => {
    if (!isPlaying.value || !audioContext.value) return;
    
    while (nextNoteTime.value < audioContext.value.currentTime + scheduleAheadTime) {
      if (pattern.value.length > 0) {
        const beatType = pattern.value[beatCounter.value % pattern.value.length];
        playBeat(beatType);
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
  };
  
  const setTempo = (newTempo: number) => {
    tempo.value = Math.max(20, Math.min(300, newTempo));
  };
  
  const setPattern = (newPattern: string[]) => {
    pattern.value = newPattern;
    beatCounter.value = 0;
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
    start,
    stop,
    setTempo,
    setPattern,
    initAudioContext
  };
}
