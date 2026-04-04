<script setup>

const props = defineProps({
  icon: { type: String, default: 'fa-users' },
  title: { type: String, required: true },
  value: { type: Number, required: true },
  type: { type: String, default: 'total' },
});
</script>

<template>
  <el-card shadow="hover" class="stats-card">
    <div class="stats-content">
      <div :class="`stat-icon ${type}`">
        <i :class="`fas ${icon}`"></i>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ title }}</div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.stats-card {
  background: white;
  padding: 20px;


  .stats-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-icon.total {
      background: #e6f4ff;
      color: #1d4e7c;
    }

    .stat-icon.active {
      background: #e8f5e9;
      color: #67c23a;
    }

    .stat-icon.frozen {
      background: #ffebee;
      color: #f56c6c;
    }

    .stat-icon.pending {
      background: #fff3e0;
      color: #e6a23c;
    }

    .stat-icon.ongoing {
      background: #e8f5e9;
      color: #409eff;
    }

    .stat-icon.pending {
      background: #fff3e0;
      color: #e6a23c;
    }

    .stat-icon.completed {
      background: #e8f5e9;
      color: #67c23a;
    }

    .stat-icon.avg-score {
      background: #f3e5f5;
      color: #9c27b0;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: #64748b;
        margin-top: 4px;
      }
    }
  }
}
</style>
