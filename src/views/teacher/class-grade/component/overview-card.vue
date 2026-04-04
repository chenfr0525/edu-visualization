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
  },
  type: {
    type: String,
  }
});
</script>

<template>
  <el-card :class="`overview-card ${type}`">
    <div class="overview-value">{{ rate !== 0 ? `${rate}%` : `${value}` }}</div>
    <div class="overview-label">{{ label }}</div>
    <slot name="content"></slot>
  </el-card>
</template>

<style scoped lang="scss">
.overview-card {
  .overview-value {
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
  }

  .overview-label {
    font-size: 12px;
    color: #5f6b7a;
    margin: 8px 0 4px;
  }

  &.primary {
    background: linear-gradient(135deg, #1d4e7c 0%, #2d6a9f 100%);
    color: white;

    .overview-label {
      color: rgba(255, 255, 255, 0.8);
    }


    .overview-value {
      color: white;
    }
  }
}
</style>
