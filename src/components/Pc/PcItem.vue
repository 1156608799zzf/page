<template>
    <div class="pcItem" :class="{contentWrap: itemValue instanceof Array && itemOptions.tips}" v-show="!hide">
        <!--标签页-->
        <template v-if="itemType === 'a-tab'">
            <Tabs :value="item.tabValue" class="tabComponent">
                <TabPane v-for="(tab, tabIndex) in itemOptions.child" :key="tabIndex" :label="tab.n" :name="tab.v">
                    <PcItem
                        v-for="(vItem, vIndex) in tab.list"
                        :key="vIndex"
                        :item="vItem"
                        :formModel="formModel"></PcItem>
                </TabPane>
            </Tabs>
        </template>
        <!--栅格布局递归组件-->
        <template v-else-if="itemType === 'l-row-2' || itemType === 'l-row-3'">
            <Row>
                <Col v-for="(colItem, colIndex) in item.options.child" :key="colIndex" :span="colItem.col">
                    <PcItem
                        v-for="(vItem, vIndex) in colItem.list"
                        :key="vIndex"
                        :item="vItem"
                        :formModel="formModel"></PcItem>
                </Col>
            </Row>
        </template>
        <!--隐藏字段-->
        <template v-else-if="itemType === 'hide-field'">
        </template>
        <!--分割线-->
        <template v-else-if="itemType === 'a-interval'">
            <div class="dividerTitle">{{ itemOptions.label }}</div>
            <Divider />
        </template>
        <template v-else>
            <FormItem :label="showLabel ? itemOptions.label : null" :prop="itemProps ? itemProps : itemOptions.key">
                <!--子表-->
                <template v-if="itemType === 'a-sub-list'">
                    <Table :columns="sublistColumns" :data="sublistData" class="subList">
                        <template slot-scope="{ row, index }" slot="action">
                            <Button type="error" size="small" @click="delSubRow(index)">删除</Button>
                        </template>
                    </Table>
                    <Button type="primary" style="margin-top: 10px;" @click="addSubRow()">添加</Button>
                </template>
                <!--单行输入框-->
                <template v-if="itemType === 'text'">
                    <Input
                        :value="itemValue"
                        @input="changeCompValue"
                        :placeholder="item.options.tips"
                        :maxlength="item.options.maxLength"
                        :disabled="readonly"
                    />
                </template>
                <!--多行文本-->
                <template v-if="itemType === 'textarea'">
                    <Input
                        :value="itemValue"
                        @input="changeCompValue"
                        type="textarea"
                        :placeholder="item.options.tips"
                        :maxlength="item.options.maxLength"
                        :disabled="readonly"
                    />
                </template>
                <!--单选按钮-->
                <template v-if="itemType === 'radio'">
                    <RadioGroup :value="itemValue" @on-change="changeCompValue" :ref="itemOptions.key">
                        <Radio
                            v-for="(opt, optIndex) in itemOptions.value.values"
                            :key="optIndex"
                            :label="opt.v"
                            :disabled="readonly"
                        >{{ opt.n }}</Radio>
                    </RadioGroup>
                </template>
                <!--复选框-->
                <template v-if="itemType === 'checkbox'">
                    <CheckboxGroup :value="itemValue" :ref="itemOptions.key" @on-change="changeCompValue">
                        <Checkbox
                            v-for="(opt, optIndex) in itemOptions.value.values"
                            :key="optIndex"
                            :label="opt.v"
                            :disabled="readonly || selectMaxLength(opt)"
                        >{{ opt.n }}</Checkbox>
                    </CheckboxGroup>
                </template>
                <!--单选下拉框-->
                <template v-if="itemType === 'radio-dropdown'">
                    <Select :value="itemValue" @on-change="changeCompValue" :ref="itemOptions.key">
                        <Option
                            v-for="(opt, optIndex) in itemOptions.value.values"
                            :key="optIndex"
                            :value="opt.v"
                            :disabled="readonly"
                        >{{ opt.n }}</Option>
                    </Select>
                </template>
                <!--多选下拉框-->
                <template v-if="itemType === 'checkbox-dropdown'">
                    <Select multiple :value="itemValue" @on-change="changeCompValue" :ref="itemOptions.key">
                        <Option
                            v-for="(opt, optIndex) in itemOptions.value.values"
                            :key="optIndex"
                            :value="opt.v"
                            :disabled="readonly || selectMaxLength(opt)"
                        >{{ opt.n }}</Option>
                    </Select>
                </template>
                <!--级联下拉框-->
                <template v-if="itemType === 'cascade'">
                    <Cascader :ref="itemOptions.key" :data="itemOptions.value.values" :value="itemValue" @on-change="changeCompValue"></Cascader>
                </template>
                <!--日期-->
                <template v-if="itemType === 'date'">
                    <DatePicker
                        :type="item.compType"
                        :placeholder="itemOptions.tips"
                        :format="itemOptions.extend.date.format ? itemOptions.extend.date.format : null"
                    ></DatePicker>
                </template>
                <!--富文本编辑器-->
                <template v-if="itemType === 'rich-text'">
                    <div :class="itemOptions.id"></div>
                </template>
                <!--文件上传-->
                <template v-if="itemType === 'file-upload'">
                    <Upload
                        :ref="itemOptions.key"
                        :action="$axios.baseURL + $axios.uploadURL"
                        :name="$axios.uploadName"
                        :auto-upload="false"
                        :data="upload.params"
                        :before-upload="handlerBeforeUpload"
                    >
                        <Button icon="ios-cloud-upload-outline">上传</Button>
                    </Upload>
                    <template v-if="item.uploadList && item.uploadList.length > 0">
                        <div>待上传列表</div>
                        <div v-for="(fileItem, index) in item.uploadList" :key="index">
                            {{ fileItem.get('file').name }}<Button type="text" @click="removeFile(index)" >删除</Button>
                        </div>
                    </template>
                    <template v-if="item.alreadyUploadList && item.alreadyUploadList.length > 0">
                        <div>已上传列表</div>
                        <div v-for="(fileItem, index) in item.alreadyUploadList" :key="index">
                            {{ fileItem.attachName }}<Button type="text" @click="removeFile(index, true)" >删除</Button>
                        </div>
                    </template>
                </template>
                <!--人员控件-->
                <template v-if="itemType === 'choose-user'">
                    <Button type="primary" @click="choosePerson">选择人员</Button>
                    <Input v-model="person.personNameStr" :readonly="true" />
                </template>
                <!--部门控件-->
                <template v-if="itemType === 'choose-department'">
                    <Cascader
                        :ref="itemOptions.key"
                        filterable
                        :data="itemOptions.value.values"
                        :disabled="readonly"
                        :value="itemValue"
                        @on-change="changeCompValue"></Cascader>
                </template>
                <!--位置控件-->
                <template v-if="itemType === 'choose-area'">
                    <Cascader
                        :ref="itemOptions.key"
                        filterable
                        :data="itemOptions.value.values"
                        :disabled="readonly"
                        :value="itemValue"
                        @on-change="changeCompValue"></Cascader>
                </template>
                <!--文本面板-->
                <template v-else-if="itemType === 'a-text-panel'">
                    <div v-html="item.value"></div>
                </template>
                <!--文字提示语-->
                <template v-if="itemValue instanceof Array && itemOptions.tips">
                    <Tooltip :content="itemOptions.tips" placement="top-start" class="toolTips">
                        <img src="../../assets/images/question.png" alt="question" class="toolTipsImg" />
                    </Tooltip>
                </template>
            </FormItem>
        </template>
        <IviewModal :modal="modal">
            <div slot="content">
                <!--人员控件面板-->
                <template v-if="modal.modalType === 'person'">
                    <div class="personContent">
                        <div class="left">
                            <Tree :data="person.departmentList" class="personTree"></Tree>
                            <Table stripe :columns="person.leftTableColumns" :data="leftTableData" class="table"
                                   @on-selection-change="addPersonList"></Table>
                        </div>
                        <div class="btnGroup">
                            <Button type="primary" @click="addPerson">选择&lt;</Button>
                            <Button @click="delPerson">&gt;删除</Button>
                        </div>
                        <Table stripe :columns="person.rightTableColumns" :data="person.rightTableData" class="table"
                               @on-selection-change="delPersonList"></Table>
                    </div>
                </template>
            </div>
        </IviewModal>
    </div>
</template>

<script>
    import {Button, FormItem, Table, Input, RadioGroup, Radio, CheckboxGroup, Checkbox,Select,Option, DatePicker, Tabs, TabPane, Row, Col, Divider,Upload,Tree, Cascader,Tooltip} from 'iview'
    import 'iview/dist/styles/iview.css'
    import '../../assets/js/form'
    import PcItem from './PcItem'
    import Editor from 'wangeditor'
    import IviewModal from '../IviewModal'
    let _this;
    export default {
        name: "PcItem",
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
        components: {
            IviewModal,
            Button,FormItem,Table,Input,PcItem,RadioGroup,Radio,CheckboxGroup,Checkbox,Select,Option,DatePicker,Tabs, TabPane, Row, Col, Divider,Upload,Tree,Cascader,Tooltip
        },
        data(){
            return {
                //子表列
                sublistColumns: [
                    {
                        title: "#",
                        slot: "action",
                        width: 80,
                        align: "center"
                    }
                ],
                sublistData: [],
                //表达式js变量
                parser: "",
                //只读
                readonly: false,
                //隐藏
                hide: false,
                //iview弹出框
                modal: {
                    show: false,
                    title: "",
                    type: "",
                    modalType: ""
                },
                //人员列表
                person: {
                    //部门列表
                    departmentList: [],
                    //左侧表格列
                    leftTableColumns: [
                        {
                            type: "selection",
                            width: 60,
                            align: "center"
                        },
                        {
                            title: "姓名",
                            key: "fullName"
                        },
                        {
                            title: "学号/工号",
                            key: "userId"
                        }
                    ],
                    //提供选择的人员列表
                    personList: [],
                    //右侧表格列
                    rightTableColumns: [
                        {
                            type: "selection",
                            width: 60,
                            align: "center"
                        },
                        {
                            title: "姓名",
                            key: "fullName"
                        },
                        {
                            title: "学号/工号",
                            key: "userId"
                        }
                    ],
                    //右侧已选中的人员列表
                    rightTableData: [],
                    //人员预选框
                    addList: [],
                    //删除人员预选框
                    delList: [],
                    //显示的人员名
                    personNameStr: ""
                },
                //上传文件
                upload: {
                    params: {
                        mapCode: ""
                    },
                    fileList: []
                },
                editor: "",
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
                let {formModel, itemOptions, subListModel} = this;
                return Object.keys(subListModel).length > 0 ? formModel[itemOptions.key + subListModel.rowIndex] : formModel[itemOptions.key]
            },
            //人员列表
            'leftTableData': function () {
                let {rightTableData} = this.person;
                let personList = JSON.parse(JSON.stringify(this.person.personList));
                const idSet = rightTableData.reduce((acc, v) => {
                    acc[v.userId] = true;
                    return acc;
                }, {});
                return personList.filter(v => !idSet[v.userId]);
            }
        },
        watch: {
            //监听组件属性变化
            'formModel': {
                deep: true,
                immediate: true,
                handler: function(){
                    let {readonly, hide} = this.itemOptions;
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
            //监听弹出框操作
            'modal.type'(){
                let showStatus = this.modal.type.split("-")[1];
                let modal = this.modal;
                let modalType = this.modal.type.split("-")[0];
                if(modalType === 'person') {
                    modal.title = '选择人员';
                }
                modal.show = showStatus === 'show' ? true : false;
                modal.modalType = modalType;
                this.modal = modal;
            },
            //监听选中人员
            'person.rightTableData'(list){
                let personArr = [];
                let idArr = [];
                list.forEach(item => {
                    item['n'] = item.fullName;
                    item['v'] = item.userId;
                    idArr.push(item.userId);
                    personArr.push(item.fullName);
                });
                this.person.personNameStr = personArr.join(",");
                this.changeCompValue(idArr, list);
            }
        },
        mounted(){
            _this = this;
            //渲染子表
            let item = this.item;
            if(item.options && item.options.type === 'a-sub-list') {
                let sublist = item.data;
                let list = item.list;
                let {sublistColumns} = this;
                sublist.forEach(subItem => {
                    let {label, key} = subItem.options;
                    sublistColumns.push({
                        title: label,
                        key,
                        render: (h, params) => {
                            let list = this.item.list;
                            let {index: rowIndex} = params;
                            let rowList = list[rowIndex];
                            let colIndex;
                            if(list.length > rowIndex) {
                                rowList.forEach((rowItem, i) => {
                                    if(rowItem.key === subItem.key) {
                                        colIndex = i;
                                    }
                                });
                                return h(PcItem, {
                                    props: {
                                        item: list[rowIndex][colIndex],
                                        formModel: this.formModel,
                                        showLabel: false,
                                        subListModel: {
                                            rowIndex
                                        }
                                    }
                                })
                            }
                        }
                    })
                });
                this.sublistColumns = sublistColumns;
                this.$nextTick(() => {
                    let list = JSON.parse(JSON.stringify(item.list));
                    let exampleArr = JSON.parse(JSON.stringify(item.data));
                    let subListObj = {};
                    if(this.sublistData.length < list.length) {
                        list.forEach(item => {
                            exampleArr.forEach((item) => {
                                subListObj[item.key] = item[item.key];
                            });
                            this.sublistData.push(subListObj);
                        })
                    }
                })
            }
            //渲染富文本编辑器及级联数据
            this.$watch('item', {
                immediate: true,
                handler: (item) => {
                    let type = item.options.type;
                    //监听初始化富文本编辑器
                    if (type === 'rich-text') {
                        if(!this.editor) {
                            let editor = new Editor(`.${item.options.id}`);
                            editor.customConfig.onchange = html => {
                                let str = this.GLOBAL.delHtmlTag(html);
                                let maxLength = this.itemOptions.maxLength;
                                if(maxLength && str.length > maxLength) {
                                    editor.txt.html(this.formModel[this.itemOptions.key]);
                                    return false;
                                }
                                this.changeFlagFn(html);
                                // this.formModel[this.itemOptions.key] = html;
                            };
                            editor.create();
                            this.editor = editor;
                        }
                    } else if(type === 'cascade') {
                        let values = this.itemOptions.value.values;
                        values = this.GLOBAL.sortFileData({
                            data: values,
                            parentId: 0,
                            pidField: "pid",
                            idField: 'id',
                            callback: (res) => {
                                res['label'] = res['n'];
                                res['value'] = res['v'];
                            },
                            any: true
                        });
                        this.itemOptions.value.values = values;
                    } else if(type === 'choose-area'){
                        this.$axios.getLocationData().then(res => {
                            this.itemOptions.value.values = this.GLOBAL.sortFileData({
                                data: res.data,
                                parentId: 0,
                                pidField: "locationPid",
                                idField: 'locationId',
                                callback: (res) => {
                                    res['label'] = res['locationName'];
                                    res['value'] = res['locationId'];
                                },
                                any: true
                            });
                        });
                    } else if(type === 'choose-department'){
                        this.$axios.getApartmentList().then(res => {
                            this.itemOptions.value.values = this.GLOBAL.mapTree({
                                data: res.data,
                                callback: (res) => {
                                    res['label'] = res['orgName'];
                                    res['value'] = res['orgId'];
                                }
                            });
                        });
                    }
                }
            });
            //渲染初始化值
            this.initCompValue();
        },
        methods: {
            //添加子行
            addSubRow(){
                let sublistData = JSON.parse(JSON.stringify(this.item.data));
                let result = [];
                let subListObj = {};
                sublistData.forEach((item) => {
                    subListObj[item.key] = item[item.key];
                    result.push(JSON.parse(JSON.stringify(item)));
                });
                this.sublistData.push(subListObj);
                this.item.list.push(result);
            },
            //删除子行
            delSubRow(index){
                this.sublistData.splice(index, 1);
                this.item.list.splice(index, 1);
            },
            //改变组件值
            changeCompValue(val, list){
                let item = this.item;
                this.changeFlagFn(val);
                if(item.hasOwnProperty('assistFieldName')) {
                    this.relationField(val, list);
                }
            },
            //关联字段
            relationField(val, list){
                let values = list ? list : this.itemOptions.value.values;
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
                    this.changeCompValue(result);
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
            //文件上传前的操作
            handlerBeforeUpload(file){
                let uploadList = this.item.uploadList;
                let maxLength = this.itemOptions.maxLength;
                if(maxLength && uploadList.length >= maxLength) {
                    this.GLOBAL.toastInfo(`最多上传${maxLength}个附件`, 'warning');
                    return false;
                }
                this.$axios.ajax({
                    url: "file/attach/generate/mapCode"
                }).then(res => {
                    if(res.code === 0) {
                        let list = this.item.uploadList;
                        let formData = new FormData();
                        formData.append('file', file);
                        formData.append('mapCode', res.data);
                        list.push(formData);
                    }
                });
                return false;
            },
            //移除文件
            removeFile(index, is_upload){
                if(is_upload) {
                    let itemValue = this.itemValue;
                    let listArr = itemValue.split(",");
                    listArr.splice(index, 1);
                    this.changeCompValue(listArr.join(","));
                    this.item.alreadyUploadList.splice(index, 1);
                } else {
                    this.item.uploadList.splice(index, 1);
                }
            },
            //选择人员设置
            choosePerson() {
                this.modal.type = 'person-show';
                //人员控件监听获取部门及员工
                this.$Spin.show();
                this.$axios.getApartmentList().then(res => {
                    let list = res.data;
                    this.person.departmentList = this.GLOBAL.mapTree({
                        data: res.data,
                        callback: (res) => {
                            res['title'] = res['orgName'];
                            if(res.children && res.children.length > 0) {
                                res['expand'] = true;
                            }
                        }
                    });
                    if(list.length > 0) {
                        this.$axios.getPersonList({
                            data: {
                                params: {
                                    pageSize: 10000
                                }
                            }
                        }).then(res => {
                            this.person.personList = res.data.records;
                            this.$Spin.hide();
                        })
                    } else {
                        this.$Spin.hide();
                    }
                });
            },
            //左边人员列表选中
            addPersonList(selection) {
                this.person.addList = selection;
            },
            //添加人员
            addPerson() {
                let {addList, rightTableData} = this.person;
                let singleSwitch = this.item.singleSwitch;
                if(singleSwitch) {
                    console.warn(addList.length + rightTableData.length )
                    if(addList.length + rightTableData.length > 1) {
                        this.GLOBAL.toastInfo('只能选择一个人', 'error');
                        return false;
                    }
                }
                this.person.rightTableData = rightTableData.concat(addList);
                this.person.addList = [];
            },
            //删除人员
            delPerson() {
                let {rightTableData, delList} = this.person;
                const idSet = delList.reduce((acc, v) => {
                    acc[v.userId] = true;
                    return acc;
                }, {});
                this.person.rightTableData =  rightTableData.filter(v => !idSet[v.userId]);
            },
            //右边人员列表选中
            delPersonList(selection) {
                this.person.delList = selection;
            },
            //单选、复选等最大选择个数限制
            'selectMaxLength'(opt){
                let {itemValue, itemOptions} = this;
                let maxLength = itemOptions.maxLength;
                if(maxLength && itemValue.length >= maxLength) {
                    let flag = true;
                    for(let i = 0; i < itemValue.length; i++) {
                        if(itemValue[i] === opt.key) {
                            flag = false;
                            break;
                        }
                    }
                    return flag;
                }
                return false;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .pcItem {
        & >>> .ivu-tabs {
            overflow: visible;
        }
        &.contentWrap >>> .ivu-form-item-content {
            display: flex;
            align-items: center;
            .toolTips {
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-left: 10px;
                .ivu-tooltip-rel {
                    height: 100%;
                }
                .toolTipsImg {
                    width: 20px;
                    height: 20px;
                }
            }
        }
        .dividerTitle {
            padding-left: 30px;
            font-size: 18px;
            font-weight: bold;
        }
    }
    .personContent {
        display: flex;
        .table {
            flex: 0 0 auto;
            width: 300px;
        }
        .left {
            display: flex;
            flex: 1;
            overflow: hidden;
            .personTree {
                flex: 1;
                overflow: hidden;
            }
        }
        .btnGroup {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            margin: 0 15px;
        }
    }
    .subList {
        overflow: visible;
        & >>> .ivu-table, & >>> .ivu-table-cell {
            overflow: visible;
        }

    }
</style>
