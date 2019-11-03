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

function familyTree(params) {
    let {list: arr1,childId,fieldName,parentFieldName} = params;
    var temp = [];
    var forFn = function (arr, id) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item[fieldName] === id) {
                temp.push(item);
                forFn(arr1, item[parentFieldName]);
                break;
            } else {
                if (item.children) {
                    forFn(item.children, id)
                }
            }
        }
    };
    forFn(arr1, childId);
    return temp
}
//富文本内容转义传接口
var HtmlUtil = {
    /*1.用浏览器内部转换器实现html编码（转义）*/
    htmlEncode:function (html){
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement ("div");
        //2.然后将要转换的字符串设置为这个元素的innerText或者textContent
        (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    },
    /*2.用浏览器内部转换器实现html解码（反转义）*/
    htmlDecode:function (text){
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText或者textContent，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    },
    /*3.用正则表达式实现html编码（转义）*/
    htmlEncodeByRegExp:function (str){
        var temp = "";
        if(str.length == 0) return "";
        temp = str.replace(/&/g,"&amp;");
        temp = temp.replace(/</g,"&lt;");
        temp = temp.replace(/>/g,"&gt;");
        temp = temp.replace(/\s/g,"&nbsp;");
        temp = temp.replace(/\'/g,"&#39;");
        temp = temp.replace(/\"/g,"&quot;");
        return temp;
    },
    /*4.用正则表达式实现html解码（反转义）*/
    htmlDecodeByRegExp:function (str){
        var temp = "";
        if(str.length == 0) return "";
        temp = str.replace(/&amp;/g,"&");
        temp = temp.replace(/&lt;/g,"<");
        temp = temp.replace(/&gt;/g,">");
        temp = temp.replace(/&nbsp;/g," ");
        temp = temp.replace(/&#39;/g,"\'");
        temp = temp.replace(/&quot;/g,"\"");
        return temp;
    },
    /*5.用正则表达式实现html编码（转义）（另一种写法）*/
    html2Escape:function(sHtml) {
        return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
    },
    /*6.用正则表达式实现html解码（反转义）（另一种写法）*/
    escape2Html:function (str) {
        var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
    }
};
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
    changLoading,
    familyTree,
    HtmlUtil,
}
