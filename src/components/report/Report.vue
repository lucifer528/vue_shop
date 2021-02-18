<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div ref="echartsDiv" id="main" style="width: 750px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// import echarts from 'echarts'
// 见了鬼了 上面不行,下面用require都行,艹了
// 以前用上面就行,TM5.0要向下面这样??
import * as echarts from 'echarts'
// console.log(echarts) //像以前一样导直接undefined
// const echarts = require('echarts')
import _ from 'lodash'
export default {
  data() {
    return {
      // 官方试例数据
      option1: {
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
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      },
      // 需要合并的数据
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
      },
      // 请求接收到的数据和上面合并后的数据,真正图表的完整数据
      options1: []
    }
  },
  async mounted() {
    const myChart = echarts.init(document.getElementById('main'))
    // const myChart = echarts.init(this.$refs.echartsDiv)
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败!')
    }
    console.log(res)
    this.options1 = _.merge(res.data, this.options)
    myChart.setOption(this.options1)
  }
}
</script>