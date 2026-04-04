<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  title: { type: String, required: true, default: '' },
  icon: { type: String, required: true, default: 'fa-book-open' },
  desc: { type: String, required: true, default: '' },
  url: { type: String, required: true, default: '' }
});
</script>

<template>
  <el-card shadow="hover" class="exercise-card">
    <div class="exercise-content">
      <div class="card-left">
        <div class="title">{{ title }}</div>
        <div class="desc">
          <i :class="`fas ${icon}`" style="color: #1d4e7c;margin-right: 10px;"></i>
          <span class="text">{{ desc }}</span>
        </div>
      </div>

      <div class="card-right">
        <el-button type="primary" @click="handleGo">去完成</el-button>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.exercise-card {
  background: #f2f8ff;
  padding: 20px;
  border: 1px solid #dae8f5;

  .exercise-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-left {
      .title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #1d4e7c;
        margin: 8px 0 4px;
      }
    }
  }

}
</style>
