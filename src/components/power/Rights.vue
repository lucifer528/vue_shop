<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template v-slot:default="slotProps">
            <el-tag v-if="slotProps.row.level == 0">一级</el-tag>
            <el-tag v-else-if="slotProps.row.level == 1" type="success">二级</el-tag>
            <el-tag v-else-if="slotProps.row.level == 2" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  props: ['ti'], // 我就试也下,可以哦..
  data() {
    return {
      rightsList: [],
      type: 'list'
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get(`rights/${this.type}`).catch(e => e)
      if (!res) return this.$message.error('获取列表网络错误!')
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表失败!!')
      }
      this.$message.success('获取列表成功')
      console.log(res)
      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>

</style>
