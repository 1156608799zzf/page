<template>
    <div class="mobileItem" v-show="!hide">
        <!--栅格布局-->
        <template v-if="itemType === 'l-row-2' || itemType === 'l-row-3'">
            <flexbox v-for="(colItem, colIndex) in itemOptions.child" :key="colIndex">
                <flexbox-item>
                    <MobileItem v-for="(vItem, vIndex) in colItem.list" :key="vIndex" :item="vItem" :form-model="formModel"></MobileItem>
                </flexbox-item>
            </flexbox>
        </template>
        <!--标签页-->
        <template v-if="itemType === 'a-tab'">
            <tab v-model="item.tabValue">
                <tab-item v-for="(tab, tabIndex) in itemOptions.child" :key="tabIndex">{{ tab.n }}</tab-item>
            </tab>
            <swiper v-model="item.tabValue" :show-dots="false">
                <swiper-item v-for="(tab, tabIndex) in itemOptions.child" :key="tabIndex">
                    <MobileItem v-for="(vItem, vIndex) in tab.list" :key="vIndex" :item="vItem" :form-model="formModel"></MobileItem>
                </swiper-item>
            </swiper>
        </template>
        <!--分割线-->
        <template v-if="itemType === 'a-interval'">
            <divider>{{ itemOptions.label }}</divider>
        </template>
        <!--子表控件-->
        <template v-if="itemType === 'a-sub-list'">
            <div class="subList">
                <swipeout>
                    <swipeout-item v-for="(subObj, subIndex) in formModel[itemOptions.id]" :key="subIndex">
                        <div slot="right-menu">
                            <swipeout-button background-color="#D23934" @click.native="delSubRow(subIndex)">删除</swipeout-button>
                        </div>
                        <div slot="content">
                            <group>
                                <MobileItem
                                    v-for="(vItem, vIndex) in itemOptions.extend.sublist"
                                    :key="vIndex"
                                    :item="vItem"
                                    :form-model="formModel"
                                    :item-model="{pid: itemOptions.id, index: subIndex}"
                                ></MobileItem>
                            </group>
                        </div>
                    </swipeout-item>
                </swipeout>
                <div style="text-align: right;padding-right: 30px;margin-top: 10px;">
                    <x-button mini @click.native="addSubRow">添加</x-button>
                </div>
            </div>
        </template>
        <!--隐藏字段-->
        <template v-else-if="itemType === 'hide-field'">
        </template>
        <template v-else>
            <group class="group">
                <!--文本输入框-->
                <template v-if="itemType === 'text'">
                    <x-input
                        :ref="itemOptions.key"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></x-input>
                </template>
                <!--多行文本-->
                <template v-if="itemType === 'textarea'">
                    <x-textarea
                        :ref="itemOptions.key"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></x-textarea>
                </template>
                <!--单选框-->
                <template v-if="itemType === 'radio'">
                    <group :title="itemOptions.label">
                        <radio
                            :ref="itemOptions.key"
                            :options="itemOptions.value.values"
                            :value="itemValue"
                            :title="itemOptions.label"
                            :placeholder="itemOptions.tips"
                            :max="itemOptions.maxLength"
                            :disabled="readonly"
                            @on-change="changeCompValue"
                        ></radio>
                    </group>
                </template>
                <!--复选框-->
                <template v-if="itemType === 'checkbox'">
                    <checklist
                        :ref="itemOptions.key"
                        :options="itemOptions.value.values"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></checklist>
                </template>
                <!--单选下拉框-->
                <template v-if="itemType === 'radio-dropdown'">
                    <popup-radio
                        :ref="itemOptions.key"
                        :options="itemOptions.value.values"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></popup-radio>
                </template>
                <!--多选下拉框-->
                <template v-if="itemType === 'checkbox-dropdown'">
                    <div>
                        <x-switch v-model="item.showPopup" :title="itemOptions.label"></x-switch>
                        <div v-transfer-dom>
                            <popup v-model="item.showPopup">
                                <group gutter="0">
                                    <checklist
                                        :ref="itemOptions.key"
                                        :options="itemOptions.value.values"
                                        :value="itemValue"
                                        :title="itemOptions.label"
                                        :placeholder="itemOptions.tips"
                                        :max="itemOptions.maxLength"
                                        :disabled="readonly"
                                        @on-change="changeCompValue"
                                    ></checklist>
                                </group>
                            </popup>
                        </div>
                    </div>
                </template>
                <!--级联下拉框-->
                <template v-if="itemType === 'cascade'">
                    <popup-picker
                        :data="itemOptions.value.values"
                        :columns="2"
                        :show-name="true"
                        :ref="itemOptions.key"
                        :options="itemOptions.value.values"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></popup-picker>
                </template>
                <!--日期-->
                <template v-if="itemType === 'date'">
                    <datetime
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :format="itemOptions.extend.date.format ? itemOptions.extend.date.format : null"
                        @on-change="changeCompValue"
                    ></datetime>
                </template>
                <!--富文本编辑器-->
                <template v-if="itemType === 'rich-text'">
                    <quill-editor
                        :value="itemValue"
                        @change="changeCompValue"
                    ></quill-editor>
                </template>
                <!--文件上传-->
                <template v-if="itemType === 'file-upload'">
                    <cell :title="itemOptions.label" label-width="5em" class="fileCell">
                        <div>
                            <input style="opacity: 0;" type="file" :placeholder="itemOptions.tips" :value="itemValue" @change="changeCompValue">
                        </div>
                    </cell>
                </template>
                <!--人员控件-->
                <template v-if="itemType === 'choose-user'">
                    <cell :title="itemOptions.label" :value="userList" link="/mobile/chooseUser"></cell>
                </template>
                <!--部门控件-->
                <template v-if="itemType === 'choose-department'">
                    <popup-picker
                        :data="itemOptions.value.values"
                        :columns="3"
                        :show-name="true"
                        :ref="itemOptions.key"
                        :options="itemOptions.value.values"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></popup-picker>
                </template>
                <!--位置-->
                <template v-if="itemType === 'choose-area'">
                    <popup-picker
                        :data="itemOptions.value.values"
                        :columns=5
                        :show-name="true"
                        :ref="itemOptions.key"
                        :options="itemOptions.value.values"
                        :value="itemValue"
                        :title="itemOptions.label"
                        :placeholder="itemOptions.tips"
                        :max="itemOptions.maxLength"
                        :disabled="readonly"
                        @on-change="changeCompValue"
                    ></popup-picker>
                </template>
                <!--文本面板-->
                <template v-if="itemType === 'a-text-panel'">
                    <cell :title="itemOptions.label">
                        <div v-html="item.value"></div>
                    </cell>
                </template>
            </group>
            <div class="fan_errMsg" v-if="errObj.errMsg">
                {{ errObj.errMsg }}
            </div>
        </template>
    </div>
</template>

<script>
    import {XButton, Divider, XInput, XTextarea,XSwitch, Group, Radio, Checklist,PopupRadio, PopupPicker, Datetime,Cell,Tab, TabItem,Swiper, SwiperItem,Flexbox, FlexboxItem,PopupHeader, Popup, TransferDom,Swipeout, SwipeoutItem, SwipeoutButton } from 'vux'
    import MobileItem from './MobileItem'
    import '../../assets/js/form'
    import 'quill/dist/quill.core.css'
    import 'quill/dist/quill.snow.css'
    import 'quill/dist/quill.bubble.css'
    import { quillEditor } from 'vue-quill-editor'
    export default {
        name: "MobileItem",
        props: {
            item: {
                type: [Object]
            },
            formModel: {
                type: [Object]
            },
            showLabel: {
                type: [Boolean, String],
                default(){
                    return true;
                }
            },
            itemProps: {
                type: [String],
                default(){
                    return '';
                }
            },
            subListModel: {
                type: [Object],
                default(){
                    return {}
                }
            }
        },
        directives: {
            TransferDom
        },
        components: {
            MobileItem,quillEditor,
            XButton, Divider,XInput,XTextarea,Group,Radio,Checklist,PopupRadio,PopupPicker,Datetime,Cell,Tab, TabItem,Swiper,SwiperItem,Flexbox, FlexboxItem,PopupHeader,Popup,XSwitch,Swipeout, SwipeoutItem, SwipeoutButton
        },
        data(){
            return {
                //运行表达式的方法变量
                parser: "",
                //编辑器
                editor: "",
                //只读
                readonly: "",
                //隐藏
                hide: "",
                //规则
                rules: [],
                errObj: {}
            }
        },
        computed: {
            //返回子项的配置
            itemOptions(){
                return this.item.options;
            },
            //返回子项的组件类型
            itemType(){
                return this.item.options.type;
            },
            //返回组件的绑定值
            itemValue(){
                let {formModel, itemOptions} = this;
                return formModel[itemOptions.key]
            },
            //表单验证
            validateComp(){
                let rules = this.rules;
                return function(val){
                    let returnObj = {
                        valid: true
                    };
                    for(let i = 0; i < rules.length; i++) {
                        let rule = rules[i];
                        if(rule.validateFn(val)) {
                            continue;
                        } else {
                            returnObj.valid = false;
                            returnObj.msg = rule.errMsg;
                        }
                        break;
                    }
                    return returnObj;
                }
            },
            //人员列表
            userList(){
                let itemValue = this.itemValue;
                let userList = [];
                itemValue.forEach(item => {
                    userList.push(item.fullName);
                });
                return userList.join(",");
            }
        },
        watch: {
            //监听组件属性变化
            'formModel': {
                deep: true,
                immediate: true,
                handler: function(){
                    let {readonly, hide, required} = this.itemOptions;
                    //更新只读
                    if(readonly) {
                        this.formatReadonly();
                    }
                    //更新隐藏
                    if(hide) {
                        this.formatHide();
                    }
                }
            },
        },
        mounted(){
            //渲染初始化值
            this.initCompValue();
            //初始化表单对象（运算表达式）
            this.parser = form.parser();
            //更新规则
            this.formatRules();
            //渲染富文本编辑器及初始化级联数据
            this.$watch('item', {
                immediate: true,
                handler: item => {
                    let type = item.options.type;
                    if(type === 'rich-text') {

                    } else if(type === 'checkbox-dropdown' || type === 'checkbox'){
                        let values = JSON.parse(JSON.stringify(this.itemOptions.value.values));
                        values.forEach(opt => {
                            opt['key'] = opt.v;
                            opt['value'] = opt.n;
                        });
                        this.itemOptions.value.values = values;
                    } else if(type === 'cascade'){
                        let values = this.itemOptions.value.values;
                        values.forEach(opt => {
                            opt['value'] = opt.v;
                            opt['name'] = opt.n;
                            opt['parent'] = opt.pid;
                        });
                    }else if(type === 'choose-department'){
                        let values = [];
                        this.$axios.getApartmentList().then(res => {
                            this.GLOBAL.mapTree({
                                data: res.data,
                                callback: (res) => {
                                    res['value'] = res.orgId;
                                    res['name'] = res.orgName;
                                    res['parent'] = res.orgPid;
                                    values.push(res);
                                },
                                finishCallback: () => {
                                    this.itemOptions.value.values = values;
                                }
                            });
                        });
                    } else if(type === 'choose-area') {
                        this.$axios.getLocationData().then(res => {
                            let list = res.data;
                            list.forEach(opt => {
                                opt['value'] = opt.locationId;
                                opt['name'] = opt.locationName;
                                opt['parent'] = opt.locationPid;
                            });
                            this.itemOptions.value.values = list;
                            console.warn(JSON.stringify(list))
                        });
                    }
                }
            });
            //监听选择的人员
            this.$bus.$off('choosePerson');
            this.$bus.$on('choosePerson', res => {
                this.changeCompValue(res);
            });
            //订阅验证表单
            this.$bus.$off('mobileValidate');
            this.$bus.$on('mobileValidate', () => {
                this.validateForm(this.itemValue);
            })
        },
        methods: {
            //验证表单
            validateForm(val){
                let flag = true;
                let rules = this.rules;
                if(rules.length > 0) {
                    let errObj = {};
                    for(let i = 0; i < rules.length; i++) {
                        let rule = rules[i];
                        if(!rule.validateFn(val)) {
                            errObj.errMsg = rule.errMsg;
                            flag = false;
                            break;
                        }
                    }
                    this.errObj = errObj;
                }
                return flag;
            },
            //改变组件值
            changeCompValue(val){
                let item = this.item;
                if(!this.validateForm(val)) {
                    return;
                }
                this.changeFlagFn(val);
                if(item.hasOwnProperty('assistFieldName')) {
                    this.relationField(val);
                }
            },
            //关联字段
            relationField(val, list){
                let values = list && list instanceof Array ? list : this.itemOptions.value.values;
                let label;
                if(values && values.length > 0) {
                    if(this.$refs[this.itemOptions.key] && this.$refs[this.itemOptions.key].displayRender) {
                        label = this.$refs[this.itemOptions.key].displayRender.split(' / ');
                    } else {
                        if(val instanceof Array) {
                            label = [];
                            for(let n = 0; n < val.length; n++) {
                                for(let i = 0; i < values.length; i++) {
                                    if(val[n] === values[i].v) {
                                        label.push(values[i].n);
                                        break;
                                    }
                                }
                            }
                        } else {
                            values.forEach(item => {
                                if(item.v === val) {
                                    label = item.n;
                                }
                            })
                        }
                    }
                }
                this.item[this.item.assistFieldName] = label;
            },
            changeFlagFn(val){
                let {itemOptions} = this;
                let formModel = this.formModel;
                formModel[itemOptions.key] = val;
                this.formModel = formModel;
                //改变数据中心的数据
                this.item[this.item.key] = val;
            },
            //初始化值
            initCompValue(){
                let {initValue, type} = this.itemOptions;
                if(initValue && initValue.type !== '') {
                    let valueType = this.GLOBAL.getModelDb(type).primary;
                    let {values, type: initValueType, refValues: expression} = initValue;
                    let result;
                    if(initValueType === 'expression') {
                        let parser = form.parser();
                        result = form.utils.runExpression(expression, {
                            $form: this.formModel
                        }, parser);
                    } else {
                        if(values.length > 0) {
                            if(valueType instanceof Array) {
                                result = [];
                                values.forEach(item => {
                                    result.push(item.v);
                                })
                            } else {
                                if(type === 'radio' || type === 'radio-dropdown') {
                                    result = values[0].v;
                                } else {
                                    result = values[0].n;
                                }
                            }
                        }
                    }
                    //富文本赋初始化值
                    if(this.itemType === 'rich-text') {
                        this.editor.txt.html(result)
                    }
                    if(result) {
                        this.changeCompValue(result);
                    }
                }
            },
            //只读
            formatReadonly() {
                let item = this.item;
                let {type, expression} = item.options.readonly;
                let readonly = false;
                if (type !== 'off') {
                    if (type === 'on') {
                        readonly = true;
                    } else {
                        let parser = form.parser();
                        if (form.utils.runExpression(this.GLOBAL.HTMLDecode(expression), {
                            $form: this.formModel
                        }, parser)) {
                            readonly = true;
                        }
                    }
                }
                this.readonly = readonly;
            },
            //隐藏
            formatHide() {
                let item = this.item;
                let {type, expression} = item.options.hide;
                let hide = false;
                if (type !== 'off') {
                    if (type === 'on') {
                        hide = true;
                    } else {
                        let parser = form.parser();
                        if (form.utils.runExpression(this.GLOBAL.HTMLDecode(expression), {
                            $form: this.formModel
                        }, parser)) {
                            hide = true;
                        }
                    }
                }
                this.hide = hide;
            },
            //规则
            formatRules(){
                let rules = [];
                let {itemOptions, parser} = this;
                let {required, inputRules} = itemOptions;
                //必填
                if(required) {
                    let {type, expression} = required;
                    if(type !== 'off') {
                        if(type === 'on') {
                            rules.push({
                                errMsg: "此项为必填项",
                                validateFn: val => {
                                    return this.GLOBAL.no_null(val);
                                }
                            })
                        } else {
                            rules.push({
                                errMsg: "此项为必填项",
                                validateFn: val => {
                                    return form.utils.runExpression(expression, {
                                        $form: this.formModel
                                    }, parser);
                                }
                            })
                        }
                    }
                }
                //验证规则
                if(inputRules && inputRules.length > 0) {
                    inputRules.forEach(item => {
                        let {message, validateType,regularOrExpression: expression } = item;
                        switch(validateType){
                            case 'local':
                                if(eval(expression) instanceof RegExp) {
                                    rules.push({
                                        validateFn: val => {
                                            return eval(expression).test(val);
                                        },
                                        errMsg: message
                                    })
                                }
                                break;
                            case 'expression':
                                rules.push({
                                    validateFn: val => {
                                        return form.utils.runExpression(expression, {
                                            $form: this.formModel
                                        }, parser)
                                    },
                                    errMsg: message
                                });
                                break;
                            case 'remote':
                                rules.push({
                                    validateFn: val => {
                                        this.$axios.ajax({
                                            url: expression,
                                            data: {
                                                params: {
                                                    v: value
                                                }
                                            }
                                        }).then(res => {
                                            let flag = false;
                                            if(res.data) {
                                                flag = true;
                                            }
                                            return flag;
                                        })
                                    },
                                    errMsg: message
                                });
                                break;
                        }
                    })
                }
                this.rules = rules;
            },
            //添加子行
            addSubRow(){
                let {itemOptions, formModel} = this;
                let id = itemOptions.id;
                let formModelList = formModel[id];
                if(formModelList.length > 0) {
                    let obj = this.clearVal(JSON.parse(JSON.stringify(formModel[id][0])));
                    formModel[id].push(obj);
                    this.formModel = formModel;
                }
            },
            //删除子行
            delSubRow(index){
                let {item, formModel} = this;
                let id = item.options.id;
                let formModelList = formModel[id];
                if(formModelList.length > 1) {
                    formModel[id].splice(index, 1);
                    this.formModel = formModel;
                }
            },
            //清空值
            clearVal(obj){
                for(let i in obj) {
                    if(obj[i] instanceof Array) {
                        obj[i] = [];
                    } else {
                        obj[i] = "";
                    }
                }
                return obj;
            },
        }
    }
</script>

<style lang="scss" scoped>
    .group {
        margin-top: -20px;
        & >>> .vux-swiper {
            min-height: 180px;
            height: auto !important;
        }
    }
    .weui-cell {
        display: flex;
        & >>> .weui-cell__ft {
            flex: 1;
        }
    }
    .fileCell {
        & >>> .vux-cell-bd {
            flex: 0 0 auto;
            width: 5em;
        }
    }
    .fan_errMsg {
        padding-left: 15px;
        color: red;
    }
</style>
