<template>
    <div>
        <component ref="comp" :is="compName" :formData="formData" :formModel="formModel" :formValue="formValue"></component>
    </div>
</template>

<script>
    import Mobile from './Mobile'
    import Pc from './PC'
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
                //表单model
                formModel: {},
                //表单辅助字段
                formValue: {},
                formKey: {

                },
                formModelId: "",
                formInstId: ""
            }
        },
        watch: {
        },
        mounted(){
            //判断用户设备切换移动页面/PC页面
            if(this.GLOBAL.isPc()) {
                this.compName = 'Pc';
            } else {
                this.compName = 'Mobile';
            }
            this.$bus.$off('submitForm');
            this.$bus.$on('submitForm', () => {
                this.submitForm();
            });
            this.getFormData();
        },
        methods: {
            getFormData(){
                // 获取JSON数据
                let formModelId = this.$route.query.formModelId;
                let formInstId = this.$route.query.formInstId;
                if(formModelId) {
                    this.formModelId = formModelId;
                    this.$axios.ajax({
                        url: "form/datas/init/form-key/uitest",
                        method: "get"
                    }).then(res => {
                        this.formData = JSON.parse(this.GLOBAL.HTMLDecode(JSON.stringify(res.data)));
                        this.getModel();
                    });
                }
                if(formInstId){
                    this.formInstId = formInstId;
                    this.$axios.ajax({
                        url: "form/insts/flow/all-info/" + formInstId,
                        method: "get"
                    }).then(res => {
                        this.formData = JSON.parse(this.GLOBAL.HTMLDecode(JSON.stringify(res.data)));
                        this.getDataModel();
                    })
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
                            this.submitFormAjax();
                        }
                    });
                } else {
                    this.submitFormAjax();
                }
            },
            //接口
            submitFormAjax(){
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
                    },
                    headers: {
                        'Content-Type': 'application/json;charse=UTF-8'
                    },
                    noStringifyData: true
                }).then(res => {
                    if(res.code === 0) {
                        this.GLOBAL.toastInfo('提交成功', 'success');
                    }
                })
            },
            //获取formModel
            getModel(){
                let _this = this;
                //将配置递归出model，供保存、规则、监听
                function formatChild(parentItem, formModel){
                    let formKey = this.formKey;
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
                                let {key, type} = item.options;
                                formModel[key] = _this.GLOBAL.getModelDb(type).primary;
                                formKey[id] = key;
                                item = _this.changeDbOptions(item);
                            } else {
                                formatChild(item, formModel);
                            }
                        })
                    }
                    return formModel;
                }
                let formData = this.formData;
                let formModel = {};
                let formKey = this.formKey;
                for(let i = 0; i < formData.length; i++) {
                    let item = formData[i];
                    let {key, type, id} = item.options;
                    if(key) {
                        formModel[key] = this.GLOBAL.getModelDb(type).primary;
                        formKey[id] = key;
                    } else {
                        if(type === 'a-sub-list') {
                            let obj = {};
                            let list = item.options.extend.sublist;
                            let arr = [];
                            list.forEach(subItem => {
                                let {key, type} = subItem.options;
                                if(key) {
                                    obj[key] = this.GLOBAL.getModelDb(type).primary;
                                    formKey[id] = key;
                                } else {
                                    obj = formatChild(item, obj);
                                }
                                arr.push(obj);
                            });
                            formModel[id] = arr;
                        } else {
                            formModel = formatChild(item, formModel);
                        }
                    }
                }
                this.formModel = JSON.parse(JSON.stringify(formModel));
                this.formValue = JSON.parse(JSON.stringify(formModel));
            },
            //生成回显数据的model
            getDataModel(){

            },
            //生成传参的数据
            getAjaxData(){
                let {formValue, formModel} = this;
                let arr = [];
                for(let i in formModel) {
                    //子表
                    if(i.indexOf('a-sub-list') > -1 || i.indexOf('one_to_many') > -1) {
                        let list = formModel[i];
                    } else {
                        this.setAjaxData(formModel[i], i);
                    }
                }
                return arr;
            },
            //将id与key相互转换
            changeKeyOrId(val, type) {
                let formKey = this.formKey;
                if(type === 'key') {
                    for(let i in formKey) {
                        if(formKey[i] === val) {
                            return i;
                        }
                    }
                } else {
                    return formKey[val];
                }
            },
            //设置传参格式
            setAjaxData(item, i){
                let obj = {};
                obj['id'] = this.changeKeyOrId(i, 'key');
                obj['key'] = i;
                obj['db'] = {
                    primary: item,
                    assist: item
                };
                return obj;
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
