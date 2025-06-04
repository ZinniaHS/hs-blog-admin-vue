<template>
  <div class="dashboard-container">
    <el-card class="welcome-card">
      <div class="project-intro">
        <div class="logo-container">
          <img src="../statics/images/brand2.png" alt="项目图标" class="project-logo">
        </div>
        <div class="intro-text">
          <h2>hs-blog</h2>
          <p>hs-blog是一个线上博客平台，一个知识记录，分享平台。在这里，用户可以分享自己个人的学习笔记，经验；同时平台提供了一些电子书，以学习交流的目的供用户阅读与参考。</p>
        </div>
        <!--    Github,Gitee图标    -->
        <div class="repo-links">
          <el-link type="primary" href="https://github.com/yourusername/blog-project" target="_blank" :underline="false">
            <el-icon class="repo-icon"><svg t="1687851392721" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6349" width="24" height="24"><path d="M511.957333 12.650667C229.248 12.650667 0 241.877333 0 524.672c0 226.197333 146.688 418.090667 350.165333 485.802667 25.6 4.693333 34.944-11.093333 34.944-24.682667 0-12.16-0.426667-44.352-0.682666-87.082667-142.421333 30.933333-172.48-68.629333-172.48-68.629333C188.672 770.944 155.093333 755.2 155.093333 755.2c-46.549333-31.786667 3.52-31.146667 3.52-31.146667 51.456 3.626667 78.528 52.821333 78.528 52.821334 45.674667 78.336 119.829333 55.68 149.013334 42.581333 4.608-33.109333 17.856-55.68 32.512-68.458667-113.706667-12.928-233.216-56.853333-233.216-252.970666 0-55.893333 19.968-101.546667 52.693333-137.386667-5.290667-12.928-22.826667-65.002667 5.013333-135.509333 0 0 42.988-13.738667 140.8 52.48 40.832-11.349333 84.650667-17.024 128.170667-17.237334 43.52 0.213333 87.338667 5.888 128.213333 17.237334 97.749333-66.218667 140.650667-52.48 140.650667-52.48 27.946667 70.506667 10.410667 122.581333 5.12 135.509333 32.810667 35.84 52.608 81.493333 52.608 137.386667 0 196.693333-119.680 239.936-233.6 252.650666 18.389333 15.786667 34.773333 47.104 34.773333 94.912 0 68.522667-0.64 123.776-0.64 140.458667 0 13.696 9.216 29.610667 35.2 24.576C877.44 942.570667 1024 750.784 1024 524.672 1024 241.877333 794.730667 12.650667 511.957333 12.650667z"></path></svg></el-icon>
            GitHub
          </el-link>
          <el-link type="danger" href="https://gitee.com/yourusername/blog-project" target="_blank" :underline="false" style="margin-left: 20px;">
            <el-icon class="repo-icon"><svg t="1687851423407" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7449" width="24" height="24"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z"></path></svg></el-icon>
            Gitee
          </el-link>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>访问趋势分析</span>
              <el-radio-group v-model="visitTimeRange" size="small">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="visitTrendChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>文章分类统计</span>
            </div>
          </template>
          <div ref="categoryChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
// 修正图标导入
import {
  View,
  User,
  Document,
  ChatDotRound, // 使用 ChatDotRound 替代 Chat
  DataAnalysis,
  Histogram
} from '@element-plus/icons-vue';
// 修正 ECharts 的导入
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import request from '@/utils/request'

// 注册必要的 ECharts 组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer
]);


// 概览数据 - 修正图标名称
const overviewData = ref([
  { title: '今日访问量', value: 0, icon: View, type: 'visits' },
  { title: '总用户数', value: 0, icon: User, type: 'users' },
  { title: '文章总数', value: 0, icon: Document, type: 'articles' },
  { title: '总评论数', value: 0, icon: ChatDotRound, type: 'comments' } // 使用 ChatDotRound 替代
]);

// 图表引用
const visitTrendChart = ref(null);
const categoryChart = ref(null);

// 图表实例
let visitChart = null;
let catChart = null;
let engChart = null;
let perfChart = null;

// 时间范围选择
const visitTimeRange = ref('week');

// 监听时间范围变化
watch(visitTimeRange, (newVal) => {
  fetchVisitTrend(newVal);
});

// 初始化
onMounted(() => {
  fetchOverviewData();
  initCharts();
  fetchVisitTrend(visitTimeRange.value);
  fetchCategoryData();

  // 响应式处理
  window.addEventListener('resize', handleResize);
});

// 初始化所有图表
const initCharts = () => {
  // 初始化访问趋势图表
  visitChart = echarts.init(visitTrendChart.value);

  // 初始化分类统计图表
  catChart = echarts.init(categoryChart.value);
};

// 窗口大小变化时重绘图表
const handleResize = () => {
  visitChart && visitChart.resize();
  catChart && catChart.resize();
  engChart && engChart.resize();
  perfChart && perfChart.resize();
};

// 获取概览数据
const fetchOverviewData = async () => {
  try {
    const response = await axios.get('/api/dashboard/overview');
    // 假设后端返回的数据结构和我们前端定义的结构一致
    overviewData.value[0].value = response.data.todayVisits;
    overviewData.value[1].value = response.data.totalUsers;
    overviewData.value[2].value = response.data.totalArticles;
    overviewData.value[3].value = response.data.totalComments;
  } catch (error) {
    console.error('获取概览数据失败:', error);
    ElMessage.error('获取概览数据失败');

    // 模拟数据用于展示
    overviewData.value[0].value = 2346;
    overviewData.value[1].value = 9823;
    overviewData.value[2].value = 358;
    overviewData.value[3].value = 1205;
  }
};

// 获取访问趋势数据
const fetchVisitTrend = async (timeRange) => {
  try {
    const response = await axios.get(`/api/dashboard/visits?range=${timeRange}`);
    renderVisitTrend(response.data);
  } catch (error) {
    console.error('获取访问趋势数据失败:', error);

    // 模拟数据用于展示
    const mockData = {
      dates: timeRange === 'week'
          ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          : Array.from({length: 30}, (_, i) => `${i+1}日`),
      pv: timeRange === 'week'
          ? [1200, 1350, 1400, 1500, 1800, 1100, 900]
          : Array.from({length: 30}, () => Math.floor(Math.random() * 1500) + 800),
      uv: timeRange === 'week'
          ? [800, 900, 950, 1000, 1200, 750, 600]
          : Array.from({length: 30}, () => Math.floor(Math.random() * 1000) + 500)
    };
    renderVisitTrend(mockData);
  }
};

// 渲染访问趋势图表
const renderVisitTrend = (data) => {
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['页面浏览量(PV)', '访客数(UV)']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '页面浏览量(PV)',
        type: 'line',
        smooth: true,
        data: data.pv,
        areaStyle: {
          opacity: 0.1
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '访客数(UV)',
        type: 'line',
        smooth: true,
        data: data.uv,
        areaStyle: {
          opacity: 0.1
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  };

  visitChart.setOption(option);
};

// 获取分类数据
const fetchCategoryData = async () => {
  try {
    const response = await request.get('/statistics/getBlogCategoryStatistics');
    console.log("分类数据:", response.data); // 添加日志查看数据结构

    // 确保数据是数组格式
    if (Array.isArray(response.data)) {
      renderCategoryChart(response.data);
    } else if (response.data && Array.isArray(response.data.data)) {
      // 如果数据在 data 属性中
      renderCategoryChart(response.data.data);
    } else {
      console.error('分类数据格式不正确:', response.data);
      // 使用模拟数据
      const mockData = [
        { name: '技术', value: 45 },
        { name: '生活', value: 25 },
        { name: '读书', value: 15 },
        { name: '旅行', value: 10 },
        { name: '其他', value: 5 }
      ];
      renderCategoryChart(mockData);
    }
  } catch (error) {
    console.error('获取分类数据失败:', error);

    // 模拟数据用于展示
    const mockData = [
      { name: '技术', value: 45 },
      { name: '生活', value: 25 },
      { name: '读书', value: 15 },
      { name: '旅行', value: 10 },
      { name: '其他', value: 5 }
    ];
    renderCategoryChart(mockData);
  }
};
// 渲染分类统计图表
const renderCategoryChart = (data) => {
  // 确保 data 是数组
  if (!Array.isArray(data)) {
    console.error('分类图表数据不是数组:', data);
    data = []; // 设置为空数组避免错误
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map(item => item.name || '未知')
    },
    series: [
      {
        name: '文章分类',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };

  catChart.setOption(option);
};

</script>

<style scoped>
.stats-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.welcome-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.date-text {
  color: #909399;
  font-size: 14px;
}

/* 项目介绍区域样式 */
.project-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;
}

.logo-container {
  margin-bottom: 20px;
}

.project-logo {
  width: 150px;
  height: 150px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-logo:hover {
  transform: scale(1.05);
}

.intro-text {
  max-width: 800px;
  margin-bottom: 30px;
}

.intro-text h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 15px;
}

.intro-text p {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.repo-links {
  display: flex;
  justify-content: center;
  align-items: center;
}

.repo-icon {
  margin-right: 6px;
}

.overview-data {
  margin-top: 10px;
}

.data-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 8px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.15);
}

.articles {
  background: linear-gradient(to right, #409EFF, #65B5FF);
}

.views {
  background: linear-gradient(to right, #67C23A, #95D475);
}

.comments {
  background: linear-gradient(to right, #E6A23C, #EEBE77);
}

.likes {
  background: linear-gradient(to right, #F56C6C, #F89898);
}

.data-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.data-title {
  font-size: 14px;
  opacity: 0.8;
}

.card-icon {
  font-size: 46px;
  opacity: 0.8;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.chart {
  height: 300px;
  width: 100%;
}

.popular-articles {
  margin-bottom: 20px;
  border-radius: 8px;
}

.highlight-text {
  color: #409EFF;
  font-weight: bold;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .data-card {
    height: 90px;
    padding: 15px;
  }

  .data-value {
    font-size: 22px;
  }

  .card-icon {
    font-size: 36px;
  }

  .chart {
    height: 250px;
  }

  .project-logo {
    width: 120px;
    height: 120px;
  }

  .intro-text h2 {
    font-size: 20px;
  }

  .intro-text p {
    font-size: 14px;
  }

  .repo-links {
    flex-direction: column;
  }

  .repo-links .el-link:last-child {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>