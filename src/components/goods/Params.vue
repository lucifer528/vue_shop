<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" 
        type="warning" :closable="false"
        show-icon>
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:  </span>
            <el-cascader
              v-model="selectedKeys"
              :options="cateList"
              :props="cascaderProps" clearable
              @change="cateChanged">
              <!-- v-model 绑定 -->
              <!-- options 指定数据源 -->
              <!-- props 用来指定配置对象 -->
              <!-- <template v-slot:default="{ node, data }">
                <span>{{ data.cat_name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template> -->
            </el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"
          @click="addParamsDialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" stripe style="width: 100%" border>
            <el-table-column type="expand">
              <template v-slot:default="slotProps">
                <span v-if="slotProps.row.attr_vals !== ''">
                  <el-tag v-for="(item, index) in slotProps.row.attr_vals.split(',')" closable
                  :key="index" @close="delAttr_vals(slotProps.row, index)">
                    {{ item }}
                  </el-tag>
                </span>
                <el-input class="input-new-tag"
                  v-if="slotProps.row.inputVisible" v-model="slotProps.row.inputValue"
                  ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small"
                @click="showInput(slotProps.row)" >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotProps">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                @click="showEditParamsDialog(slotProps.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                @click="delParams(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"
          @click="addParamsDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" stripe style="width: 100%" border>
            <el-table-column type="expand">
              <template v-slot:default="slotProps">
                <span v-if="slotProps.row.attr_vals !== ''">
                  <el-tag v-for="(item, index) in slotProps.row.attr_vals.split(',')" closable
                  :key="index" @close="delAttr_vals(slotProps.row, index)">
                    {{ item }}
                  </el-tag>
                </span>
                <el-input class="input-new-tag"
                  v-if="slotProps.row.inputVisible" v-model="slotProps.row.inputValue"
                  ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small"
                @click="showInput(slotProps.row)" >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotProps">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                  @click="showEditParamsDialog(slotProps.row)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini"
                  @click="delParams(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%" @close="addParamsDialogClosed">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef"
      label-width="100px">
        <el-form-item :label="titleText + ': '" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+ titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%" @close="editParamsDialogClosed">
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef"
      label-width="100px">
        <el-form-item :label="titleText + ': '" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedKeys: '',
      cateList: [],
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        emitPath: false // 只返回字节点的值.
      },
      activeName: 'many',
      // paramsList: [],
      manyTableData: [],
      onlyTableData: [],
      // sel: 'many',
      editParamsDialogVisible: false,
      editParamsForm: {},
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      },
      inputVisible: false,
      inputValue: '',
      addParamsDialogVisible: false,
      addParamsForm: {
        attr_name: '',
        attr_sel: ''
      },
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  mounted() {
    // console.log(this.selectedKeys.length === 0)
  },
  computed: {
    isBtnDisabled() {
      if (!this.selectedKeys) {
        return true
      }
      return false
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 } // 可以不传,默认就是
      }).catch(e => e)
      if (!res) return this.$message.error('网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      this.cateList = res.data
    },
    cateChanged(key) {
      // console.log(this.selectedKeys)
      // console.log(key)
      // if (this.selectedKeys.length !== 3) {
      //   this.selectedKeys = []
      // }
      // 新版不在props里设置 checkStrictly: true .根本选不到前几级.
      // 只能选到最后一级,所以这名其实不用写
      if (key === null) { // !key 可能更好点
        // console.log('清空分类')
        // this.paramsList = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.getParamsList()
    },
    async getParamsList() {
      // if (this.activeName === 'dynamic') {
      //   this.sel = 'many'
      // } else if (this.activeName === 'static') {
      //   this.sel = 'only'
      // } // 直接绑在activeName上算球
      const { data: res } = await this.$http.get(
        `categories/${this.selectedKeys}/attributes`,
        { params: { sel: this.activeName } }
      ).catch(e => e)
      if (!res) return this.$message.error('获取参数网络错误')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败')
      }
      // console.log(res.data)
      // this.paramsList = res.data // 分别挂是好一点吧
      /* tag 标签的数据,视频中是在这 处理了下 */
      res.data.forEach(item => {
        // item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 在这先判断是不是空值
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else if (this.activeName === 'only') {
        this.onlyTableData = res.data
      }
    },
    handleTabClick() {
      // this.paramsList = []
      if (!this.selectedKeys) {
        return
      }
      this.getParamsList()
    },
    async delParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.selectedKeys}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success(res.meta.msg)
      this.getParamsList()
    },
    async showEditParamsDialog(row) {
      const { data: res } = await this.$http.get(
        `categories/${this.selectedKeys}/attributes/${row.attr_id}`,
        { params: { attr_sel: this.activeName } }
      ).catch(e => e)
      if (!res) return this.$message.error('获取参数网络错误')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败')
      }
      // console.log(res.data)
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },
    editParamsDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
      // console.log('关闭编辑对话框')
    },
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        // MD下面这句没写 await 莫名其秒的BUG,表单里填的值被重置回原来的值... 
        // 看半天..无解
        await this.putEditParams(this.editParamsForm)
        this.getParamsList()
        this.editParamsDialogVisible = false // TM应该是这句重把数据重置回去了
      })    
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => { // 让文本框自动获得焦点
      // $nextTick 方法的作用,就是当页面上元素被重新渲染之后
      // 才会指定回调函数中的代码,上面 = true 后,另一个元素还没有渲染出来
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      if (row.inputValue) { // 有上面的判断这个IF应该是不需要了.算了留着吧
        let vals
        vals = row.attr_vals ? row.attr_vals.split(',') : []
        // vals = vals.split(',').push(this.inputValue)
        // 不能直接链式这2个方法,push好像返回push后的长度
        vals.push(row.inputValue)
        vals = vals.join()
        const { ...newRow } = row
        newRow.attr_vals = vals
        const res = await this.putEditParams(newRow)
        if (res === true) {
          row.attr_vals = vals
        }
        // console.log(row)
      }
      row.inputVisible = false
      row.inputValue = ''
    },
    async putEditParams(data) {
      console.log(data)
      const { data: res } = await this.$http.put(
        `categories/${this.selectedKeys}/attributes/${data.attr_id}`,
        data
      ).catch(e => e)
      if (!res) return this.$message.error('修改参数网络错误')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('更新参数失败')
      }
      this.$message.success('更新参数成功')
      return true
    },
    async delAttr_vals(row, i) {
      const { ...vals } = row
      vals.attr_vals = vals.attr_vals.split(',')
      vals.attr_vals.splice(i, 1)
      vals.attr_vals = vals.attr_vals.join()
      const res = await this.putEditParams(vals)
      if (res === true) {
        row.attr_vals = vals.attr_vals
      }
    },
    addParamsDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        this.addParamsForm.attr_sel = this.activeName
        // console.log(this.addParamsForm)
        const { data: res } = await this.$http.post(
          `categories/${this.selectedKeys}/attributes`,
          this.addParamsForm
        ).catch(e => e)
        if (!res) return this.$message.error('添加参数网络出错')
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数或属性失败')
        }
        this.$message.success('添加成功')
        this.addParamsDialogVisible = false
        this.getParamsList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 120px;
}
</style>