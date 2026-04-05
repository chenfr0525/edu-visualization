<script setup>
const props = defineProps({
  course: { type: Object, required: true,icon:{type:String,default:'fa-code'} },
});
</script>

<template>
  <el-card shadow="hover" class="course-card">
    <div class="content">
      <div class="course-icon">
        <i :class="`fas ${course.icon}`"></i>
      </div>
      <div class="course-details">
        <div class="course-title">{{ course.title }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
        </div>
        <div class="course-meta">
          <span v-for="(m, index) in course.meta" :key="index">
            <i v-if="m.icon" :class="m.icon"></i>
            {{ m.label }} {{ m.value }}
          </span>
        </div>
      </div>
      <el-button type="primary">继续学习</el-button>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.course-card {
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

    .course-icon {
      width: 60px;
      height: 60px;
      background: #e1effa;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #1d4e7c;
      margin-right: 20px;
    }

    .course-details {
      flex: 1;


      .course-title {
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 8px;
        color: #0f2d49;
      }

      .progress-bar {
        width: 100%;
        height: 10px;
        background: #e2eaf3;
        border-radius: 20px;
        margin: 12px 0 8px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: #1d4e7c;
          border-radius: 20px;
          transition: width 0.6s ease;
        }
      }



      .course-meta {
        display: flex;
        gap: 24px;
        font-size: 0.85rem;
        color: #54728c;
        margin: 10px 0 8px;
      }
    }
  }

}
</style>
