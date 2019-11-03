<template>
    <div>
        <div>
            <Button type="primary" @click="choosePerson">选择人员</Button>
            <Input v-model="person.personNameStr" :readonly="true" />
        </div>
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
    import {Button, Table, Tree, Input} from 'iview'
    import 'iview/dist/styles/iview.css'
    import IviewModal from '../IviewModal'
    export default {
        name: "ChooseUser",
        components: {
            IviewModal,
            Button,Table,Tree,Input
        },
        props: ['item'],
        data(){
            return {
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
            }
        },
        computed: {
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
        methods: {
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
        }
    }
</script>

<style scoped>

</style>
