<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    default: () => ({})
  },
  userRole: {
    type: String,
    default: 'student'
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  address: '',
  office: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.userInfo) {
    formData.value = {
      name: props.userInfo.name || '',
      email: props.userInfo.email || '',
      phone: props.userInfo.phone || '',
      gender: props.userInfo.gender || '男',
      birthday: props.userInfo.birthday || '',
      address: props.userInfo.address || '',
      office: props.userInfo.office || ''
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    emit('submit', { ...formData.value })
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑个人信息"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio value="男">男</el-radio>
          <el-radio value="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="formData.birthday"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="地址" prop="address" v-if="userRole === 'student'">
        <el-input v-model="formData.address" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="办公室" prop="office" v-if="userRole === 'teacher'">
        <el-input v-model="formData.office" placeholder="请输入办公室" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

