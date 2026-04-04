<script setup>
import { ref, computed, onMounted } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
import TestBox from './component/test-box.vue'
import EChart from '@/components/EChart.vue'

const containerRef = ref(null)
const searchModel = ref({
  term: '全部学期',
  status: '全部考试',
  course: '全部课程',
})
const termoptions = [
  {
    value: '全部学期',
    label: '全部学期',
  },
  {
    value: '2025秋季',
    label: '2025秋季',
  },
]
const statusoptions = [
  {
    value: '全部考试',
    label: '全部考试',
  },
  {
    value: '进行中',
    label: '进行中',
  },
  {
    value: '已结束',
    label: '已结束',
  },
  {
    value: '未开始',
    label: '未开始',
  },
]

const courseoptions = [
  {
    value: '全部课程',
    label: '全部课程',
  },
  {
    value: '已选课程',
    label: '已选课程',
  },
  {
    value: '未选课程',
    label: '未选课程',
  },
]

const graderOption = computed(() => ({
  title: {
    text: '成绩分布快速预览'
  },
  legend: { show: true },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: ["<60", "60-69", "70-79", "80-89", "90-100"],
  },
  yAxis: { type: "value" },
  series: [
    {
      type: "bar",
      data: [3, 8, 15, 12, 7],
      itemStyle: { color: "#1d4e7c", borderRadius: [6, 6, 0, 0] },
    },
  ],
}))

const examList = ref([
  {
    id: 1,
    course: "高等数学",
    type: "期中考试",
    status: "INPROGRESS",
    statusText: "进行中",
    className: "高三(1)班",
    date: "2026-03-20",
    submittedCount: 32,
    totalStudents: 45,
    averageScore: null
  },
  {
    id: 2,
    type: "月考",
    course: "大学英语",
    status: "COMPLETED",
    statusText: "已结束",
    className: "高三(2)班",
    date: "2026-03-10",
    submittedCount: null,
    totalStudents: null,
    averageScore: 78.5
  },
  {
    id: 3,
    type: "单元测试",
    course: "高等数学",
    status: "PREPARE",
    statusText: "待发布",
    className: "高三(1)班",
    date: "2026-03-25",
    submittedCount: null,
    totalStudents: null,
    averageScore: null
  }
])



const handleExportImage = () => {
  exportToImage(containerRef.value, '成绩分析')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '成绩分析')
}
</script>

<template>
  <div class="grade-analysis" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="学期" prop="term">
          <el-select size="large" placeholder="搜索学期..." style="width: 240px" v-model="searchModel.term">
            <el-option v-for="item in termoptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select size="large" placeholder="搜索状态..." style="width: 240px" v-model="searchModel.status">
            <el-option v-for="item in statusoptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="course">
          <el-select size="large" placeholder="搜索课程..." style="width: 240px" v-model="searchModel.course">
            <el-option v-for="item in courseoptions" :key="item.value" :label="item.label" :value="item.value" />
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
    <div class="container-content">
      <div class="content-header">
        <h4><i class="fas fa-list"></i> 近期考试</h4>
      </div>
      <div class="content-body">
        <TestBox v-for="exam in examList" :key="exam.id" :exam="exam" :status="exam?.status" />
      </div>
    </div>
    <div class="container-content">
      <el-card shadow="always">
        <EChart :options="graderOption" height="400px" />
        <template #footer>
          <div class="echart-desc">
            <div class="echart-desc-item">平均分： <p>85.5</p>
            </div>
            <div class="echart-desc-item">最高分： <p>95.5</p>
            </div>
            <div class="echart-desc-item">最低分： <p>75.5</p>
            </div>
            <div class="echart-desc-item">及格率： <p>100%</p>
            </div>
            <div class="echart-desc-item">优秀率： <p>85%</p>
            </div>
          </div>
        </template>
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
