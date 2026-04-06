<template>
  <div class="error-page">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style scoped>
.error-page {
  width: 100%;
  height: 100%;
  text-align: center;
  padding-top: 200px;
}

.error-page h1 {
  font-size: 100px;
  margin: 0;
}
</style>