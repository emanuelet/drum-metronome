import { ref } from 'vue';

export function useTapTempo() {
  const tapTimes = ref<number[]>([]);
  const tapTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = ref(0);
  
  const TAP_TIMEOUT_MS = 2000;
  const MIN_TAPS = 2;
  
  const calculateBPM = (): number | null => {
    if (tapTimes.value.length < MIN_TAPS) return null;
    
    const intervals: number[] = [];
    for (let i = 1; i < tapTimes.value.length; i++) {
      intervals.push(tapTimes.value[i] - tapTimes.value[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval);
    
    return Math.max(20, Math.min(300, bpm));
  };
  
  const tap = (): number | null => {
    const now = Date.now();
    
    // Reset if too much time has passed since last tap
    if (lastTapTime.value && now - lastTapTime.value > TAP_TIMEOUT_MS) {
      tapTimes.value = [];
    }
    
    tapTimes.value.push(now);
    lastTapTime.value = now;
    
    // Clear existing timeout
    if (tapTimeout.value) {
      clearTimeout(tapTimeout.value);
    }
    
    // Set new timeout to reset tap times
    tapTimeout.value = setTimeout(() => {
      tapTimes.value = [];
      lastTapTime.value = 0;
    }, TAP_TIMEOUT_MS);
    
    return calculateBPM();
  };
  
  const reset = () => {
    tapTimes.value = [];
    lastTapTime.value = 0;
    if (tapTimeout.value) {
      clearTimeout(tapTimeout.value);
      tapTimeout.value = null;
    }
  };
  
  return {
    tap,
    reset,
    tapCount: () => tapTimes.value.length
  };
}
