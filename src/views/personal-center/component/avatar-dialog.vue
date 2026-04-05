<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/index.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const previewUrl = ref('')
const uploading = ref(false)
const uploadedAvatar = ref('')

const uploadUrl = '/api/user/upload-avatar'

const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result
  }
  reader.readAsDataURL(file)
  
  return true
}

const handleSuccess = (response) => {
  if (response.code === 200) {
    uploadedAvatar.value = response.data?.avatar
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败，请重试')
}

const handleConfirm = () => {
  if (uploadedAvatar.value) {
    emit('success', uploadedAvatar.value)
    handleClose()
  } else {
    ElMessage.warning('请先选择图片')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  previewUrl.value = ''
  uploadedAvatar.value = ''
  emit('update:visible', false)
}

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="更新头像"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="avatar-upload">
      <div class="avatar-preview">
        <el-avatar
          :size="120"
          :src="previewUrl"
          v-if="previewUrl"
        />
        <el-avatar :size="120" v-else>
          {{ userInfo?.name?.slice(0, 1) || 'U' }}
        </el-avatar>
      </div>
      
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :show-file-list="false"
        accept="image/jpeg,image/png,image/jpg"
      >
        <el-button type="primary">
          <i class="fas fa-upload"></i> 选择图片
        </el-button>
        <template #tip>
          <div class="upload-tip">
            支持 jpg、png 格式，大小不超过 2MB
          </div>
        </template>
      </el-upload>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="uploading">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  .avatar-preview {
    margin-bottom: 10px;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}
</style>