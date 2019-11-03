<template>
    <div>
        <component ref="comp" :is="compName" :formData="formData" :form-center-data="formCenterData"></component>
    </div>
</template>

<script>
    import Mobile from './Mobile'
    import Pc from './PC'
    let _this;
    let formCenterData;
    export default {
        name: "Index",
        components: {
            Mobile,
            Pc,
        },
        data(){
            return {
                //组件名
                compName: "",
                //表JSON
                formData: [],
                formCenterData: [],
                formModelId: "",
                formInstId: "",
                ajaxFormData: "",
                formAjaxKey: "uitest"
            }
        },
        mounted(){
            _this = this;
            //判断用户设备切换移动页面/PC页面
            if(this.GLOBAL.isPc()) {
                this.compName = 'Pc';
            } else {
                this.compName = 'Mobile';
            }
            //监听提交表单
            this.$bus.$off('submitForm');
            this.$bus.$on('submitForm', () => {
                this.submitForm();
            });
            //是否为更新
            let formInstId = this.$route.query.formInstId;
            if(this.GLOBAL.no_null(formInstId)) {
                this.formInstId = formInstId;
            }
            //获取接口的formKey
            let formAjaxKey = this.$route.query.key;
            if(formAjaxKey) {
                this.formAjaxKey = formAjaxKey;
            }
            this.getFormData();
        },
        methods: {
            getFormData(){
                // 获取JSON数据
                let formModelId = this.$route.query.formModelId;
                let formInstId = this.formInstId;
                if(formInstId){
                    this.formInstId = formInstId;
                    this.$axios.ajax({
                        url: "form/insts/flow/all-info/" + formInstId,
                        method: "get"
                    }).then(res => {
                        this.formData = res.data.modelData;
                        this.ajaxFormData = res.data.formData;
                        this.getModel(true);
                        this.$nextTick(() => {
                            this.showData();
                        })
                    })
                } else {
                    this.formModelId = formModelId;
                    this.$axios.ajax({
                        url: "form/datas/init/form-key/" + this.formAjaxKey,
                        method: "get"
                    }).then(res => {
                        this.formData = JSON.parse(this.GLOBAL.HTMLDecode(JSON.stringify(res.data)));
                        this.getModel();
                    });
                }
            },
            //将单选、复选等的n/v值 转换为value/key值
            changeDbOptions(item){
                if(item.options) {
                    if(item.options.value && item.options.value.values.length > 0) {
                        let list = item.options.value.values;
                        if(list instanceof Array) {
                            list.forEach(opt => {
                                if(this.GLOBAL.isPc()) {
                                    opt['value'] = opt.n;
                                    opt['key'] = opt.v;
                                } else {
                                    if(!opt.pid) {
                                        opt['value'] = opt.n;
                                        opt['key'] = opt.v;
                                    }
                                }
                            })
                        } else {
                            item.options.value.values = [];
                        }
                    }
                }
                return item;
            },
            //提交表单
            submitForm(){
                if(this.GLOBAL.isPc()) {
                    this.$refs['comp'].$refs['pcForm'].validate(valid => {
                        if(valid) {
                            this.mapAjaxData();
                        }
                    });
                } else {
                    this.$bus.$emit('mobileValidate');
                    // let errDom = document.querySelectorAll(".fan_errMsg");
                    // if(errDom.length > 0) {
                    //     this.GLOBAL.toastInfo(errDom[0].innerText, 'error');
                    // } else {
                    //     this.mapAjaxData();
                    // }
                }
            },
            //接口
            mapAjaxData(){
                let uploadNum = 0;
                let alreadyUploadNum = 0;
                this.mapDataCenter(res => {
                    let {type} = res.options;
                    if(type === 'file-upload') {
                        uploadNum += res.uploadList.length;
                    }
                });
                this.mapDataCenter((res) => {
                    let {type} = res.options;
                    if(type === 'file-upload') {
                        let uploadList = res.uploadList;
                        let promiseArr = [];
                        if(typeof res[res.key] === 'string') {
                            res[res.key] = res[res.key].split(",");
                        }
                        if(uploadList.length > 0) {
                            uploadList.forEach(item => {
                                promiseArr.push(new Promise((resolve, reject) => {
                                    this.$axios.uploadFile({
                                        url: this.$axios.uploadURL,
                                        data: {
                                            params: item,
                                            loading: true
                                        },
                                        headers: {
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }).then(r => {
                                        r.data.mapCode = item.get('mapCode');
                                        resolve(r);
                                    })
                                }))
                            });
                            Promise.all(promiseArr).then(result => {
                                result.forEach(item => {
                                    let mapCode = item.data.mapCode;
                                    res[res.key].push(mapCode);
                                });
                                alreadyUploadNum += result.length;
                                if(alreadyUploadNum === uploadNum) {
                                    this.submitFormAjax();
                                }
                            })
                        }
                    }
                });
                if(alreadyUploadNum === uploadNum) {
                    this.submitFormAjax();
                }
            },
            //获取formModel
            getModel(){
                let _this = this;
                //将配置递归出model，供保存、规则、监听
                function formatChild(parentItem, formCenterData, returnItem){
                    let parentOptions = parentItem.options ? parentItem.options : parentItem;
                    let list;
                    if(parentOptions.type === 'a-sub-list') {
                        list = parentOptions.extend.sublist;
                    } else {
                        if(parentOptions.hasOwnProperty('child')) {
                            list = parentOptions.child;
                        } else if(parentOptions.hasOwnProperty('list')){
                            list = parentOptions.list;
                        }
                    }
                    if(list && list.length > 0) {
                        list.forEach(item => {
                            if(item.options && item.options.key) {
                                if(returnItem) {
                                    item = _this.getFormObj(item);
                                } else {
                                    formCenterData.push(_this.getFormObj(item));
                                }
                            } else {
                                formatChild(item, formCenterData, returnItem);
                            }
                        })
                    }
                    if(returnItem) {
                        return parentItem;
                    } else {
                        return formCenterData;
                    }
                }
                let formData = this.formData;
                let formCenterData = [];
                for(let i = 0; i < formData.length; i++) {
                    let item = _this.changeDbOptions(formData[i]);
                    let itemOptions = item.options;
                    let {key, type, id} = itemOptions;
                    if(key) {
                        formCenterData.push(this.getFormObj(item));
                    } else {
                        if(type === 'a-sub-list') {
                            let subObj = {
                                id,
                                key: id,
                                data: [],
                                options: itemOptions,
                                list: []
                            };
                            let list = item.options.extend.sublist;
                            list.forEach(subItem => {
                                let {key: subKey} = subItem.options;
                                if(subKey) {
                                    subObj.data.push(this.getFormObj(subItem));
                                } else {
                                    subObj.data = formatChild(subItem, subObj.data);
                                }
                            });
                            formCenterData.push(subObj);
                        } else if(type === 'a-tab' || type === 'l-row-2' || type === 'l-row-3'){
                            formCenterData.push(formatChild(item, formCenterData, true));
                        } else if(type === 'a-interval'){
                            formCenterData.push(formatChild(item, formCenterData, true));
                        } else {
                            formatChild(item, formCenterData);
                        }
                    }
                }
                this.formCenterData = formCenterData;
            },
            //接口单组件中心数据格式
            getFormObj(item){
                let itemOptions = item.options;
                let {key, type, id} = itemOptions;
                let obj = {
                    id,
                    key,
                    options: itemOptions
                };
                if(type === 'file-upload') {
                    obj.uploadList = [];
                }
                obj[key] = this.GLOBAL.getModelDb(type).primary;
                if(itemOptions.dbInfos && itemOptions.dbInfos.length > 1) {
                    let assistFieldName = itemOptions.dbInfos[1].fieldName;
                    if(assistFieldName) {
                        obj['assistFieldName'] = assistFieldName;
                        obj[assistFieldName] = this.GLOBAL.getModelDb(type).assist;
                    }
                }
                return obj;
            },
            //格式化传参数据
            getAjaxData(){
                let formCenterData = this.formCenterData;
                let arr = [];
                function objData(item){
                    let {id, key} = item;
                    let obj = {
                        id,
                        key,
                        db: {}
                    };
                    if(item.pk) {
                        obj.pk = item.pk;
                    }
                    if(item.key) {
                        let primaryVal = item[item.key];
                        let itemType = item.options.type;
                        if(primaryVal instanceof Array) {
                            if(itemType === 'cascade' || itemType === 'choose-department' || itemType === 'choose-area') {
                                obj.db.primary = primaryVal[primaryVal.length - 1];
                            } else if(itemType === 'file-upload'){
                                obj.db.primary = primaryVal.join(",");
                            } else {
                                obj.db.primary = primaryVal.join(";");
                            }
                        } else {
                            if(itemType === 'rich-text') {
                                primaryVal = _this.GLOBAL.HtmlUtil.htmlEncodeByRegExp(primaryVal);
                            }
                            obj.db.primary = primaryVal;
                        }
                    }
                    if(item.hasOwnProperty('assistFieldName')) {
                        if(item[item.assistFieldName] instanceof Array) {
                            obj.db.assist = item[item.assistFieldName].join(";");
                        } else {
                            obj.db.assist = item[item.assistFieldName];
                        }
                    }
                    return obj;
                }
                formCenterData.forEach(item => {
                    if(item.data) {
                        let list = JSON.parse(JSON.stringify(item.list));
                        let {id} = item.options;
                        let obj = {
                            id,
                            key: id,
                            data: []
                        };
                        list.forEach((row, rowIndex) => {
                            row.forEach((col, colIndex) => {
                                if(col.pk !== 'yes') {
                                    list[rowIndex][colIndex] = objData(col);
                                }
                            })
                        });
                        obj.data = list;
                        arr.push(obj);
                    } else {
                        arr.push(objData(item));
                    }
                });
                return arr;
            },
            //回显数据
            showData(){
                //回显组件方法
                function flagFn(ajaxFormData, item){
                    //子表
                    if(item.key.indexOf('a-sub-list') > -1) {
                        let tableId = _this.getTableId(item);
                        let exampleDataList = JSON.parse(JSON.stringify(item.data));
                        ajaxFormData.forEach(ajaxItem => {
                            if(ajaxItem.tableId === tableId) {
                                item.list = _this.getSublist(ajaxItem, exampleDataList);
                            }
                        });
                    } else {
                        //普通
                        for(let i in values) {
                            if(i === item.key) {
                                item = _this.formatShowDataItem(item, values[i]);
                            }
                        }
                    }
                }
                let ajaxFormData = this.ajaxFormData;
                let formCenterData = this.formCenterData;
                let values = {};
                ajaxFormData.forEach(item => {
                    if(item.values) {
                        for(let i in item.values) {
                            values[item.entityName + '__' + i] = item.values[i];
                        }
                    }
                });
                //遍历数据中心
                this.mapDataCenter(item => {
                    flagFn(ajaxFormData, item);
                }, false);
                this.formCenterData = formCenterData;
            },
            //获取子表的表格ID
            getTableId(item){
                if(item.data.length > 0) {
                    return item.data[0].options.dbInfos[0].tableId;
                }
            },
            //获取子表的list数据
            getSublist(ajaxItem, exampleList){
                let list = [];
                let {values} = ajaxItem;
                if(values && values.length > 0) {
                    values.forEach((item, index) => {
                        let row = [];
                        exampleList.forEach((eItem, eIndex) => {
                            if(eIndex === 0) {
                                row.push({
                                    value: item.id,
                                    pk: "yes"
                                })
                            }
                            eItem = this.formatShowDataItem(JSON.parse(JSON.stringify(eItem)), values[index][eItem.key.split("__")[1]]);
                            eItem['pk'] = 'no';
                            row.push(eItem);
                        });
                        list.push(row);
                    });
                }
                return list;
            },
            //回显数据的单个组件数据格式化
            formatShowDataItem(item, values){
                //获取级联的数据
                function getCascadeVal(params){
                    let primaryVal = [], assistVal = [];
                    let result = _this.GLOBAL.familyTree(params);
                    for(let i = result.length - 1; i >= 0; i--) {
                        primaryVal.push(result[i][params.valueFieldName]);
                        assistVal.push(result[i][params.labelFieldName]);
                    }
                    return {
                        primaryVal,
                        assistVal
                    };
                }
                let itemType = item.options.type;
                let val;
                let assistVal;
                if(itemType === 'cascade') {
                    let result = getCascadeVal({
                        list: item.options.value.values,
                        childId: values,
                        fieldName: "id",
                        parentFieldName: "pid",
                        valueFieldName: "v",
                        labelFieldName: "n"
                    });
                    val = result.primaryVal;
                    assistVal = result.assistVal;
                } else if(itemType === 'choose-department') {
                    this.$axios.getApartmentList().then(res => {
                        let result = getCascadeVal({
                            list: res.data,
                            childId: values,
                            fieldName: "orgId",
                            parentFieldName: "orgPid",
                            valueFieldName: "orgId"
                        });
                        item[item.key] = result.primaryVal;
                        assistVal = result.assistVal;
                        if(assistVal) {
                            item[item.assistFieldName] = assistVal;
                        }
                    })
                } else if(itemType === 'choose-area'){
                    this.$axios.getLocationData().then(res => {
                        let result = getCascadeVal({
                            list: res.data,
                            childId: values,
                            fieldName: "locationId",
                            parentFieldName: "locationPid",
                            valueFieldName: "locationId"
                        });
                        item[item.key] = result.primaryVal;
                        assistVal = result.assistVal;
                        if(assistVal) {
                            item[item.assistFieldName] = assistVal;
                        }
                    })
                } else if(itemType === 'file-upload'){
                    let mapCodeStr = values && values.split(";").join(",");
                    if(mapCodeStr) {
                        this.$axios.getFile({
                            data: {
                                params: {
                                    mapCode: mapCodeStr
                                }
                            }
                        }).then(res => {
                            item.alreadyUploadList = res.data;
                            val = values;
                            item[item.key] = val;
                        });
                    }
                } else {
                    //primaryVal
                    if(values && values.split(";").length > 1) {
                        val = values.split(";");
                    } else {
                        val = values;
                    }
                }
                if(assistVal) {
                    item[item.assistFieldName] = assistVal;
                }
                item[item.key] = val;
                return item;
            },
            //首次提交
            firstSubmit(){
                let params = {
                    formModelId: this.formModelId,
                    businessId: "1182945651466436609",
                    fields: JSON.stringify(this.getAjaxData())
                };
                this.$axios.ajax({
                    url: "form/insts/flow",
                    data: {
                        params: params,
                        loading: true
                    }
                }).then(res => {
                    if(res.code === 0) {
                        this.GLOBAL.toastInfo('提交成功', 'success');
                        this.formInstId = res.data.formInstId;
                        this.getFormData();
                    }
                })
            },
            //再次提交接口
            update(){
                this.$axios.ajax({
                    url: "form/insts/flow/" + this.formInstId,
                    method: "put",
                    data: {
                        params: {
                            fields: JSON.stringify(this.getAjaxData(true))
                        },
                        loading: true
                    }
                }).then(res => {
                    this.GLOBAL.toastInfo('更新成功', 'success');
                    this.getFormData();
                })
            },
            //提交表单
            submitFormAjax(){
                //二次提交
                if(this.formInstId) {
                    this.update();
                } else {
                    this.firstSubmit();
                }
            },
            //遍历数据中心
            mapDataCenter(callback, mapSubList = true){
                let formCenterData = this.formCenterData;
                let fn = (formCenterData, callback) => {
                    formCenterData.forEach((item) => {
                        if(item instanceof Array) {
                            fn(item, callback);
                        } else {
                            if(item.key) {
                                if(mapSubList && item.list) {
                                    fn(item.list, callback);
                                } else {
                                    if(callback) {
                                        callback(item);
                                    }
                                }
                            }
                        }
                    })
                };
                fn(formCenterData, callback);
            }
        }
    }
</script>

<style scoped>

</style>
<!--
formModel, ajaxData, formRules
    提交表单配置->根据是否第一次提交（有formModelId）->保存后，将formInstId作为参数放在URL上访问回显数据->将formInstId作为第二次提交的参数（提交时，子表的每一行都需要携带行ID）
    细节：1、文件上传需等待点提交再上传，并传mapCode，回显时根据mapCode访问接口拿到列表
          2、级联数据保存最后一个Id,回显时根据Id反递归找到父级Id
          3、表单验证规则：
          4、表单监听
    普通+子表
    {
        id: "",
        key: "",
        db: {
            primary: "",
            assist: ""
        }
    },
    {
        id: "",
        key: "",
        data: [
            [
                {
                    id: "",
                    key: "",
                    db: {
                        primary: "",
                        assist: ""
                    }
                }
            ]
        ]
    }

-->
