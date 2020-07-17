<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
      console.log('退出22222222')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
