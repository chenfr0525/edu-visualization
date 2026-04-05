<script setup lang="js">
import { ref, onMounted, computed, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import EChart from '@/components/EChart.vue'
import ProgressStatus from './component/progress-status.vue'
import CourseCard from './component/course-card.vue'
import TimelineItem from './component/timeline-item.vue'
import { Picture } from '@element-plus/icons-vue'
import { courseApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage } from 'element-plus'

const containerRef = ref(null)
const authStore = useAuthStore()
const loading = ref(false)

// 数据状态
const overallStats = ref({
  overallProgress: 0,
  completedModules: 0,
  totalModules: 0,
  remainingModules: 0,
  stats: []
})

const courses = ref([])
const timeline = ref([])
const studyTimeData = ref({
  days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  hours: [0, 0, 0, 0, 0, 0, 0]
})
const statusOptions = ref([])

const searchModel = ref({
  courseType: 'all',
})

// 整体进度统计
const loadOverallStats = async () => {
  try {
    const res = await courseApi.getOverallStats(authStore.userId)
    if (res && res.data) {
      overallStats.value = res.data
    }
  } catch (error) {
    console.error('加载整体进度失败:', error)
  }
}

// 课程列表
const loadCourses = async () => {
  try {
    const res = await courseApi.getCourseList(authStore.userId, searchModel.value.status)
    if (res && res.data) {
      courses.value = res.data
    }
  } catch (error) {
    console.error('加载课程列表失败:', error)
  }
}

// 学习动态
const loadTimeline = async () => {
  try {
    const res = await courseApi.getTimeline(authStore.userId, 1, 4)
    if (res && res.data) {
      timeline.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载学习动态失败:', error)
  }
}

// 学习时间分布
const loadStudyTime = async () => {
  try {
    const res = await courseApi.getStudyTime(authStore.userId)
    if (res && res.data) {
      studyTimeData.value = res.data
    }
  } catch (error) {
    console.error('加载学习时间失败:', error)
  }
}

// 加载状态选项
const loadStatusOptions = async () => {
  try {
    const res = await courseApi.getStatusOptions()
    if (res && res.data) {
      statusOptions.value = res.data
    }
  } catch (error) {
    console.error('加载状态选项失败:', error)
  }
}

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadOverallStats(),
      loadCourses(),
      loadTimeline(),
      loadStudyTime()
    ])
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 环图数据
const donutData = computed(() => ({
  tooltip: { show: true, formatter: '{b}: {d}%' },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['70%', '90%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { scale: false },
      data: [
        { value: overallStats.value.overallProgress, name: '已完成', itemStyle: { color: '#1d4e7c' } },
        { value: 100 - overallStats.value.overallProgress, name: '未完成', itemStyle: { color: '#d8e5f0' } }
      ]
    }
  ]
}))

// 学习时间柱状图
const studyTimeChart = computed(() => ({
  title: {
    text: "近7天学习时间分布",
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>学习时长: {c} 小时'
  },
  legend: { show: false },
  grid: {
    left: '10%',
    right: '5%',
    top: '15%',
    bottom: '5%',
    containLabel: true
  },
  xAxis: {
    data: studyTimeData.value.days,
    axisLabel: {
      fontSize: 12
    }
  },
  yAxis: {
    name: '学习时长 (小时)',
    axisLabel: {
      formatter: '{value}h'
    }
  },
  series: [
    {
      data: studyTimeData.value.hours,
      type: "bar",
      color: "#1d4e7c",
      barWidth: '50%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}h'
      }
    }
  ]
}))

// 处理搜索
const handleSearch = () => {
  refreshData()
}

const handleExportImage = () => {
  exportToImage(containerRef.value, '课程概览')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '课程概览')
}

// 监听状态变化
watch(() => searchModel.value.status, () => {
  loadCourses()
})

onMounted(async () => {
  await loadStatusOptions()
  await refreshData()
})
</script>

<template>
  <div class="course-container" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="课程状态" prop="courseType">
          <el-select size="large" placeholder="搜索课程..." style="width: 240px" v-model="searchModel.courseType"
            @change="handleSearch">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
    <el-card class="progress-card" shadow="hover">
      <el-row :gutter="20">
        <el-col :span="6">
          <EChart :options="donutData" height="255px" />
        </el-col>
        <el-col :span="18">
          <div class="progress-info">
            <h2>整体学习进度 {{ overallStats.overallProgress }}%</h2>
            <p>已完成 {{ overallStats.completedModules }}/{{ overallStats.totalModules }} 个模块 · 剩余 {{
              overallStats.remainingModules }} 个模块</p>
            <div class="status-list">
              <ProgressStatus v-for="stat in overallStats.stats" :key="stat.label" :number="stat.number"
                :label="stat.label" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div class="course-grid-section">
      <h3 class="section-header">
        <i class="fas fa-book-open" style="margin-right: 8px"></i> 我的课程
      </h3>
      <el-empty v-if="courses.length === 0" description="暂无课程" />
      <el-row v-else :gutter="20">
        <el-col :span="12" v-for="course in courses" :key="course.id" style="margin-bottom: 20px;">
          <CourseCard :course="course" />
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20">
      <el-col :span="10">
        <el-card shadow="hover" class="timeline-card">
          <div class="section-header">
            <h4>
              <i class="fas fa-history"></i> 最近学习动态
            </h4>
          </div>
          <el-timeline v-if="timeline.length > 0">
            <el-timeline-item v-for="item in timeline" :key="item.id" :timestamp="item.time" placement="top"
              :type="item.type === 'grade' ? 'primary' : 'info'">
              <TimelineItem :item="item" />
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无动态" :image-size="80" />
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="hover">
          <EChart :options="studyTimeChart" height="500px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.course-container {
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

  .progress-card {
    background: #f3f9ff;

    .progress-info {
      flex: 1;
      min-width: 240px;

      h2 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1d4e7c;
        margin-bottom: 8px;
      }

      p {
        color: #3f6185;
        margin-bottom: 20px;
      }

      .status-list {
        display: flex;
        gap: 20px;
        height: 100px;
      }
    }
  }

  .timeline-card {
    background: #f9fdff;
    border: 1px solid #e2effb;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 1.2rem;

      i {
        color: #1d4e7c
      }
    }
  }
}
</style>
