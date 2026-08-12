<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue';
import { useTheme, type ThemePreference } from '../composables/useTheme';

const { preference } = useTheme();

const themes: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
  { value: 'system', label: 'Use system theme', icon: Monitor },
];
</script>

<template>
  <div class="theme-toggle" role="group" aria-label="Theme preference">
    <button
      v-for="theme in themes"
      :key="theme.value"
      type="button"
      :class="{ 'is-active': preference === theme.value }"
      :aria-label="theme.label"
      :title="theme.label"
      @click="preference = theme.value"
    >
      <component :is="theme.icon" :size="18" />
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.theme-toggle {
  display: flex;
  padding: 3px;
  background: $bg-tertiary;
  border: 1px solid $border-color;
  border-radius: $radius-md;

  button {
    display: grid;
    width: 2rem;
    height: 2rem;
    padding: 0;
    color: $text-muted;
    background: transparent;
    border: 0;
    border-radius: $radius-sm;
    cursor: pointer;

    place-items: center;

    &:hover {
      color: $text-primary;
    }

    &.is-active {
      color: white;
      background: $accent-primary;
    }
  }
}
</style>
