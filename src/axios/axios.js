import axios from "axios";
import that from "./../main";
import qs from "qs";
const baseURL = "http://form.vipgz2.idcfengye.com/api/";
//文件上传参数
const uploadURL = "file/gridfs/upload";
const uploadName = "file";
//返回拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.message && error.message.includes("timeout")) {
            that.GLOBAL.toastInfo("请求超时，请检查网络或稍候重试！", "error");
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

//过滤空值及转换
function filterEmptyData(params) {
    let value;
    if (params instanceof Object) {
        for (let i in params) {
            value = params[i];
            if (
                (value === null ||
                    value === "" ||
                    value === undefined ||
                    value === "undefined") &&
                value !== 0
            ) {
                delete params[i];
            }
            if (value instanceof Array && value.length > 0) {
                params[i] = value.join(",");
            }
        }
    }
    return params;
}

function ajax(options) {
    //是否需要加载
    let isLoading = options.data && options.data.loading ? options.data.loading : false;
    let params = {
        baseURL: baseURL,
        url: options.url,
        headers: options.headers ? options.headers : {},
        timeout: 10000,
        method: options.method ? options.method : "POST",
        transformRequest: [function(data, headers){
            if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                return qs.stringify(data);
            } else if (headers['Content-Type'] === 'multipart/form-data;charset=UTF-8') {
                return data;
            } else {
                headers['Content-Type'] = 'application/json'
            }
            return JSON.stringify(data);
        }],
        withCredentials: true
    };
    if(options.method && options.method.toLowerCase() === 'get') {
        params.params = options.data && options.data.params ? options.data.params : "";
    } else {
        params.data = options.data && options.data.params ? options.data.params : "";
    }
    if (isLoading) {
        that.GLOBAL.changLoading('show');
    }
    return new Promise((resolve, reject) => {
        axios(params).then(res => {
            let data = res.data;
            let code = data.code;
            //关闭加载
            if (isLoading) {
                that.GLOBAL.changLoading('hide');
            }
            console.warn(data);
            if (res.status === 200 && code === 0) {
                resolve(data);
            } else {
                let message = data.message;
                that.GLOBAL.toastInfo(message, 'error');
                reject();
            }
        }).catch(err => {
            //关闭加载
            if (isLoading) {
                that.GLOBAL.changLoading('hide');
            }
            reject(err);
        });
    });
}

//获取部门列表
function getApartmentList(){
    return new Promise((resolve, reject) => {
        ajax({
            url: "base/org/form",
            method: 'get'
        }).then(res => {
            resolve(res);
        })
    })
}
//获取人员列表
function getPersonList(options){
    return new Promise((resolve, reject) => {
        ajax({
            url: "base/user/form",
            method: 'get',
            data: options ? options.data : null
        }).then(res => {
            resolve(res);
        })
    })
}
//获取位置数据
function getLocationData(options){
    return new Promise((resolve, reject) => {
        ajax({
            url: "base/location/form",
            method: 'get',
            data: options ? options.data : null
        }).then(res => {
            resolve(res);
        })
    })
}
//上传文件的mapCode码
function getMapCode(){
    return new Promise((resolve, reject) => {
        ajax({
            url: baseURL + 'file/attach/generate/mapCode',
        }).then(res => {
            resolve(res.data);
        })
    })
}


let instance = axios.create({
    baseURL: baseURL,
    timeout: 1000
});
//上传文件
function uploadFile(options){
    let isLoading = options.data && options.data.loading ? options.data.loading : false;
    if (isLoading) {
        that.GLOBAL.changLoading('show');
    }
    return new Promise((resolve, reject) => {
        instance.request({
            method: options.method ? options.method: 'POST',
            data: options.data && options.data.params ? options.data.params : {},
            url: options.url,
            timeout: 10000,
            headers: options.headers ? options.headers : {}
        }).then(res => {
            //关闭加载
            if (isLoading) {
                that.GLOBAL.changLoading('hide');
            }
            resolve(res.data);
        }).catch(err => {
            reject(err);
            //关闭加载
            if (isLoading) {
                that.GLOBAL.changLoading('hide');
            }
        })
    })

}
//根据mapCode获取文件
function getFile(options){
    return new Promise((resolve, reject) => {
        ajax({
            url: 'file/attach/findByMapcode/' + options.data.params.mapCode,
            method: options.method ? options.method : 'get',
        }).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        })
    })
}
export default {
    axios,
    ajax,
    baseURL,
    uploadURL,
    uploadName,
    getApartmentList,
    getPersonList,
    getLocationData,
    uploadFile,
    getMapCode,
    getFile,
};
