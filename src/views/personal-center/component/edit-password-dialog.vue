<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)

const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (!val) {
    formData.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
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
    emit('submit', {
      oldPassword: formData.value.oldPassword,
      newPassword: formData.value.newPassword
    })
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
    title="修改密码"
    width="450px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="formData.oldPassword"
          type="password"
          placeholder="请输入原密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>