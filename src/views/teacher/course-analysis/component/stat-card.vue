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
    <div class="stat-value">{{ rate !== 0 ? rate + '%' : `${value}` }}</div>
    <div class="stat-label">{{ label }}</div>
    <slot name="content"></slot>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  flex: 1;
  min-width: 100px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 130px;

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 12px;
    color: #5f6b7a;
    margin: 4px 0 8px;
  }
}
</style>
