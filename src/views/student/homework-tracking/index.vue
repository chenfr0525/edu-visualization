<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import StatBox from '../dashboard/component/stat-box.vue'
import { Picture } from '@element-plus/icons-vue'
import { homeworkApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const containerRef = ref(null)
const authStore = useAuthStore()
const loading = ref(false)
// 搜索表单
const searchModel = ref({
  course: 'all',
  status: 'all',
  keyword: '',
})
// 选项数据
const courseOptions = ref([])
const statusOptions = ref([])
// 统计数据
const statsData = ref({
  pending: 0,
  graded: 0,
  avgScore: 0,
  onTimeRate: 0
})

// 作业列表
const homeworkList = ref([])
const pageInfo = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})
// 统计卡片配置
const statBoxes = computed(() => [
  {
    statNum: statsData.value.pending,
    title: '待提交',
  },
  {
    statNum: statsData.value.graded,
    title: '已批改',
  },
  {
    statNum: statsData.value.avgScore,
    title: '平均分',
  },
  {
    rate: statsData.value.onTimeRate,
    title: '按时率',
  },
])

// 获取状态样式
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'submitted': 'info',
    'graded': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'pending': '待提交',
    'submitted': '已提交',
    'graded': '已批改',
    'overdue': '已逾期'
  }
  return textMap[status] || status
}

// 加载课程选项
const loadCourseOptions = async () => {
  try {
    const res = await homeworkApi.getCourseOptions(authStore.userId)
    if (res && res.data) {
      courseOptions.value = res.data
    }
  } catch (error) {
    console.error('加载课程选项失败:', error)
  }
}

// 加载状态选项
const loadStatusOptions = async () => {
  try {
    const res = await homeworkApi.getStatusOptions()
    if (res && res.data) {
      statusOptions.value = res.data
    }
  } catch (error) {
    console.error('加载状态选项失败:', error)
  }
}
// 加载统计数据
const loadStats = async () => {
  try {
    const res = await homeworkApi.getStats(authStore.userId)
    if (res && res.data) {
      statsData.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}
// 加载作业列表
const loadHomeworkList = async () => {
  loading.value = true
  try {
    const res = await homeworkApi.getHomeworkList(authStore.userId, {
      course: searchModel.value.course,
      status: searchModel.value.status,
      keyword: searchModel.value.keyword,
      page: pageInfo.value.page,
      pageSize: pageInfo.value.pageSize
    })
    if (res && res.data) {
      homeworkList.value = res.data.list || []
      pageInfo.value.total = res.data.total
    }
  } catch (error) {
    console.error('加载作业列表失败:', error)
    ElMessage.error('加载作业列表失败')
  } finally {
    loading.value = false
  }
}

// 提交作业
const handleSubmitHomework = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要提交作业"${row.assignmentName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    // 模拟文件上传
    const res = await homeworkApi.submitHomework({
      homeworkId: row.id,
      studentId: authStore.userId,
      content: '作业内容...',
      files: []
    })

    if (res && res.code === 200) {
      ElMessage.success('作业提交成功')
      loadHomeworkList()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交作业失败:', error)
      ElMessage.error('提交失败')
    }
  }
}

// 查看作业详情
const handleViewDetail = (row) => {
  ElMessage.info(`查看作业详情：${row.assignmentName}`)
  // 可以打开详情弹窗或跳转页面
}

// 查看作业解析
const handleViewAnalysis = async (row) => {
  try {
    const res = await homeworkApi.getHomeworkAnalysis(row.id)
    if (res && res.data) {
      ElMessageBox.alert(res.data.analysis, `${row.assignmentName} - 作业解析`, {
        confirmButtonText: '知道了',
        dangerouslyUseHTMLString: true
      })
    }
  } catch (error) {
    console.error('获取作业解析失败:', error)
    ElMessage.error('获取解析失败')
  }
}

// 获取操作按钮
const getActionButtons = (row) => {
  const buttons = []

  if (row.status === 'pending') {
    buttons.push({ label: '提交作业', type: 'primary', handler: () => handleSubmitHomework(row) })
  }

  if (row.status === 'submitted') {
    buttons.push({ label: '查看详情', type: 'info', handler: () => handleViewDetail(row) })
  }

  if (row.status === 'graded') {
    buttons.push({ label: '查看解析', type: 'success', handler: () => handleViewAnalysis(row) })
    buttons.push({ label: '查看详情', type: 'info', handler: () => handleViewDetail(row) })
  }

  if (row.status === 'overdue') {
    buttons.push({ label: '补交作业', type: 'warning', handler: () => handleSubmitHomework(row) })
  }

  return buttons
}

// 搜索
const handleSearch = () => {
  pageInfo.value.page = 1
  loadHomeworkList()
}

// 重置搜索
const handleReset = () => {
  searchModel.value = {
    course: 'all',
    status: 'all',
    keyword: '',
  }
  pageInfo.value.page = 1
  loadHomeworkList()
}
const handleExportImage = () => {
  exportToImage(containerRef.value, '作业跟踪')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '作业跟踪')
}
watch(() => pageInfo.value.page, () => {
  loadHomeworkList()
})

watch(() => pageInfo.value.pageSize, () => {
  pageInfo.value.page = 1
  loadHomeworkList()
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadCourseOptions(),
    loadStatusOptions(),
    loadStats()
  ])
  await loadHomeworkList()
})
</script>

<template>
  <div class="homework-tracking" ref="containerRef" v-loading="loading">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="状态" prop="status">
          <el-select size="large" placeholder="选择状态" style="width: 180px" v-model="searchModel.status" clearable
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
    <!-- 统计卡片 -->
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
      <el-table v-loading="loading" :data="homeworkList" max-height="500px" class="content-box" stripe>
        <el-table-column label="作业名称" min-width="180">
          <template #default="{ row }">
            <div class="homework-name">
              <span class="name">{{ row.assignmentName }}</span>
              <el-tag v-if="row.difficulty" size="small"
                :type="row.difficulty === '困难' ? 'danger' : row.difficulty === '中等' ? 'warning' : 'success'">
                {{ row.difficulty }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="课程" width="140">
          <template #default="{ row }">
            <span>{{ row.course }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetSystem" label="截止日期" width="160">
          <template #default="{ row }">
            <span :class="{ 'overdue-text': row.status === 'overdue' }">
              {{ row.deadline?.split(' ')[0] || '未知' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="template" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100">
          <template #default="{ row }">
            <span v-if="row.score" class="score-text">{{ row.score }}分</span>
            <span v-else class="no-score">未评分</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">
            <span v-if="row.submitTime">{{ row.submitTime?.split(' ')[0] }}</span>
            <span v-else class="no-submit">未提交</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button v-for="btn in getActionButtons(row)" :key="btn.label" :type="btn.type" size="small" link
                @click="btn.handler">
                {{ btn.label }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无作业数据"></el-empty>
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
     .export-btns {
      display: flex;
      gap: 10px;
    }
  }

  .section-content {
    margin-top: 20px;
  }

   .homework-name {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .name {
      font-weight: 500;
    }
  }

   .overdue-text {
    color: #f56c6c;
  }

  .score-text {
    color: #67c23a;
    font-weight: 500;
  }

  .no-score,
  .no-submit {
    color: #909399;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .header-tip {
    margin-left: 12px;
    font-size: 12px;
    color: #909399;
  }
}

// 响应式
@media (max-width: 1200px) {
  .homework-tracking {
    .container-header {
      flex-direction: column;
      align-items: stretch;
    }
  }
}

@media (max-width: 768px) {
  .homework-tracking {
    padding: 10px;

    .action-buttons {
      flex-direction: column;
    }
  }

}
</style>
