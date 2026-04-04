<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '0'
  },
});
</script>

<template>
  <div class="stat-item">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<style scoped lang="scss">
.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #1d4e7c;
  }

  .stat-label {
    font-size: 11px;
    color: #5f6b7a;
    margin-top: 4px;
  }
}
</style>
