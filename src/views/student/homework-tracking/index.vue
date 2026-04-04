<script setup>
import { ref, computed, onMounted } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import StatBox from '../dashboard/component/stat-box.vue'
import { Picture } from '@element-plus/icons-vue'

const containerRef = ref(null)
const loading = ref(false)
const searchModel = ref({
  course: '全部课程',
  status: '全部作业',
  keyword: '',
})
const pageInfo = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})

const statusOptions = [
  {
    label: '全部作业',
    value: '全部作业',
  },
  {
    label: '未完成',
    value: '未完成',
  },
  {
    label: '已完成',
    value: '已完成',
  },
]
const courseOptions = [
  {
    label: '全部课程',
    value: '全部课程',
  },
  {
    label: '数据结构',
    value: '数据结构',
  },
  {
    label: '算法',
    value: '算法',
  },
  {
    label: '软件工程',
    value: '软件工程',
  },
  {
    label: '计算机网络',
    value: '计算机网络',
  },
  {
    label: '操作系统',
    value: '操作系统',
  },
  {
    label: '数据库',
    value: '数据库',
  },
  {
    label: '计算机系统结构',
    value: '计算机系统结构',
  },
  {
    label: '计算机组成原理',
    value: '计算机组成原理',
  },
]

const statBoxes = [
  {
    statNum: 10,
    title: '待提交',
  },
  {
    statNum: 5,
    title: '已批改',
  },
  {
    statNum: 2,
    title: '平均分',
  },
  {
    rate: 80,
    title: '按时率',
  },
]

const workList = [
  {
    id: 1,
    assignmentName: "三角函数练习",
    course: "高等数学",
    deadline: "2026-03-20",
    status: "进行中",
    score: 89,
    actions: ["批改", "详情"]
  },
  {
    id: 2,
    assignmentName: "英语作文",
    course: "大学英语",
    deadline: "2026-03-18",
    status: "已截止",
    score: 82.5,
    actions: ["查看", "分析"]
  },
  {
    id: 3,
    assignmentName: "Python编程作业",
    course: "程序设计",
    deadline: "2026-03-25",
    status: "未开始",
    score: null,
    actions: ["编辑", "发布"]
  },
  {
    id: 4,
    assignmentName: "物理实验报告",
    course: "物理实验",
    deadline: "2026-03-15",
    status: "已批改",
    score: 88.2,
    actions: ["查看解析"]
  },
  {
    id: 5,
    assignmentName: "Java项目",
    course: "软件工程",
    deadline: "2026-03-10",
    status: "已截止",
    score: null,
    actions: ["查看", "分析"]
  },
  {
    id: 6,
    assignmentName: "数据结构作业",
    course: "数据结构",
    deadline: "2026-03-05",
    status: "未开始",
    score: null,
    actions: ["编辑", "发布"]
  }
]
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
        <el-form-item label="状态" prop="status">
          <el-select size="large" placeholder="搜索状态..." style="width: 240px" v-model="searchModel.status">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="course">
          <el-select size="large" placeholder="搜索课程..." style="width: 240px" v-model="searchModel.course">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业名称" prop="keyword">
          <el-input placeholder="搜索作业..." style="width: 240px" v-model="searchModel.keyword" />
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
    <div class="section-content">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in statBoxes" :key="item.title">
          <StatBox :title="item.title" :stat-num="item.statNum" :rate="item.rate" />
        </el-col>
      </el-row>
    </div>
    <el-card shadow="always" class="section-content">
      <template #header>
        <span>作业列表</span>
      </template>
      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="workList" max-height="500px" class="content-box">
        <el-table-column label="作业名称">
          <template #default="{ row }">
            {{ row.assignmentName }}
          </template>
        </el-table-column>
        <el-table-column label="课程">
          <template #default="{ row }">
            <span>{{ row.course }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetSystem" label="截止日期">
          <template #default="{ row }">
            {{ row.deadline || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="template" label="状态">
          <template #default="{ row }">
            {{ row.status }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分">
          <template #default="{ row }">
            {{ row?.score ? row?.score + '分' : '未评分' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template #default="{ row, $index }">
            <!-- <div class="table-box">
              <el-link underline="never"
                @click="downloadReport({ record: { file: row.file, fileName: row.title } })">下载</el-link>
              <el-link underline="never" type="primary" @click="openViewDialog(row)">查看</el-link>
              <el-link underline="never" @click="openEditDialog(row)">编辑</el-link>
            </div> -->
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有数据"></el-empty>
        </template>
      </el-table>
      <template #footer>
        <!-- 分页区域 -->
        <el-pagination :current-page="pageInfo.page" :page-size="pageInfo.pageSize" :total="pageInfo.total"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @current-change="() => $emit('update:pageInfo', { page: $event, pageSize: pageInfo.pageSize })"
          @size-change="() => $emit('update:pageInfo', { page: pageInfo.page, pageSize: $event })"></el-pagination>
      </template>
    </el-card>
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

  .section-content {
    margin-top: 20px;
  }
}
</style>
