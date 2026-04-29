<script setup>
const props = defineProps({
  aiAnalysis: {
    type: Object,
    required: true,
  }
});
</script>

<template>
  <div class="ai-suggestions">
    <div class="ai-section" v-if="aiAnalysis?.summary">
      <div class="ai-title">📊 总结</div>
      <div class="ai-content">{{ aiAnalysis.summary }}</div>
    </div>
    <div class="ai-section" v-if="aiAnalysis?.strengths?.length">
      <div class="ai-title">✅ 优势</div>
      <ul>
        <li v-for="item in aiAnalysis.strengths" :key="item">{{ item }}</li>
      </ul>
    </div>
    <div class="ai-section" v-if="aiAnalysis?.weaknesses?.length">
      <div class="ai-title">⚠️ 不足</div>
      <ul>
        <li v-for="item in aiAnalysis.weaknesses" :key="item">{{ item }}</li>
      </ul>
    </div>
    <div class="ai-section" v-if="aiAnalysis?.suggestions?.length">
      <div class="ai-title">💡 建议</div>
      <ul>
        <li v-for="item in aiAnalysis.suggestions" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-suggestions {
  .ai-section {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 12px;

    .ai-title {
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 15px;
    }

    .ai-content {
      line-height: 1.6;
      color: #475569;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin: 6px 0;
        line-height: 1.5;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
