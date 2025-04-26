<template>
  <!-- 表格部分 -->
  <div class="book-container">
    <div class="insertAndDelete">
      <div class="button-group">
        <el-button type="primary" @click="dialogSaveBook=true">新增图书</el-button>
        <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @selection-change="handleSelectionChange"
            @click="deleteBook">删除</el-button>
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
      <el-table :data="data.tableData" style="margin:5px;width: 100%"
                stripe :fit="true" :header-cell-style="{ background: '#f5f7fa' }" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" header-class-name="header-center" />
        <el-table-column fixed prop="title" label="书名" min-width="180" />
        <el-table-column prop="author" label="作者" min-width="120" />
        <el-table-column prop="publisher" label="出版社" min-width="120" />
        <el-table-column prop="description" label="书籍描述" min-width="300" show-overflow-tooltip />
        <el-table-column prop="status" label="书籍状态" min-width="120" >
          <template #default="scope">
          <span class="status-tag">
            <span class="status-dot" :class="{ 'green': scope.row.status === 1, 'red': scope.row.status !== 1 }"></span>
            {{ scope.row.status === 1 ? '上架' : '已下架' }}
          </span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="150">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="switchStatus(scope.row)">{{ scope.row.status === 1 ? '下架' : '上架' }}</el-button>
            <el-button link type="primary" size="small" @click="dialogShowDetail=true;editDetail(scope.row.id)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="bookPageQueryDTO.pageNum"
            v-model:page-size="bookPageQueryDTO.pageSize"
            :page-sizes="[5, 10, 20]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="data.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"/>
      </div>
    </div>
  </div>
  <!-- 图书修改/详情页面 -->
  <el-dialog v-model="dialogShowDetail" title="图书详情">
    <el-form ref="formRef"
             :model="bookUpdateDTO"
             :rules="rules"
             label-width="120px"
             :disabled="!isEditing"
             @submit.native.prevent="saveChanges">
      <el-form-item prop="title" label="书名" >
        <el-input v-model="bookUpdateDTO.title" />
      </el-form-item>
      <el-form-item prop="author" label="作者">
        <el-input v-model="bookUpdateDTO.author" />
      </el-form-item>
      <el-form-item label="类别">
        <el-cascader :options="bookCategory"
                     v-model="selectedUpdateValues"
                     :show-all-levels="false"
                     @change="changeUpdateCategory"/>
      </el-form-item>
      <el-form-item prop="isbn" label="ISBN号码">
        <el-input v-model="bookUpdateDTO.isbn" />
      </el-form-item>
      <el-form-item prop="publisher" label="出版社">
        <el-input v-model="bookUpdateDTO.publisher" />
      </el-form-item>
      <el-form-item prop="publishDate" label="出版时间">
        <el-date-picker
            v-model="bookUpdateDTO.publishDate"
            type="date"
            placeholder="选择日期"
            @change="changePublishDate"
        />
      </el-form-item>
      <el-form-item prop="description" label="图书简介">
        <el-input v-model="bookUpdateDTO.description" type="textarea" />
      </el-form-item>
      <el-form-item label="图书封面图片">
        <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            accept="image/*"
        >
          <img v-if="bookUpdateDTO.coverUrl" :src="bookUpdateDTO.coverUrl" class="avatar">
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
<!--          <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5MB</div>-->
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogShowDetail = false">取消</el-button>
      <el-button type="primary" @click="saveChanges" v-if="isEditing">保存</el-button>
    </template>
  </el-dialog>
  <!-- 新增图书 -->
  <el-dialog v-model="dialogSaveBook" title="新增图书">
    <el-form ref="formRef"
             :model="saveBookDTO"
             :rules="rules"
             label-width="120px"
             @submit.native.prevent="saveBook">
      <el-form-item prop="title" label="书名">
          <span class="form-tip">
            <el-input v-model="saveBookDTO.title" />1-50个字符
          </span>
      </el-form-item>
      <el-form-item prop="author" label="作者">
        <el-input v-model="saveBookDTO.author" />
        <span class="form-tip">1-50个字符</span>
      </el-form-item>
      <el-form-item prop="bookCategory" label="类别">
        <el-cascader :options="bookCategory"
                     v-model="selectedSaveValues"
                     :show-all-levels="false"
                     @change="changeCategory"/>
      </el-form-item>
      <el-form-item prop="isbn" label="ISBN号码">
        <el-input v-model="saveBookDTO.isbn" />
        <span class="form-tip">13位数字，需符合ISBN-13规范</span>
      </el-form-item>
      <el-form-item prop="publisher" label="出版社">
        <el-input v-model="saveBookDTO.publisher" />
        <span class="form-tip">1-50个字符</span>
      </el-form-item>
      <el-form-item prop="publishDate" label="出版时间">
        <el-date-picker
            v-model="saveBookDTO.publishDate"
            type="date"
            placeholder="选择日期"
            @change="changePublishDate"
        />
      </el-form-item>
      <el-form-item prop="description" label="图书简介">
        <el-input v-model="saveBookDTO.description" type="textarea" />
        <span class="form-tip">图书描述最多300个字符</span>
      </el-form-item>
      <el-form-item label="图书封面图片">
        <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            accept="image/*"
        >
          <img v-if="saveBookDTO.coverUrl" :src="saveBookDTO.coverUrl" class="avatar">
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
<!--          <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5MB</div>-->
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="reset">重置</el-button>
      <el-button @click="dialogSaveBook = false">取消</el-button>
      <el-button :disabled="!formValid" type="primary" @click="saveBook">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import request from '@/utils/request'
import {computed, reactive} from "vue";
import {Action, dayjs, ElMessage, ElMessageBox} from 'element-plus'
import { ref } from 'vue';
import {Search} from "@element-plus/icons-vue";
import qs from 'qs';
const formRef = ref(null)

// 搜索框中输入的内容
const searchKeyword = ref('')
// 批量删除时多选对应的行
const selectedRows = ref([]);
// 新增图书对话框
const dialogSaveBook = ref(false);
// 修改详情对话框
const dialogShowDetail = ref(false);
// 判断当前是详情页还是修改页
const isEditing = ref(false);
// 新增时，级联选择器绑定选中的值（默认为空数组）
const selectedSaveValues = ref([])
// 更新时，级联选择器绑定选中的值（默认为空数组）
const selectedUpdateValues = ref([])
// 使用 ref 来存储分类数据
const bookCategory = ref([]);
// 上传图书封面请求连接
const uploadUrl = 'http://localhost:8080/admin/common/upload'
// 上传变量
// const uploadHeaders = computed(() => ({
//   Authorization: `Bearer ${localStorage.getItem('token')}` // 根据实际情况调整
// }));
// ISBN验证函数
const validateISBN = (rule, value) => {
  if (!value) return Promise.reject('ISBN不能为空')
  const isbn = value.replace(/-/g, '')
  if (!/^\d{13}$/.test(isbn)) return Promise.reject('必须是13位数字')
  if (!['978', '979'].includes(isbn.substring(0,3)))
    return Promise.reject('必须以978或979开头')

  const weights = Array.from({ length: 12 }, (_, i) => i % 2 === 0 ? 1 : 3)
  const sum = isbn.slice(0,12).split('').reduce((acc, d, i) =>
      acc + Number(d) * weights[i], 0)
  const checkCode = (10 - (sum % 10)) % 10
  if (checkCode !== Number(isbn[12]))
    return Promise.reject('ISBN校验码不正确')

  return Promise.resolve()
}
// 验证规则
const rules = reactive({
  title: [
    { required: true, message: '书名不能为空', trigger: 'blur' },
    { max: 50, message: '不能超过50个字符', trigger: ['blur', 'input'] }
  ],
  author: [
    { required: true, message: '作者不能为空', trigger: 'blur' },
    { max: 50, message: '不能超过50个字符', trigger: ['blur', 'input'] }
  ],
  isbn: [
    { required: true, message: 'ISBN不能为空', trigger: 'blur' },
    { validator: validateISBN, trigger: ['blur', 'input'] }
  ],
  publisher: [
    { required: true, message: '出版社不能为空', trigger: 'blur' },
    { max: 50, message: '不能超过50个字符', trigger: ['blur', 'input'] }
  ],
  publishDate: [
    { required: true, message: '请选择出版日期', trigger: 'blur' },
  ],
  description: [
    { max: 300, message: '不能超过300个字符', trigger: ['blur', 'input'] }
  ],
  coverUrl: [
    { required: true, message: '请上传图书封面', trigger: 'blur' }
  ]
})
// 验证表单有效
const formValid = computed(() => {
  return new Promise(resolve => {
    formRef.value.validate(valid => {
      resolve(valid)
    })
  })
})
// 图书表格信息和当前总数
const data = reactive({
  tableData: [],
  total: 1,
})
// 图书新增实体
const saveBookDTO = reactive({
  id: '',
  title: '',
  author: '',
  categoryId:'',
  isbn: '',
  publisher: '',
  publishDate: '',
  description: '',
  downloadCount: 0,
  coverUrl: '',
  bookCategory: []
})
// 分页查询实体
const bookPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 5,
  keyWord: '',
})
// 图书更新实体
const bookUpdateDTO = reactive({
  id: '',
  title: '',
  author: '',
  categoryId:'',
  isbn: '',
  publisher: '',
  publishDate: '',
  description: '',
  downloadCount: 0,
  coverUrl: '',
  bookCategory: []
})

// 加载图书分类
const loadCategories = async () => {
  try {
    const response = await request.get('/admin/bookCategory/all'); // 请替换为实际的后端接口
    console.log(response)
    bookCategory.value = response.data.map(category => ({
      value: category.id,
      label: category.name,
      children: category.children ? category.children.map(child => ({
        value: child.id,
        label: child.name,
      })) : []
    }));
  } catch (error) {
    ElMessage({ message: '加载分类失败', type: 'error' });
  }
};

// 初始化加载
loadCategories();

// 分页查询
const load = () =>{
  request.get('/admin/book/page',{
    params: {
      pageNum: bookPageQueryDTO.pageNum,
      pageSize: bookPageQueryDTO.pageSize,
      keyWord: bookPageQueryDTO.keyWord
    }
  }).then((res) => {
    data.tableData = res.data.records
    data.total = res.data.total
  }).catch((err) => {
    console.log(err)
  })
}
// 加载页面时调用分页查询
load()

// 点击搜索框后搜索数据
const pageQuery = ()=>{
  bookPageQueryDTO.keyWord = searchKeyword.value
  load()
}
// 当多选框被选中时触发
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
  // console.log(selectedRows.value);
};
// 选择每页显示多少条记录时，触发分页查询
const handleSizeChange = () =>{
  load()
}
// 点击其他页面的时候触发分页查询
const handleCurrentChange = () =>{
  load()
}
// 图书详情
const showDetail = (id) => {
  dialogShowDetail.value = true;
  isEditing.value = false; // 禁用表单
  request.get('/admin/book/'+id,{
  }).then((res) => {
    console.log(res)
    bookUpdateDTO.id = res.data.id
    bookUpdateDTO.title = res.data.title
    bookUpdateDTO.author = res.data.author
    bookUpdateDTO.isbn = res.data.isbn
    bookUpdateDTO.publisher = res.data.publisher
    // 转换日期格式
    bookUpdateDTO.publishDate = ref(new Date(res.data.publishDate))
    bookUpdateDTO.description = res.data.description
    bookUpdateDTO.downloadCount = res.data.downloadCount
    bookUpdateDTO.coverUrl = res.data.coverUrl
    let bookCategory = res.data.bookCategory
    selectedUpdateValues.value = [bookCategory.parentId, bookCategory.id]
    bookUpdateDTO.categoryId = bookCategory.id
  })
}
// 增加一天
function addOneDay(dateStr) {
  return dayjs(dateStr)
      .add(1, 'day')
      .format('YYYY-MM-DD'); // 自动输出本地时间
}
// 修改界面中：选择图书分类时触发
const changeUpdateCategory = (obj) =>{
  // obj[0]是顶级分类的id
  // obj[1]是子分类的id
  bookUpdateDTO.categoryId = obj[1];
}
// 新增界面中：选择图书分类时触发
const changeCategory = (obj) =>{
  // obj[0]是顶级分类的id
  // obj[1]是子分类的id
  saveBookDTO.categoryId = obj[1];
}
// 选择出版日期时触发
const changePublishDate = (obj) =>{
  bookUpdateDTO.publishDate = obj;
  console.log(bookUpdateDTO.publishDate)
}
// 展示图书修改界面
const editDetail = (id) => {
  dialogShowDetail.value = true;
  showDetail(id);
  isEditing.value = true; // 启用表单
}
// 重置新增图书表单
function reset(){
  saveBookDTO.id = '';
  saveBookDTO.title = '';
  saveBookDTO.author = '';
  saveBookDTO.categoryId = '';
  saveBookDTO.isbn = '';
  saveBookDTO.publisher = '';
  saveBookDTO.publishDate = '';
  saveBookDTO.description = '';
  saveBookDTO.downloadCount = 0;
  saveBookDTO.coverUrl = '';
  saveBookDTO.bookCategory = [];
  selectedSaveValues.value = [];
  // ElMessage({
  //   message: "重置成功！",
  //   type: 'success',
  // })
}
// 保存新增图书
const saveBook = async () => {
  console.log(selectedSaveValues.value)
  try {
    await formRef.value.validate()
    request.post('/admin/book',{
      id: saveBookDTO.id,
      title: saveBookDTO.title,
      author: saveBookDTO.author,
      isbn: saveBookDTO.isbn,
      publisher: saveBookDTO.publisher,
      // 转换为 yyyy-MM-dd 并加一天，这是因为时区问题
      publishDate: addOneDay(saveBookDTO.publishDate.toISOString().split('T')[0]),
      description: saveBookDTO.description,
      downloadCount: saveBookDTO.downloadCount,
      coverUrl: saveBookDTO.coverUrl,
      categoryId: saveBookDTO.categoryId
    }).then((res) => {
      ElMessage({
        message: '保存成功！',
        type: 'success',
      })
      // 清空表单
      reset()
      dialogSaveBook.value = false;
      load()
    }).catch((err) => {
      ElMessage({
        message: err,
        type: 'error',
      })
    })
  } catch (error) {
    console.log(error)
    ElMessage({
      message: "请完善信息后提交！",
      type: 'error',
    })
  }
}
// 保存图书修改信息
const saveChanges = async () => {
  console.log(bookUpdateDTO.categoryId);
  try {
    await formRef.value.validate()
    request.put('/admin/book',{
      id: bookUpdateDTO.id,
      title: bookUpdateDTO.title,
      author: bookUpdateDTO.author,
      isbn: bookUpdateDTO.isbn,
      publisher: bookUpdateDTO.publisher,
      // 转换为 yyyy-MM-dd 并加一天，这是因为时区问题
      publishDate: addOneDay(bookUpdateDTO.publishDate.toISOString().split('T')[0]),
      description: bookUpdateDTO.description,
      downloadCount: bookUpdateDTO.downloadCount,
      coverUrl: bookUpdateDTO.coverUrl,
      categoryId: bookUpdateDTO.categoryId
    }).then((res) => {
      ElMessage({
        message: '修改成功！',
        type: 'success',
      })
      dialogShowDetail.value = false;
      load()
    }).catch((err) => {
      ElMessage({
        message: err,
        type: 'error',
      })
    })
  }catch(err) {
    ElMessage({
      message: "请完善信息后提交！",
      type: 'error',
    })
  }

}
// 切换上架下架的状态
const switchStatus = (rowData) => {
  request.post('/admin/book/status/'+rowData.status,null,{
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
}
// 删除图书
const deleteBook =  () => {
  console.log(selectedRows.value.map(item => item.id))
  try {
    request.delete('/admin/book/batchDelete',{
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
  }catch(err) {
    console.log(err)
  }
}
// 图书封面上传成功处理
const handleUploadSuccess = (response: any) => {
  console.log(response)
  const dto = isEditing.value ? bookUpdateDTO : saveBookDTO;
  dto.coverUrl = response.data;
  ElMessage.success('上传成功');
};
// 图书封面上传前校验
const beforeUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isJPG) {
    ElMessage.error('只能上传 JPG/PNG 格式图片!');
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
  }

  return isJPG && isLt5M;
};


</script>

<style lang="scss">

.book-container {
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