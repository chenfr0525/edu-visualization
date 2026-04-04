<script setup lang="js">
import { ref, onMounted, computed } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import EChart from '@/components/EChart.vue'
import ProgressStatus from './component/progress-status.vue'
import CourseCard from './component/course-card.vue'
import TimelineItem from './component/timeline-item.vue'
import { Picture } from '@element-plus/icons-vue'

const containerRef = ref(null)
const searchModel = ref({
  courseType: '全部课程',
})
const dialogVisible = ref(false)
const options = [
  {
    value: '全部课程',
    label: '全部课程',
  },
  {
    value: '进行中',
    label: '进行中',
  },
  {
    value: '未开始',
    label: '未开始',
  },
  {
    value: '已结课',
    label: '已结课',
  },
]

// 整体进度统计
const overallProgress = ref(68)
const stats = ref([
  { label: '平均GPA', value: '4.2', number: '4.2' },
  { label: '学习小时', value: '128', number: '128' },
  { label: '作业提交率', value: '87%', number: '87%' }
])

// 课程列表数据
const courses = ref([
  {
    id: 1,
    title: '高等数学',
    icon: 'fas fa-square-root-alt',
    progress: 80,
    meta: [
      { label: '进度', value: '80%', icon: 'far fa-clock' },
      { label: '作业', value: '3/5', icon: 'fas fa-pencil-alt' },
      { label: '视频', value: '32/40', icon: 'fas fa-video' }
    ],
    teacherExtra: {
      classAvg: '72%',
      laggingCount: 3,
      status: '3人滞后'
    }
  },
  {
    id: 2,
    title: '大学英语',
    icon: 'fas fa-language',
    progress: 55,
    meta: [
      { label: '进度', value: '55%', icon: '' },
      { label: '作业', value: '2/4', icon: '' },
      { label: '视频', value: '18/30', icon: '' }
    ],
    teacherExtra: {
      classAvg: '63%',
      laggingCount: 2,
      status: '2人滞后'
    }
  },
  {
    id: 3,
    title: 'Python程序设计',
    icon: 'fas fa-code',
    progress: 35,
    meta: [
      { label: '进度', value: '35%', icon: '' },
      { label: '项目', value: '1/3', icon: '' },
      { label: '视频', value: '8/24', icon: '' }
    ],
    teacherExtra: {
      classAvg: '42%',
      laggingCount: 0,
      status: '5人超前'
    }
  },
  {
    id: 4,
    title: '物理实验',
    icon: 'fas fa-flask',
    progress: 72,
    meta: [
      { label: '进度', value: '72%', icon: '' },
      { label: '实验', value: '8/12', icon: '' },
      { label: '报告', value: '1/2', icon: '' }
    ],
    teacherExtra: {
      classAvg: '68%',
      laggingCount: 1,
      status: '1人未提交'
    }
  }
])

// 学习动态数据
const timeline = ref([
  {
    id: 1,
    icon: 'fas fa-check',
    title: '完成高等数学第三章练习',
    time: '今天 09:30',
    detail: '得分 92% · 用时 45分钟'
  },
  {
    id: 2,
    icon: 'fas fa-video',
    title: '观看英语听力视频',
    time: '昨天 15:20',
    detail: 'Unit 4 · 时长 45分钟'
  },
  {
    id: 3,
    icon: 'fas fa-pencil-alt',
    title: '提交程序设计作业',
    time: '前天 10:15',
    detail: '项目一: 猜数字游戏 (待评分)'
  },
  {
    id: 4,
    icon: 'fas fa-users',
    title: '参与小组讨论',
    time: '3天前',
    detail: '物理实验数据处理'
  }
])

// 2. ECharts数据
const donutData = computed(() => ({
  tooltip: { show: true },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['70%', '90%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { scale: false },
      data: [
        { value: overallProgress.value, name: '已完成', itemStyle: { color: '#1d4e7c' } },
        { value: 100 - overallProgress.value, name: '未完成', itemStyle: { color: '#d8e5f0' } }
      ]
    }
  ]
}))

const studyTimeChart = computed(() => ({
  title: {
    text: "近7天学习时间分布"
  },
  tooltip: { show: true },
  legend: { show: false },
  xAxis: {
    data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  },
  yAxis: {},
  series: [
    {
      data: [2.5, 3.0, 2.8, 3.2, 2.0, 4.5, 3.5],
      type: "bar",
      color: "#1d4e7c",
    },
  ],
}))

const handleExportImage = () => {
  exportToImage(containerRef.value, '课程概览')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '课程概览')
}

</script>

<template>
  <div class="course-container" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
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
    <el-card class="progress-card" shadow="hover">
      <el-row :gutter="20">
        <el-col :span="6">
          <EChart :options="donutData" height="255px" />
        </el-col>
        <el-col :span="18">
          <div class="progress-info">
            <h2>整体学习进度 {{ overallProgress }}%</h2>
            <p>已完成 24/35 个模块 · 剩余 11 个模块</p>
            <div class="status-list">
              <ProgressStatus v-for="stat in stats" :key="stat.label" :number="stat.number" :label="stat.label" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div class="course-grid-section">
      <h3 class="section-header">
        <i class="fas fa-book-open" style="margin-right: 8px"></i> 我的课程
      </h3>
      <el-row :gutter="20">
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
            <el-button @click="dialogVisible = true">全部动态</el-button>
          </div>
          <el-timeline>
            <el-timeline-item v-for="item in timeline" :key="item.id" :timestamp="item.time" placement="top">
              <TimelineItem :item="item" />
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="hover">
          <EChart :options="studyTimeChart" height="500px" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" width="700px" header-class="dialog-header" body-class="dialog-body"
      footer-class="dialog-footer" :close-on-click-modal="false" destroy-on-close>
      <template #header>{{ 'test' }}</template>
      <template #default>
        <el-scrollbar>
          这是弹窗
        </el-scrollbar>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
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
