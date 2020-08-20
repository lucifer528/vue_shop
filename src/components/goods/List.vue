<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query"
          @clear="getGoodsList" clearable>
            <el-button slot="append" icon="el-icon-search"
            @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="150px">
          <template v-slot:default="props">
            {{ props.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot:default="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditGoodsDialog(slotProps.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
            @click="removeGoods(slotProps.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
    </el-card>
    <!-- 添加商品对话框 -->
    <!-- <el-dialog
      title="添加商品"
      :visible.sync="addGoodsDialogVisible"
      width="50%">
      <el-form :model="addGoodsForm" :rules="addGoodsFormrules" ref="addGoodsFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addGoodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat">
          <el-cascader
            v-model="addGoodsForm.goods_cat"
            :options="cateList"
            :props="cascaderProps" clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
          <el-input v-model="addGoodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input v-model="addGoodsForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input v-model="addGoodsForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="介绍" prop="goods_introduce">
          <el-input type="textarea" :rows="2" resize="none" class="textarea"
          v-model="addGoodsForm.goods_introduce"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoods">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>    
</template>

<script>
// import moment from 'moment'
export default {
  data() {
    return {
      // searchText: '',
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      goodsList: []
      // addGoodsDialogVisible: false,
      // addGoodsForm: {
      //   goods_name: '',
      //   goods_cat: [],
      //   goods_price: '',
      //   goods_number: 0,
      //   goods_weight: 0,
      //   goods_introduce: ''
      // },
      // cateList: [],
      // cascaderProps: {
      //   label: 'cat_name',
      //   value: 'cat_id',
      //   children: 'children',
      //   expandTrigger: 'hover'
      // },
      // addGoodsFormrules: {
      //   goods_name: [
      //     { required: true, message: '请输入商品名称', trigger: 'blur' }
      //   ],
      //   goods_cat: [
      //     { required: true, message: '请输入商品分类', trigger: 'blur' }
      //   ],
      //   goods_price: [
      //     { required: true, message: '请输入商品价格', trigger: 'blur' },
      //     { type: 'number', message: '价格必须为数字值' }
      //   ],
      //   goods_number: [
      //     { required: true, message: '请输入商品数量', trigger: 'blur' },
      //     { type: 'number', message: '数重必须为数字值' }
      //   ],
      //   goods_weight: [
      //     { required: true, message: '请输入商品重量', trigger: 'blur' },
      //     { type: 'number', message: '重量必须为数字值' }
      //   ]
      // }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods',
        { params: this.queryInfo }
      ).catch(e => e)
      // console.log(res)
      if (!res) return this.$message.error('查询网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      // this.goodsList.forEach(item => {
      //   item.add_time = moment(item.add_time).format('YYYY-MM-DD HH:mm:ss')
      // })
      this.total = res.data.total
    },
    searchGoods() {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // async showGoodsDialogVisible() {
    //   const { data: res } = await this.$http.get('categories')
    //   if (!res) return this.$message.error('获取分类网络错误')
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('获取分类失败')
    //   }
    //   this.cateList = res.data
    //   this.addGoodsDialogVisible = true
    // },
    // addGoods() {

    // },
    goAddpage() {
      this.$router.push('/goods/add')
    },
    showEditGoodsDialog(row) {

    },
    async removeGoods(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonTest: '取消',
        type: 'warning'
      }).catch(e => e)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (!res) return this.$message.error('删除网络错误')
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodsList()
    }
  }
}
</script>

<style scoped>
/* .el-form-item {
  margin: 15px 0;
} */
/* .el-input {
  width: 300px;
  margin-right: 20px;
} */
/* .el-cascader {
  width: 300px;
} */
/* .textarea {
  width: 300px;
} */
</style>