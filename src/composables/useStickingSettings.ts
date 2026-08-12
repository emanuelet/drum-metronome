import { onMounted, onUnmounted, ref, watch } from 'vue';

type ColorScheme = 'light' | 'dark';
type StickingColors = Record<'left' | 'right' | 'accent' | 'active', string>;

export type StickingColorPreset = {
  id: string;
  name: string;
  colors: Record<ColorScheme, StickingColors>;
};

export const stickingColorPresets: StickingColorPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    colors: {
      light: { left: '#4dabf7', right: '#ff8787', accent: '#9b59b6', active: '#40c057' },
      dark: { left: '#74c0fc', right: '#ffa8a8', accent: '#d0bfff', active: '#69db7c' },
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      light: { left: '#1971c2', right: '#f08c00', accent: '#0c8599', active: '#099268' },
      dark: { left: '#4dabf7', right: '#ffd43b', accent: '#3bc9db', active: '#38d9a9' },
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      light: { left: '#e64980', right: '#f76707', accent: '#f59f00', active: '#2f9e44' },
      dark: { left: '#faa2c1', right: '#ffa94d', accent: '#ffd43b', active: '#69db7c' },
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      light: { left: '#2b8a3e', right: '#c92a2a', accent: '#e67700', active: '#0ca678' },
      dark: { left: '#69db7c', right: '#ff8787', accent: '#fcc419', active: '#63e6be' },
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: {
      light: { left: '#0b7285', right: '#d6336c', accent: '#ae3ec9', active: '#37b24d' },
      dark: { left: '#22b8cf', right: '#f783ac', accent: '#e599f7', active: '#51cf66' },
    },
  },
];

const storageKey = 'drum-metronome-sticking-settings';
const rowOptions = new Set([2, 4, 6, 8]);

type StoredSettings = {
  presetId?: string;
  beatsPerRow?: number;
};

export function useStickingSettings() {
  const presetId = ref('classic');
  const beatsPerRow = ref(4);
  let colorSchemeQuery: MediaQueryList | null = null;

  const applyColors = () => {
    if (!colorSchemeQuery) return;

    const preset =
      stickingColorPresets.find((item) => item.id === presetId.value) ?? stickingColorPresets[0];
    const forcedTheme = document.documentElement.dataset.theme;
    const colorScheme =
      forcedTheme === 'dark' || (forcedTheme !== 'light' && colorSchemeQuery.matches)
        ? 'dark'
        : 'light';
    const colors = preset.colors[colorScheme];
    const root = document.documentElement.style;

    root.setProperty('--beat-left', colors.left);
    root.setProperty('--beat-right', colors.right);
    root.setProperty('--beat-accent', colors.accent);
    root.setProperty('--beat-active', colors.active);
  };

  const saveSettings = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ presetId: presetId.value, beatsPerRow: beatsPerRow.value })
    );
  };

  onMounted(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const settings = JSON.parse(stored) as StoredSettings;
        if (stickingColorPresets.some((preset) => preset.id === settings.presetId)) {
          presetId.value = settings.presetId!;
        }
        if (rowOptions.has(settings.beatsPerRow ?? 0)) {
          beatsPerRow.value = settings.beatsPerRow!;
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', applyColors);
    window.addEventListener('themechange', applyColors);
    applyColors();
  });

  onUnmounted(() => {
    colorSchemeQuery?.removeEventListener('change', applyColors);
    window.removeEventListener('themechange', applyColors);
  });

  watch([presetId, beatsPerRow], () => {
    applyColors();
    saveSettings();
  });

  return { presetId, beatsPerRow };
}
