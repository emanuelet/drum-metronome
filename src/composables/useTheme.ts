import { onMounted, ref, watch } from 'vue';

export type ThemePreference = 'light' | 'dark' | 'system';

const storageKey = 'drum-metronome-theme';

export function useTheme() {
  const preference = ref<ThemePreference>('system');

  const applyTheme = (theme: ThemePreference) => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.dataset.theme = theme;
    }
    window.dispatchEvent(new Event('themechange'));
  };

  onMounted(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      preference.value = stored;
    }
    applyTheme(preference.value);
  });

  watch(preference, (theme) => {
    applyTheme(theme);
    localStorage.setItem(storageKey, theme);
  });

  return { preference };
}
