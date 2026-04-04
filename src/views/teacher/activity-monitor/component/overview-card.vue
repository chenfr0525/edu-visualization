<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: 'blue',
  },
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
  <el-card shadow="hover" class="overview-card">
    <div class="overview-content">
      <div :class="['overview-icon', iconColor]">
        <i :class="`fas ${icon}`"></i>
      </div>
      <div class="overview-info">
        <div class="overview-value">{{ value }}</div>
        <div class="overview-label">{{ label }}</div>
        <slot name="content"></slot>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.overview-card {
  background: white;

  .overview-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 16px;

    .overview-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.blue {
        background: #e6f4ff;
        color: #409eff;
      }

      &.green {
        background: #e8f5e9;
        color: #67c23a;
      }

      &.orange {
        background: #fff3e0;
        color: #e6a23c;
      }

      &.red {
        background: #ffebee;
        color: #f56c6c;
      }

      &.purple {
        background: #f3e5f5;
        color: #9c27b0;
      }
    }

    .overview-info {
      flex: 1;

      .overview-value {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
      }

      .overview-label {
        font-size: 12px;
        color: #5f6b7a;
        margin-top: 4px;
      }
    }
  }


}
</style>
