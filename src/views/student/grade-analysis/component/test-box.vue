<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['INPROGRESS', 'COMPLETED', 'PREPARE'].includes(value)
  },
  exam: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <el-card shadow="hover" class="exam-item">
    <div class="exam-content">
      <div class="exam-header">
        <span class="exam-title">{{ exam.type }} - {{ exam.course }}</span>
        <span class="exam-badge"
          :class="{ 'badge-inprogress': status === 'INPROGRESS', 'badge-completed': status === 'COMPLETED', 'badge-prepare': status === 'PREPARE' }">{{
            status === 'INPROGRESS' ? '进行中' : status === 'COMPLETED' ? '已完成' : '待开始' }} </span>
        <div class="exam-meta">
          <span><i class="far fa-clock"></i> {{ exam.date }}</span>
        </div>
      </div>
      <div class="exam-actions">
        <el-button type="primary" size="large"><i class="far fa-eye"></i> 查看详情</el-button>
        <el-button size="large" :disabled="status !== 'COMPLETED'"><i class="fas fa-chart-line"></i> 错题统计</el-button>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.exam-item {
  background: #f9fdff;
  margin-bottom: 16px;
  border: 1px solid #e4eef9;

  .exam-content {
    width: 100%;
    height: 100%;
    padding: 20px;

    .exam-header {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;

      .exam-title {
        font-weight: 700;
        font-size: 1.1rem;
      }

      .exam-badge {
        background: #1d4e7c;
        color: white;
        padding: 4px 16px;
        border-radius: 30px;
        font-size: 0.8rem;

        &.badge-completed {
          background: #647e9e;
          ;
        }

        &.badge-prepare {
          background: #9e9e9e;
        }
      }

      .exam-meta {
        margin-left: auto;
        color: #54728c;
      }

    }

    .exam-actions {
      display: flex;
      gap: 12px;
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px dashed #caddf0;

      .btn-sm {
        border: 1px solid #b3cbe5;
        background: white;
        padding: 8px 22px;
        border-radius: 40px;
        color: #1d4e7c;
        font-size: 0.9rem;
        cursor: default;
      }

      .btn-primary-sm {
        background: #1d4e7c;
        color: white;
        padding: 8px 24px;
        border-radius: 40px;
        border: none;
        font-size: 0.9rem;
        cursor: default;
      }
    }
  }

}
</style>
