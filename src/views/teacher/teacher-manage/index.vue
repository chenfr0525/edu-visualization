<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatsCard from '@/views/teacher/user-manage/component/stats-card.vue'
import { teacherManageApi } from '@/api/index.js'
import { exportTeacherExcel } from '@/utils/export'

// 响应式数据
const loading = ref(false)
const searchModel = ref({
  keyword: '',
  department: ""
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const teacherList = ref([])
const departmentList = ref(['计算机学院', '软件学院', '信息工程学院', '数学学院', '外语学院', '管理学院'])
const statistics = reactive({
  totalTeacherCount: 0,
  activeTeacherCount: 0,
  adminCount: 0,
  departmentStats: [],
  titleStats: []
})

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增教师')

// 表单数据
const formRef = ref(null)
const formData = ref({
  id: null,
  teacherNo: '',
  username: '',
  name: '',
  gender: '男',
  email: '',
  phone: '',
  department: '',
  title: '',
  office: '',
  joinDate: '',
})

// 表单验证规则
const formRules = {
  teacherNo: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { min: 4, max: 20, message: '工号长度为4-20位', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20位', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 获取教师列表
const fetchTeacherList = async () => {
  loading.value = true
  try {
    const res = await teacherManageApi.getTeacherList({
      page: pagination.page - 1,
      size: pagination.pageSize,
      keyword: searchModel.value.keyword,
      department: searchModel.value.department,
    })
    if (res && res.data) {
      teacherList.value = res.data.list || []
      console.log('教师列表数据:', teacherList.value)
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await teacherManageApi.getStats()
    if (res && res.data) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchTeacherList()
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  fetchTeacherList()
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchTeacherList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchTeacherList()
}

// 显示新增弹窗
const showAddDialog = () => {
  dialogTitle.value = '新增教师'
  resetForm()
  dialogVisible.value = true
}

// 编辑教师
const editTeacher = (row) => {
  dialogTitle.value = '编辑教师'
  formData.value = {
    id: row.id,
    teacherNo: row.teacherNo,
    username: row.username,
    name: row.name,
    gender: row.gender || '男',
    email: row.email || '',
    phone: row.phone || '',
    department: row.department || '',
    title: row.title || '',
    office: row.office || '',
    joinDate: row.joinDate || '',
  }
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: null,
    teacherNo: '',
    username: '',
    name: '',
    gender: '男',
    email: '',
    phone: '',
    department: '',
    title: '',
    office: '',
    joinDate: '',
    status: 'ACTIVE',
    role: 'TEACHER'
  }
  formRef.value?.resetFields()
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()

  let success
  if (dialogTitle.value === '新增教师') {
    const res = await teacherManageApi.addTeacher(formData.value)
    success = res && res.code === 200
    if (success) ElMessage.success('新增成功')
    else ElMessage.error(res?.message || '新增失败')
  } else {
    const res = await teacherManageApi.updateTeacher(formData.value.id, formData.value)
    success = res && res.code === 200
    if (success) ElMessage.success('更新成功')
    else ElMessage.error(res?.message || '更新失败')
  }

  if (success) {
    dialogVisible.value = false
    await fetchTeacherList()
    await fetchStatistics()
  }
}

// 重置密码
const resetPassword = async (row) => {
  ElMessageBox.confirm(`确认重置 ${row?.name} 的密码吗？重置后密码为 123456`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await teacherManageApi.resetPassword(row.id)
      ElMessage.success('密码重置成功，新密码为：123456')
    } catch (error) {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }).catch(() => { })
}

// 删除教师
const deleteTeacher = async (row) => {
  ElMessageBox.confirm(`确认删除教师 ${row?.name} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await teacherManageApi.deleteTeacher(row.id)
      ElMessage.success('删除成功')
      await fetchTeacherList()
      await fetchStatistics()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => { })
}

// 转为管理员
const promoteToAdmin = async (row) => {
  ElMessageBox.confirm(`确认将 ${row?.name} 转为管理员吗？转为管理员后将拥有系统管理权限`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await teacherManageApi.promoteToAdmin(row.id)
      if (res && res.code === 200) {
        ElMessage.success('已转为管理员')
        await fetchTeacherList()
        await fetchStatistics()
      } else {
        ElMessage.error(res?.message || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => { })
}

// 角色标签样式
const getRoleTagType = (role) => {
  return role === 'ADMIN' ? 'danger' : 'primary'
}

const getRoleText = (role) => {
  return role === 'ADMIN' ? '管理员' : '教师'
}

// 导出Excel
const exportToExcel = () => {
  try {
    const exportData = teacherList.value?.map((item, index) => ({
      序号: index + 1,
      工号: item.teacherNo || '',
      用户名: item?.username || '',
      姓名: item?.name || '',
      性别: item?.gender || '未知',
      部门: item.department || '',
      职称: item.title || '',
      办公室: item.office || '',
      邮箱: item?.email || '',
      手机号: item?.phone || '',
      角色: getRoleText(item?.role)
    })) || []

    if (exportData.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    exportTeacherExcel(exportData, `教师数据_${new Date().toLocaleDateString()}`)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

// 监听筛选条件变化
watch([() => searchModel.value.department], () => {
  handleFilterChange()
})

onMounted(async () => {
  await fetchTeacherList()
  await fetchStatistics()
})
</script>

<template>
  <div class="teacher-manage-container">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-input v-model="searchModel.keyword" placeholder="搜索姓名/工号/用户名" prefix-icon="Search" clearable
          style="width: 260px" @clear="handleSearch" @keyup.enter="handleSearch" />
        <el-select size="large" v-model="searchModel.department" placeholder="按部门筛选" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="dept in departmentList" :key="dept" :label="dept" :value="dept" />
        </el-select>
      </div>
      <div class="action-right">
        <el-button type="primary" @click="showAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新增教师
        </el-button>
        <el-button @click="exportToExcel">
          <el-icon>
            <Download />
          </el-icon>
          导出Excel
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <StatsCard type="total" icon="fa-users" title="教师总数" :value="statistics.totalTeacherCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="active" icon="fa-user-check" title="在职教师" :value="statistics.activeTeacherCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="admin" icon="fa-user-shield" title="管理员" :value="statistics.adminCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="department" icon="fa-building" title="院系数" :value="statistics.departmentStats?.length || 0" />
      </el-col>
    </el-row>

    <!-- 教师列表表格 -->
    <div class="table-container">
      <el-table :data="teacherList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="teacherNo" label="工号" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100">
          <template #default="{ row }">
            <div class="teacher-name">
              <el-avatar :size="32">
                {{ row?.name?.charAt(0) || 'T' }}
              </el-avatar>
              <span>{{ row?.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">
            {{ row.gender || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="150" show-overflow-tooltip />
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editTeacher(row)">
              <el-icon>
                <Edit />
              </el-icon> 编辑
            </el-button>
            <el-button link type="primary" size="small" @click="resetPassword(row)">
              <el-icon>
                <Key />
              </el-icon> 重置密码
            </el-button>
            <el-dropdown @command="(cmd) => {
              if (cmd === 'promote') promoteToAdmin(row)
              if (cmd === 'delete') deleteTeacher(row)
            }">
              <el-button link type="primary" size="small">
                更多 <el-icon>
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="promote" v-if="row.role !== 'ADMIN'">
                    转为管理员
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- 新增/编辑教师弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="teacherNo">
              <el-input v-model="formData.teacherNo" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%">
                <el-option v-for="dept in departmentList" :key="dept" :label="dept" :value="dept" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入职称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="办公室" prop="office">
              <el-input v-model="formData.office" placeholder="请输入办公室" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="joinDate">
              <el-date-picker v-model="formData.joinDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="初始密码" v-if="dialogTitle === '新增教师'">
          <el-input value="123456" disabled placeholder="默认密码为123456" />
          <div class="form-tip">初始密码为 123456，用户首次登录后可修改</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.teacher-manage-container {
  width: 100%;
  min-height: 100vh;

  .action-bar {
    background: white;
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .action-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .table-container {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .teacher-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;

    .action-left,
    .action-right {
      justify-content: stretch;
    }

    .action-left .el-input,
    .action-left .el-select {
      width: 100% !important;
    }
  }
}
</style>