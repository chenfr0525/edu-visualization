<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    default: 0
  }
});
</script>

<template>
  <div class="stat-card">
    <div class="stat-value">{{ rate !== 0 ? `${rate}%` : value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1d4e7c;
  }

  .stat-label {
    font-size: 12px;
    color: #5f6b7a;
    margin-top: 4px;
  }
}
</style>
