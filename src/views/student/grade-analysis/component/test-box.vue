<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['UPCOMING', 'COMPLETED', 'ONGOING'].includes(value)
  },
  exam: {
    type: Object,
    required: true
  },
  handleClick: {
    type: Function,
    required: false
  }
});
const getTypeName = (type) => {
  switch (type) {
    case 'MIDTERM':
      return '期中考试';
    case 'FINAL':
      return '期末考试';
    case 'UNIT':
      return '单元测试';
    case 'MONTHLY':
      return '月考';
    case 'MOCK':
      return '模拟考试';
    default:
      return '测试';
  }
}
</script>

<template>
  <el-card shadow="hover" class="exam-item">
    <div class="exam-content">
      <div class="exam-header">
        <span class="exam-title">{{ getTypeName(exam.type) }} - {{ exam.courseName }}</span>
        <span class="exam-badge"
          :class="{ 'badge-inprogress': status === 'ONGOING', 'badge-completed': status === 'COMPLETED', 'badge-prepare': status === 'UPCOMING' }">{{
            status === 'UPCOMING' ? '待开始' : status === 'ONGOING' ? '进行中' : '已完成' }} </span>
        <div class="exam-meta">
          <span><i class="far fa-clock"></i> {{ exam.examDate?.slice(0, 3)?.join('-') }}</span>
        </div>
      </div>
      <div class="exam-footer">
        <div class="exam-score" v-if="exam?.myScore">
          <h4>我的成绩:<p>{{ exam.myScore }}</p>
          </h4>
          <h4>班级排名:<p>{{ exam.classRank }}</p>
          </h4>
        </div>
        <div class="exam-actions">
          <el-button type="primary" size="large" @click="handleClick(exam)"><i class="far fa-eye"></i> 查看详情</el-button>
        </div>
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

    .exam-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 120px;

      .exam-score {
        display: flex;
        gap: 20px;

        h4 {
          margin-top: 60px;
          font-weight: 500;
          color: #1d4e7c;

          p {
            font-size: 1.2rem;
            font-weight: 700;
          }
        }
      }

      .exam-actions {
        display: flex;
        gap: 12px;
        border-top: 1px dashed #caddf0;
        margin-top: 20px;

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

}
</style>
