<script setup lang="ts">
import { stickingColorPresets } from '../composables/useStickingSettings';

defineProps<{
  presetId: string;
}>();

const emit = defineEmits<{
  'update:presetId': [value: string];
}>();
</script>

<template>
  <section class="sticking-settings" aria-label="Sticking display settings">
    <label>
      Sticking colors
      <select
        :value="presetId"
        @change="emit('update:presetId', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="preset in stickingColorPresets" :key="preset.id" :value="preset.id">
          {{ preset.name }}
        </option>
      </select>
    </label>

    <div class="color-preview" aria-label="Left, right, accent, and active sticking colors">
      <span class="left" title="Left"></span>
      <span class="right" title="Right"></span>
      <span class="accent" title="Accent"></span>
      <span class="active" title="Active"></span>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.sticking-settings {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
  align-items: end;
  padding: $spacing-md;
  background: $bg-tertiary;
  border-radius: $radius-md;

  label {
    display: grid;
    gap: $spacing-xs;
    color: $text-secondary;
    font-size: $font-base;
    font-weight: 600;
  }

  select {
    min-width: 8rem;
    padding: $spacing-sm;
    color: $text-primary;
    background: $bg-secondary;
    border: 1px solid $border-color;
    border-radius: $radius-sm;

    &:focus {
      @include input-focus;
    }
  }

  .color-preview {
    display: flex;
    gap: $spacing-xs;
    padding-bottom: $spacing-xs;

    span {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid $bg-secondary;
      border-radius: 50%;
      box-shadow: 0 0 0 1px $border-color;
    }

    .left {
      background: $beat-left;
    }

    .right {
      background: $beat-right;
    }

    .accent {
      background: $beat-accent;
    }

    .active {
      background: $beat-active;
    }
  }
}
</style>
