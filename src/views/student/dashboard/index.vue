<script setup>
import { ref, computed, onMounted } from 'vue'
import EChart from '@/components/EChart.vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
import StatBox from './component/stat-box.vue'
import { getAttendanceHeatmapData } from '@/mock'

const dashboardRef = ref(null)
const attendanceData = ref([])

const searchModel = ref({
  semester: '',
  course: '',
})

const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]

const handleExportImage = () => {
  exportToImage(dashboardRef.value, '学生个人学习驾驶舱')
}

const handleExportPDF = () => {
  exportToPDF(dashboardRef.value, '学生个人学习驾驶舱')
}

// 知识点掌握雷达图数据
const radarOption = computed(() => ({
  title: {
    text: '知识点掌握程度'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    data: ['当前掌握程度', '班级平均水平']
  },
  radar: {
    indicator: [
      { name: 'Vue3 基础', max: 100 },
      { name: 'Pinia 状态管理', max: 100 },
      { name: 'Vue Router 路由', max: 100 },
      { name: 'ECharts 可视化', max: 100 },
      { name: 'Element Plus 组件', max: 100 },
      { name: '项目实战能力', max: 100 }
    ]
  },
  series: [
    {
      name: '知识点掌握情况',
      type: 'radar',
      data: [
        {
          value: [85, 70, 90, 65, 80, 75],
          name: '当前掌握程度'
        },
        {
          value: [75, 65, 80, 70, 75, 65],
          name: '班级平均水平'
        }
      ]
    }
  ]
}))

// 学习成绩趋势折线图数据
const lineOption = computed(() => ({
  title: {
    text: '学习成绩趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['第一次作业', '第二次作业', '期中考试', '第三次作业', '第四次作业', '期末考试']
  },
  yAxis: {
    type: 'value',
    max: 100
  },
  series: [
    {
      data: [82, 88, 76, 92, 85, 94],
      type: 'line',
      smooth: true,
      markPoint: {
        data: [
          { type: 'max', name: '最高分' },
          { type: 'min', name: '最低分' }
        ]
      },
      markLine: {
        data: [{ type: 'average', name: '平均值' }]
      }
    }
  ]
}))

// 班级排名仪表盘数据
const gaugeOption = computed(() => ({
  title: {
    text: '班级排名位置',
    left: 'center'
  },
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%'
  },
  series: [
    {
      name: '排名',
      type: 'gauge',
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 20
      },
      data: [
        {
          value: 85,
          name: '击败全国同学'
        }
      ]
    }
  ]
}))

const heatmapOption = computed(() => ({
  title: {
    top: 30,
    left: 'center',
    text: '学生年度出勤热力图'
  },
  tooltip: {
    formatter: (params) => `${params.value[0]}: ${params.value[1]}% 出勤率`
  },
  visualMap: {
    min: 0,
    max: 100,
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
    top: 65,
    pieces: [
      { min: 95, label: '全勤', color: '#67C23A' },
      { min: 85, max: 95, label: '良好', color: '#409EFF' },
      { min: 70, max: 85, label: '一般', color: '#E6A23C' },
      { max: 70, label: '预警', color: '#F56C6C' }
    ]
  },
  calendar: {
    top: 120,
    left: 30,
    right: 30,
    cellSize: ['auto', 13],
    range: '2025', // 模拟 2025 年数据
    itemStyle: {
      borderWidth: 0.5
    },
    yearLabel: { show: false }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: attendanceData.value
  }
}))

onMounted(() => {
  attendanceData.value = getAttendanceHeatmapData()
})
</script>

<template>
  <div class="dashboard-container" ref="dashboardRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="学期" prop="semester">
          <el-select size="large" placeholder="请选择学期" style="width: 240px">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="course">
          <el-select size="large" placeholder="请选择课程" style="width: 240px">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">刷新
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

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <StatBox icon="fa-book-open" title="已学课程" :stat-num="12" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-clock" title="学习时长" :stat-num="562" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-pencil-alt" title="平均分" :stat-num="98" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-trophy" title="班级排名" :stat-num="14" />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <EChart :options="radarOption" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <el-row>
            <el-col :span="17">
              <EChart :options="gaugeOption" height="400px" />
            </el-col>
            <el-col :span="7">
              <div class="echart-desc">
                <div style="font-size: 3rem; font-weight: 700; color: #1d4e7c">
                  12/45
                </div>
                <div style="font-size: 1.1rem; margin-top: 8px">
                  超过全班 <strong>73%</strong> 的同学
                </div>
                <div class="badge success" style="margin-top: 16px">
                  📈 稳步提升中
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <EChart :options="lineOption" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" header="出勤统计">
          <EChart :options="heatmapOption" height="300px" />
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
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

  .echart-desc {
    padding-top: 80px;
  }
}
</style>
