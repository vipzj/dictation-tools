<template>
  <div class="tag-color-picker">
    <div class="text-caption q-mb-sm">{{ $t('tagManagement.selectColor') }}</div>
    <div class="color-palette">
      <button
        v-for="color in predefinedColors"
        :key="color"
        class="color-option"
        :class="{ 'color-option--selected': modelValue === color }"
        :style="{ backgroundColor: color }"
        :aria-label="`Select ${color}`"
        :aria-pressed="modelValue === color"
        type="button"
        @click="selectColor(color)"
      >
        <q-icon
          v-if="modelValue === color"
          name="check"
          class="color-option__check"
          size="sm"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [color: string]
}>()

const predefinedColors = [
  '#1976D2', // Blue
  '#388E3C', // Green
  '#F57C00', // Orange
  '#D32F2F', // Red
  '#7B1FA2', // Purple
  '#0288D1', // Light Blue
  '#689F38', // Light Green
  '#FFA000', // Amber
  '#C2185B', // Pink
  '#455A64', // Blue Grey
  '#00796B', // Teal
  '#6D4C41', // Brown
  '#5D4037', // Dark Brown
  '#37474F', // Dark Grey
  '#512DA8', // Deep Purple
  '#E64A19', // Deep Orange
]

function selectColor(color: string) {
  emit('update:modelValue', color)
}
</script>

<style lang="scss" scoped>
.tag-color-picker {
  width: 100%;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 12px;
  width: 100%;
}

.color-option {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.05);
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--q-primary);
    outline-offset: 2px;
  }

  &--selected {
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }

  &__check {
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    font-size: 20px;
  }
}

// Modal-specific optimizations
@media (max-width: 768px) {
  .color-palette {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 16px;
  }

  .color-option {
    width: 48px;
    height: 48px;

    &:hover {
      transform: scale(1.1);
    }

    &__check {
      font-size: 22px;
    }
  }
}

// Touch-friendly improvements
@media (hover: none) and (pointer: coarse) {
  .color-option {
    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.9);
    }
  }
}
</style>