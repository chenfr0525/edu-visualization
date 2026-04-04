<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="info-item">
    <span class="label">{{ label }}</span>
    <span class="value">{{ value }}</span>
  </div>
</template>

<style scoped lang="scss">
.info-item {
  display: flex;
  align-items: baseline;
  gap: 8px;

  .label {
    color: #5f6b7a;
    font-size: 0.85rem;
  }

  .value {
    font-weight: 600;
    color: #1e293b;
  }
}
</style>
