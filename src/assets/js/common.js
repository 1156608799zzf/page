import that from './../../main'

//判断用户打开页面的设备（PC或移动）
function isPc(){
    let flag = true;
    if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
        flag = false;
    }
    return flag;
}
//提醒框
function toastInfo(text, type){
    if(isPc()) {
        that.$Message[type](text);
    } else {
        that.$vux.toast.show({
            text,
            type
        })
    }
}
//判断对象有无某个属性
function checkObjHasAttr(obj, attrName){
    let flag = false;
    if(obj.hasOwnProperty(attrName)) {
        flag = true;
    }
    return flag;
}
function HTMLDecode(text) {
    let temp = document.createElement("div");
    temp.innerHTML = text;
    let output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}

//树排序
function sortFileData(params) {
    let convertData = [];
    let ids = [];
    let {data, parentId, pidField, idField, callback, any} = params;
    data.forEach(item => {
        if(item[pidField] == parentId) {
            callback(item);
            convertData.push(item);
            ids.push(item.id);
            convertChild({
                arr: data,
                parentItem: item,
                pidField,
                idField,
                callback,
                ids
            })
        }
    });
    if(any) {
        const idSet = ids.reduce((acc, v) => {
            acc[v] = true;
            return acc;
        }, {});
        let list = data.filter(v => {
            callback(v);
            return !idSet[v.id];
        });
        convertData = convertData.concat(list);
        console.warn(convertData)
    }
    return convertData;
}
function convertChild(params) {
    let {arr,parentItem,pidField,idField,callback,ids} = params;
    parentItem.children = parentItem.children ? parentItem.children : [];
    arr.forEach(item => {
        if(item[pidField] === parentItem[idField]) {
            callback(item);
            ids.push(item.id);
            parentItem.expand = true;
            parentItem.children.push(item);
            convertChild({
                arr: arr,
                parentItem: item,
                pidField,
                idField,
                callback,
                ids
            })
        }
    });
    return parentItem.children;
}
//去除标签
function delHtmlTag(str){
    return str.replace(/<\/?.+?>/g, "")
}

//树遍历赋值
function mapTree(params){
    function mapChildren(params){
        let {data, callback, finishCallback} = params;
        data.forEach((item, index) => {
            callback(item);
            if(item.children && item.children.length > 0) {
                mapChildren({
                    callback: callback,
                    data: item.children
                });
            }
            if(index === data.length - 1) {
                if(finishCallback) {
                    finishCallback();
                }

            }
        })
    }
    mapChildren(params);
    return params.data;
}

function isJSON_test(str) {
    if (typeof str == 'string') {
        try {
            let obj = JSON.parse(str);
            return true;
        } catch(e) {
            return false;
        }
    }
}
//获取组件的默认值类型
function getModelDb(type){
    let db = {};
    if(type === 'checkbox' || type === 'checkbox-dropdown' || type === 'cascade' || type === 'file-upload' || type === 'choose-area' || type === 'icon-input' || type === 'choose-department' || type === 'choose-user') {
        db.primary = [];
        db.assist = [];
    } else {
        db.primary = "";
        db.assist = "";
    }
    return db;
}
function no_null(value) {
    if (((value != null) && (value !== '') && value && (value !== undefined) && (value !== "undefined")) || value === '0') {
        return true;
    } else {
        return false
    }
}

function is_null(value) {
    if ((value == null) || (value === '') || (value === undefined) || (value === "undefined")) {
        return true;
    } else {
        return false;
    }
}

function changLoading(type){
    if(that.GLOBAL.isPc()) {
        if(type === 'show') {
            that.$Spin.show();
        } else {
            that.$Spin.hide();
        }
    } else {
        if(type === 'show') {
            that.$vux.loading.isVisible();
        } else {
            that.$vux.loading.hide()
        }
    }
}
export default {
    toastInfo,
    isPc,
    checkObjHasAttr,
    HTMLDecode,
    sortFileData,
    delHtmlTag,
    mapTree,
    isJSON_test,
    getModelDb,
    no_null,
    is_null,
    changLoading
}
