<script setup>
const props = defineProps({
  number: { type: String, required: true, default: "0" },
  label: { type: String, required: true, default: '' },
});
</script>

<template>
  <el-card shadow="hover" class="progress-stats">
    <div class="content">
      <span class="stat-number">{{ number }}</span>
      <span class="stat-label"> {{ label }}</span>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.progress-stats {
  background: #fff;
  padding: 20px;
  border: 1px solid #dae8f5;
  height: 100%;


  .content {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1d4e7c;
    }

    .stat-label {
      color: #647e9e;
      font-size: 1rem;
    }
  }

}
</style>
