<template>
  <!-- 表格部分 -->
  <div class="blog-container">
    <div class="insertAndDelete">
      <div class="button-group">
        <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @selection-change="handleSelectionChange"
            @click="deleteBlog">删除</el-button>
      </div>
      <div class="search-container">
        <el-input
            v-model="searchKeyword"
            placeholder="请输入搜索内容"
            clearable
            @keyup.enter="pageQuery">
          <template #append>
            <el-button :icon="Search" @click="pageQuery" />
          </template>
        </el-input>
      </div>
    </div>
    <div class="table-container">
      <el-table :data="Blogs.blog" style="margin:5px;width: 100%"
                stripe :fit="true" :header-cell-style="{ background: '#f5f7fa' }" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" header-class-name="header-center" />
        <el-table-column fixed prop="title" label="标题" min-width="180" />
        <el-table-column prop="subTitle" label="副标题" min-width="180" />
        <el-table-column prop="username" label="用户" min-width="120" />
        <el-table-column prop="categoryName" label="分类" min-width="120" />
        <el-table-column prop="lockStatus" label="状态" min-width="120" >
          <template #default="scope">
          <span class="status-tag">
            <span class="status-dot" :class="{ 'red': scope.row.lockStatus === 1, 'green': scope.row.lockStatus !== 1 }"></span>
            {{ scope.row.lockStatus === 1 ? '已锁定' : '未锁定' }}
          </span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="switchlockStatus(scope.row)">{{ scope.row.lockStatus === 1 ? '解锁' : '锁定' }}</el-button>
            <el-button link type="primary" size="small" @click="editDetail(scope.row.id)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="blogPageQueryDTO.pageNum"
            v-model:page-size="blogPageQueryDTO.pageSize"
            :page-sizes="[5, 10, 20]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="Blogs.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"/>
      </div>
    </div>
  </div>
  <!-- 博客修改/详情页面 -->
  <el-dialog v-model="dialogShowDetail" title="博客详情">
    <el-form ref="formRef"
             :model="blogUpdateDTO"
             :rules="rules"
             label-width="120px"
             :disabled="!isEditing"
             @submit.native.prevent="saveChanges">
      <el-form-item prop="title" label="标题" >
        <el-input v-model="blogUpdateDTO.title" />
      </el-form-item>
      <el-form-item prop="subTitle" label="副标题">
        <el-input v-model="blogUpdateDTO.subTitle" />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="blogUpdateDTO.username"  disabled/>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="blogUpdateDTO.categoryId" placeholder="请选择分类">
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="content">
        <div class="editor-area">
          <RichEditor v-model="blogUpdateDTO.content" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogShowDetail = false">取消</el-button>
      <el-button type="primary" @click="saveChanges" v-if="isEditing">保存</el-button>
    </template>
  </el-dialog>

</template>

<script setup lang="ts">
import RichEditor from '@/components/RichEditor.vue'
import { ref, reactive, onMounted } from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import request from '@/utils/request'
import qs from 'qs';

// 表单相关
const dialogSaveBlog = ref(false);
const dialogShowDetail = ref(false);
const isEditing = ref(false);
const selectedRows = ref([]);
const searchKeyword = ref('');
// 分页查询实体
const blogPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 5,
  keyWord: ''
});
// 分类数据
const categories = ref([]);
// 当多选框被选中时触发
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
  console.log(selectedRows.value);
};
// 展示图书修改界面
const editDetail = (id) => {
  dialogShowDetail.value = true;
  showDetail(id);
  isEditing.value = true; // 启用表单
}
// 表单数据
const saveBlogDTO = reactive({

});
// 博客更新实体
const blogUpdateDTO = ref({
  id: '',
  title: '',
  subTitle: '',
  content: '',
  summary: '',
  authorId: '',
  categoryId: '',
  coverUrl: '',
  status: 0
})
// 规则验证
const rules = reactive({
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' },
    { max: 200, message: '不能超过200个字符', trigger: ['blur', 'input'] }
  ],
  content: [
    { required: true, message: '内容不能为空', trigger: 'blur' }
  ]
});
// 表格数据
const Blogs = reactive({
  blog: [],
  total: 0
});
// 生命周期
onMounted(async () => {
  await load();
  await loadCategories()
});
// 分页查询
const load = async () => {
  try {
    request.get('/admin/blog/page',{
      params: {
        pageNum: blogPageQueryDTO.pageNum,
        pageSize: blogPageQueryDTO.pageSize,
        keyWord: blogPageQueryDTO.keyWord
      }
    }).then((res) => {
      // console.log(res);
      Blogs.blog = res.data.records;
      Blogs.total = res.data.total;
    })
  } catch (error) {
    ElMessage.error('加载分类失败');
  }
};
// 加载数据
const loadCategories = async () => {
  try {
    request.get('/admin/blogCategory/all')
    .then((res) => {
      // console.log(res);
      categories.value = res.data
    })
  } catch (err) {
    ElMessage.error('数据加载失败');
  }
};
// 分页处理
const handleSizeChange = () => { load(); };
const handleCurrentChange = (newPage: number) => {
  blogPageQueryDTO.pageNum = newPage;
  load();
};
// 搜索处理
const pageQuery = () => {
  blogPageQueryDTO.keyWord = searchKeyword.value;
  load();
};
// 操作处理
const deleteBlog = async () => {
  try {
    ElMessageBox.confirm(
        '确定要删除吗？',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
    ).then(() => {
      request.delete('/admin/blog/batchDelete',{
        params: {
          ids: selectedRows.value.map(item => item.id)
        },
        paramsSerializer: params => {
          return qs.stringify(params, {
            arrayFormat: 'repeat' // 生成 ids=7&ids=3&ids=4 格式
          });
        }
      }).then((res) => {
        ElMessage({
          message: '删除成功！',
          type: 'success',
        })
        load()
      })
    })
  } catch (error) {}
};
// 切换锁定状态
const switchlockStatus = async (rowData) => {
  try {
    request.post('/admin/blog/lockStatus/'+rowData.lockStatus,null,{
      params: {
        id: rowData.id,
      }
    }).then((res) => {
      ElMessage({
        message: '状态切换成功！',
        type: 'success',
      })
      load()
    })
  } catch (error) {}
};
// 保存博客
const saveChanges = async () => {
  try {
    request.put('/admin/blog',{
      id: blogUpdateDTO.value.id,
      title: blogUpdateDTO.value.title,
      subTitle: blogUpdateDTO.value.subTitle,
      content: blogUpdateDTO.value.content,
    }).then(res=>{
      ElMessage.success('修改成功');
      dialogShowDetail.value = false;
      load();
    })
  } catch (error) {
    ElMessage.error('修改失败');
  }
};
// 公共方法
const reset = () => {
  Object.assign(saveBlogDTO, {
    id: '',
    title: '',
    subTitle: '',
    content: '',
    summary: '',
    authorId: '',
    categoryId: '',
    coverUrl: '',
    status: 0
  });
};
// 展示博客详情
const showDetail = (id: number) => {
  request.get('/admin/blog/'+id).then((res) => {
    console.log(res);
    blogUpdateDTO.value = res.data
  })
  isEditing.value = true;
};
</script>

<style lang="scss">

.blog-container {
  margin: 10px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  // 移除固定max-height，改用flex填充
  flex: 1;
  overflow: hidden;
}

.table-container {
  // 改为100%高度继承
  height: 100%;
  overflow: auto; // 允许表格内容滚动

  // 新增表格高度控制
  & > .el-table {
    min-height: 400px; // 保证表头始终可见
    max-height: calc(100% - 60px); // 减去分页高度
  }
}

.insertAndDelete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  gap: 12px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.search-container {
  margin-left: auto;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 0.8em;
}

.el-table {
  display: block;
  overflow-y: auto;
  overflow-x: hidden;
}

.el-table__body-wrapper {
  min-height: 300px;
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}
//.table{
//    // 边框阴影
//    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
//    border-radius: 4px;
//    overflow: hidden; /* 确保阴影不被圆角裁剪 */
//  }
//  .page{
//    display: flex;
//    flex-direction: column;
//    align-items: center;
//    margin: 10px;
//  }
.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.green {
  background-color: #67C23A;
}

.red {
  background-color: #F56C6C;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 200px;       // 设置固定宽度
  height: 200px;      // 设置固定高度
  object-fit: cover;  // 保持比例填充，可裁剪多余部分
  // 或使用下面这个属性如果希望完整显示图片
  // object-fit: contain;
}

/* 同时需要调整上传组件的容器尺寸 */
.avatar-uploader .el-upload {
  width: 200px;
  height: 200px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>