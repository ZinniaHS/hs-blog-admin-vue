import axios from "axios"
import {ElMessage} from "element-plus";
const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout:30000,//后台接口超时时间
    headers: {
        'Accept': 'application/json' // 明确声明接受 JSON
    }
})
//request 拦截器
//可以自请求发送前对请求做一些处理
request.interceptors.request.use( config => {
    config.headers['Content-Type']= 'application/json; charset=utf-8'
    // 从 localStorage 获取 Token 并添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config
}, error =>{
    return Promise.reject(error)
});

//response 拦截器
//可以在接口响应后统一处理结果
request.interceptors.response.use(
    (response) => {
        let res = response.data;
        // 处理字符串转 JSON（如后端返回字符串形式的 JSON）
        if (typeof res === 'string') {
            try {
                res = JSON.parse(res);
            } catch (err) {
                console.error('解析响应数据失败:', err);
                return Promise.reject(new Error('数据解析异常'));
            }
        }
        // 必须显式返回处理后的数据 ✅
        return res;
    },
    (error) => {
        // 保持原有错误处理逻辑
        if (error.response?.status === 401) {
            ElMessage.error('未授权');
            localStorage.removeItem('token');
            ElMessage.error('身份验证失效，请重新登录');
            router.push('/Login');
        } else if (error.response?.status === 500) {
            ElMessage.error('系统异常');
        }
        return Promise.reject(error);
    }
);

export default request;