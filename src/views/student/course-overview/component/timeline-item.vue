<script setup>
const props = defineProps({
  item: { type: Object, required: true, default: () => ({}) },
});
</script>

<template>
  <el-card shadow="hover" class="timeline-item">
    <div class="content">
      <div class="timeline-badge"><i :class="item.icon"></i></div>
      <div class="timeline-content">
        <strong>{{ item.title }}</strong>
        <div>{{ item.detail }}</div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.timeline-item {
  background: #fff;
  padding: 20px;
  border: 1px solid #cee2f5;

  .content {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    padding: 10px 0;

    .timeline-badge {
      width: 48px;
      height: 48px;
      background: #e1effa;
      border-radius: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1d4e7c;
    }

    .timeline-content {
      flex: 1;

      strong {
        color: #1d3d62;
      }

      .timeline-time {
        float: right;
        color: #6d8eb0;
        font-size: 0.85rem;
      }
    }
  }

}
</style>
