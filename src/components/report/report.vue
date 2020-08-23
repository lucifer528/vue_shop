<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小(宽高的) Dom -->
      <div ref="echartsDiv" style="width: 750px;height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 示例数据
      option: {
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        legend: {
          data: ['销量']
        },
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [{
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }]
      },
      option1: {},
      // 下面是 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {
  },
  async mounted() {
    const myChart = echarts.init(this.$refs.echartsDiv)
    await this.getReportsData()
    // console.log(this.option1)
    // 使用 lodash 的 merge 方法 合并 2个对象
    this.option1 = _.merge(this.option1, this.options)
    // Object.assign(this.option1, this.options)
    // 看弹幕说用这个合并...问题很大,如果属性的值是对象会被替换,
    // 不会在属性的值时新加上新值的属性
    myChart.setOption(this.option1)
  },
  methods: {
    async getReportsData() {
      const { data: res } = await this.$http.get('reports/type/1')
      if (!res) return this.$message.error('获取报表网络出错!')
      if (res.meta.status !== 200) {
        return this.$message.error('获取报表数据失败---' + res.meta.msg)
      }
      this.option1 = res.data
      // console.log(res)
      // console.log(this.option1)
    }
  }
}
</script>

<style scoped lang="less">

</style>