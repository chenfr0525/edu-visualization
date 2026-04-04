<script setup>
import { ref, computed, onMounted } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
const containerRef = ref(null)
const searchModel = ref({
  courseType: '全部课程',
})
const handleExportImage = () => {
  exportToImage(containerRef.value, '作业跟踪')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '作业跟踪')
}
</script>

<template>
  <div class="homework-tracking" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="课程状态" prop="courseType">
          <el-select size="large" placeholder="搜索课程..." style="width: 240px" v-model="searchModel.courseType">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程状态" prop="courseType">
          <el-select size="large" placeholder="搜索课程..." style="width: 240px" v-model="searchModel.courseType">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">搜索
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
        </el-button>
        <el-button-group>
          <el-button size="large" type="primary" :icon="Picture" @click="handleExportImage">导出图片</el-button>
          <el-button size="large" @click="handleExportPDF">导出PDF
            <template #icon>
              <i class="fas fa-file-pdf"></i>
            </template>
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.homework-tracking {
  width: 100%;

  .container-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;

    .select-box {
      display: flex;
      align-items: center;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }
}
</style>
