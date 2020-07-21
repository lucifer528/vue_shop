<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table :data="cateList" :columns="columns" class="tree-table"
      :expand-type="false" :selection-type="false" show-index
      index-text="#" border :show-row-hover="false">
      <!-- 是否有效 -->
        <template v-slot:isok="slotProps">
          <i class="el-icon-success" v-if="slotProps.row.cat_deleted === false"
          style="color: lightgreen;"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <template v-slot:order="slotProps">
          <el-tag size='mini' v-if="slotProps.row.cat_level === 0">一级</el-tag>
          <el-tag size='mini' v-else-if="slotProps.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag size='mini' v-else type="warning">三级</el-tag>
        </template>
        <template v-slot:opt="slotProps">
          <el-button type="primary" icon="el-icon-edit" size="mini"
          @click="showEditCateDialog(slotProps.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="delCate(slotProps.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef"
      label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps" clearable
            @change="parentCateChanged">
            <!--
              popper-class="casc" 在本页面写样式有scoped属性没用
              这个可是可以改变但是包裹它的父级没有改变,有屁用,艹
             -->
            <!-- v-model 绑定 -->
            <!-- options 指定数据源 -->
            <!-- props 用来指定配置对象 -->
            <!-- <template v-slot:default="{ node, data }">
              <span>{{ data.cat_name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template> -->
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef"
      label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模块列
          type: 'template',
          // 要使用的模板
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        // 父分类的id
        cat_pid: 0,
        cat_name: '',
        // 分类的等级.默认添加1级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      selectedKeys: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id', 
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      editCateDialogVisible: false,
      editCateForm: {},
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      }).catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      }).catch(e => e)
      if (!res) return this.$message.error('获取父级分类网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      // console.log(res)
      this.parentCateList = res.data
    },
    parentCateChanged(value) {
      // console.log(value) // 就是一个值
      // console.log(this.selectedKeys)
      // 如果这个值的长度大于0,证明选中了一个父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          'categories', this.addCateForm
        ).catch(e => e)
        if (!res) return this.$message.error('添加分类网络错误')
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败:' + res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    async showEditCateDialog(row) {
      // console.log(row)
      const { data: res } = await this.$http.get(
        `categories/${row.cat_id}`
      ).catch(e => e)
      if (!res) return this.$message.error('编辑查询分类网络出错')
      if (res.meta.status !== 200) {
        return this.$message.error('编辑失败' + res.meta.msg)
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm = {}
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          { cat_name: this.editCateForm.cat_name }
        ).catch(e => e)
        if (!res) return this.$message.error('编辑提交网络出错')
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败' + res.meta.msg)
        }
        this.$message.success('更新成功')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    async delCate(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success(res.meta.msg)
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
// .el-cascader-menu {
//   height: 300px!important;
// } /* 有scoped没用,简直有毒 */
.el-cascader {
  width: 100%;
}
</style>