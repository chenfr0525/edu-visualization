<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  statNum: { type: Number },
  icon: { type: String, },
  title: { type: String, required: true, default: '' },
  rate: { type: Number, default: null },
});
</script>

<template>
  <el-card shadow="hover" class="stat-box">
    <i v-if="icon" :class="`fas ${icon}`" style="color: #1d4e7c"></i>
    <div class="stat-value" v-if="statNum">{{ statNum }}</div>
    <div class="stat-value" v-if="rate !== null">{{ rate }}%</div>
    <div>{{ title }}</div>
  </el-card>
</template>

<style scoped lang="scss">
.stat-box {
  background: #f9fcff;
  padding: 20px;
  border: 1px solid #eef2f6;

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1d4e7c;
    margin: 8px 0 4px;
  }
}
</style>
