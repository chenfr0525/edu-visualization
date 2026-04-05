<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
import TestBox from './component/test-box.vue'
import EChart from '@/components/EChart.vue'
import { gradeApi } from '@/api/index'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage } from 'element-plus'

const containerRef = ref(null)
const authStore = useAuthStore()
const loading = ref(false)

// 搜索表单
const searchModel = ref({
  term: 'all',
  status: 'all',
  course: 'all',
})
// 选项数据
const termOptions = ref([])
const statusOptions = ref([])
const courseOptions = ref([])

// 考试列表
const examList = ref([])

// 成绩分布数据
const gradeDistribution = ref({
  distribution: [0, 0, 0, 0, 0],
  stats: {
    average: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
    excellentRate: 0
  }
})

// 我的成绩趋势
const myGradeTrend = ref([])
const selectedCourse = ref('')

// 成绩分布图表配置
const gradeChartOption = computed(() => ({
  title: {
    text: '成绩分布快速预览',
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>人数: {c}人',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '10%',
    right: '5%',
    top: '15%',
    bottom: '5%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['<60', '60-69', '70-79', '80-89', '90-100'],
    axisLabel: {
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    name: '人数',
    axisLabel: {
      fontSize: 11
    }
  },
  series: [
    {
      type: 'bar',
      data: gradeDistribution.value.distribution,
      itemStyle: {
        color: '#1d4e7c',
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}人'
      }
    }
  ]
}))


// 成绩趋势图表配置
const gradeTrendOption = computed(() => ({
  title: {
    text: `${selectedCourse.value || '课程'} - 成绩趋势`,
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['我的成绩', '班级平均分'],
    left: 'left'
  },
  grid: {
    left: '10%',
    right: '5%',
    top: '15%',
    bottom: '5%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: myGradeTrend.value.map(item => item.examName),
    axisLabel: {
      rotate: 15,
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    name: '分数',
    min: 0,
    max: 100,
    axisLabel: {
      formatter: '{value}分'
    }
  },
  series: [
    {
      name: '我的成绩',
      type: 'line',
      data: myGradeTrend.value.map(item => item.score),
      smooth: true,
      lineStyle: { color: '#409EFF', width: 3 },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#409EFF' },
      areaStyle: {
        color: 'rgba(64, 158, 255, 0.1)'
      }
    },
    {
      name: '班级平均分',
      type: 'line',
      data: myGradeTrend.value.map(item => item.classAvg),
      smooth: true,
      lineStyle: { color: '#E6A23C', width: 2, type: 'dashed' },
      symbol: 'diamond',
      symbolSize: 8,
      itemStyle: { color: '#E6A23C' }
    }
  ]
}))

// 加载学期选项
const loadTermOptions = async () => {
  try {
    const res = await gradeApi.getTermOptions(authStore.userId)
    if (res && res.data) {
      termOptions.value = res.data
    }
  } catch (error) {
    console.error('加载学期选项失败:', error)
  }
}

// 加载状态选项
const loadStatusOptions = async () => {
  try {
    const res = await gradeApi.getStatusOptions()
    if (res && res.data) {
      statusOptions.value = res.data
    }
  } catch (error) {
    console.error('加载状态选项失败:', error)
  }
}

// 加载课程选项
const loadCourseOptions = async () => {
  try {
    const res = await gradeApi.getCourseOptions(authStore.userId)
    if (res && res.data) {
      courseOptions.value = res.data
    }
  } catch (error) {
    console.error('加载课程选项失败:', error)
  }
}

// 加载考试列表
const loadExamList = async () => {
  loading.value = true
  try {
    const res = await gradeApi.getExamList(authStore.userId, {
      term: searchModel.value.term,
      status: searchModel.value.status,
      course: searchModel.value.course
    })
    if (res && res.data) {
      examList.value = res.data
    }
  } catch (error) {
    console.error('加载考试列表失败:', error)
    ElMessage.error('加载考试列表失败')
  } finally {
    loading.value = false
  }
}

// 加载成绩分布
const loadGradeDistribution = async () => {
  try {
    const res = await gradeApi.getGradeDistribution(
      authStore.userId,
      searchModel.value.course === 'all' ? null : searchModel.value.course
    )
    if (res && res.data) {
      gradeDistribution.value = res.data
    }
  } catch (error) {
    console.error('加载成绩分布失败:', error)
  }
}

// 加载我的成绩趋势
const loadMyGradeTrend = async () => {
  const course = searchModel.value.course === 'all' ? null : searchModel.value.course
  if (!course) {
    myGradeTrend.value = []
    selectedCourse.value = ''
    return
  }

  try {
    const res = await gradeApi.getMyGradeTrend(authStore.userId, course)
    if (res && res.data) {
      myGradeTrend.value = res.data
      selectedCourse.value = course
    }
  } catch (error) {
    console.error('加载成绩趋势失败:', error)
  }
}

// 刷新所有数据
const refreshData = async () => {
  await Promise.all([
    loadExamList(),
    loadGradeDistribution(),
    loadMyGradeTrend()
  ])
  ElMessage.success('数据已刷新')
}

// 搜索
const handleSearch = () => {
  refreshData()
}

// 重置搜索
const handleReset = () => {
  searchModel.value = {
    term: 'all',
    status: 'all',
    course: 'all'
  }
  refreshData()
}

const handleExportImage = () => {
  exportToImage(containerRef.value, '成绩分析')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '成绩分析')
}

// 监听课程变化，更新成绩趋势
watch(() => searchModel.value.course, () => {
  loadMyGradeTrend()
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadTermOptions(),
    loadStatusOptions(),
    loadCourseOptions()
  ])
  await refreshData()
})
</script>

<template>
  <div class="grade-analysis" ref="containerRef" v-loading="loading">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="学期" prop="term">
          <el-select size="large" placeholder="选择学期" style="width: 180px" v-model="searchModel.term" clearable
            @change="handleSearch">
            <el-option v-for="item in termOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select size="large" placeholder="选择状态" style="width: 140px" v-model="searchModel.status" clearable
            @change="handleSearch">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="course">
          <el-select size="large" placeholder="选择课程" style="width: 180px" v-model="searchModel.course" clearable
            @change="handleSearch">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">搜索
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
        </el-button>
        <el-button @click="handleReset">重置 <template #icon>
            <i class="fas fa-sync"></i>
          </template></el-button>
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

    <div class="container-content">
      <div class="content-header">
        <h4><i class="fas fa-list"></i> 近期考试</h4>
      </div>
      <div class="content-body">
        <el-empty v-if="examList.length === 0 && !loading" description="暂无考试数据" />
        <TestBox v-for="exam in examList" :key="exam.id" :exam="exam" :status="exam?.status" />
      </div>
    </div>
    <div class="container-content">
      <el-card shadow="always">
        <EChart :options="gradeChartOption" height="400px" />
        <template #footer>
          <div class="echart-desc">
            <div class="echart-desc-item">
              平均分：<p>{{ gradeDistribution.stats.average }}分</p>
            </div>
            <div class="echart-desc-item">
              最高分：<p>{{ gradeDistribution.stats.highest }}分</p>
            </div>
            <div class="echart-desc-item">
              最低分：<p>{{ gradeDistribution.stats.lowest }}分</p>
            </div>
            <div class="echart-desc-item">
              及格率：<p>{{ gradeDistribution.stats.passRate }}%</p>
            </div>
            <div class="echart-desc-item">
              优秀率：<p>{{ gradeDistribution.stats.excellentRate }}%</p>
            </div>
          </div>
        </template>
      </el-card>
    </div>

     <div class="container-content" v-if="myGradeTrend.length > 0 && searchModel.course !== 'all'">
      <el-card shadow="always">
        <EChart :options="gradeTrendOption" height="400px" />
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grade-analysis {
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

  .container-content {
    width: 100%;
    padding: 10px 20px;

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;

      .title {
        font-size: 1, 3rem;
        font-weight: bold;
      }
    }

    .content-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .echart-desc {
      display: flex;
      align-items: center;
      height: 40px;
      gap: 20px;
      padding-left: 32px;

      .echart-desc-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 1.2rem;
        font-weight: 700;
        color: #3f6185;

        p {
          font-size: 1rem;
          font-weight: 400;
        }
      }
    }
  }
}
</style>
