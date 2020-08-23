<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <!-- <el-button slot="append" icon="el-icon-search"></el-button> -->
            <!-- 自已用新版VUE写法写了一下,效果一样 -->
            <template v-slot:append>
              <el-button icon="el-icon-search"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="70px"></el-table-column>
        <el-table-column label="是否付款" width="80px">
          <template v-slot:default="slotProps">
            <el-tag v-if="slotProps.row.pay_status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="70px"></el-table-column>
        <el-table-column label="下单时间" width="150px">
          <template v-slot:default="slotProps">
            {{ slotProps.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <el-button type="primary" size="mini" icon="el-icon-edit"
          @click="showBox"></el-button>
          <el-button type="success" size="mini" icon="el-icon-location"
          @click="showProgressBox"></el-button>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 地址修改框 -->
    <el-dialog
      title="地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressClose">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef"
      label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
      >
      <!-- <el-steps direction="vertical" :active="progressInfo.length + 1" align-center>
        <el-step v-for="(item,i) in progressInfo" :key="i" :title="item.time" :description="item.context"></el-step>
      </el-steps> -->
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index" :type="index === 0 ? 'success' : ''"
          :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          {
            required: true, message: '请选择市区县', trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true, message: '请填写详细地址', trigger: 'blur'
          }
        ]
      },
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (!res) return this.$message.error('获取订单网络错误')
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单失败---' + res.meta.msg)
      }
      console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getOrderList()
    },
    handleCurrentChange(num) {
      this.queryInfo.pagenum = num
      this.getOrderList()
    },
    // 修改地址对话框
    showBox() {
      this.addressVisible = true
    },
    addressClose() {
      this.$refs.addressFormRef.resetFields()
      // console.log('1111111111')
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get('kuaidi/804909574412544580')
      if (!res) return this.$message.error('获取物流信息网络出错')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败---' + res.meta.message)
      }
      console.log(res)
      this.progressInfo = res.data
      // this.progressInfo.reverse()
      // 换个组件用,这里就不反转数组了
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>