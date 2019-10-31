<template>
    <div class="chooseUserPage">
        <XHeader :left-options="{backText: '取消'}">
            人员选择
            <div slot="right" @click="chooseComplete">完成</div>
        </XHeader>
        <tab v-model="tabIndex">
            <tab-item v-for="(item ,index) in tabList" :key="index" @click="tabIndex = index">{{ item.title }}</tab-item>
        </tab>
        <swiper v-model="tabIndex" :show-dots="false">
            <swiper-item v-for="(item, index) in tabList" :key="index">
                <template v-if="index === 0">
                    <input class="searchInput" type="text" v-model="item.keyword" placeholder="搜索" @keyup.enter="resetMescroll">
                    <mescroll-vue ref="mescroll" :up="mescrollUp" @init="mescrollInit">
                        <div class="personList">
                            <div class="item" :class="{active: person.is_check}" v-for="(person, personIndex) in personList" :key="personIndex" @click="choosePerson(personIndex)">
                                <img :src="person.avatar" class="userImg">
                                <div class="userMsg">
                                    <div class="name">{{ person.nickName }}</div>
                                    <div class="department">{{ person.fullName }}</div>
                                </div>
                            </div>
                        </div>
                    </mescroll-vue>
                </template>
                <template v-else>
                    <div class="personList">
                        <swipeout>
                            <swipeout-item v-for="(person, personIndex) in alreadyChooseList" :key="personIndex" transition-mode="follow">
                                <div slot="right-menu">
                                    <swipeout-button background-color="#D23934" @click.native="delPerson(personIndex)">删除</swipeout-button>
                                </div>
                                <div slot="content">
                                    <div class="item no_check">
                                        <img :src="person.avatar" class="userImg">
                                        <div class="userMsg">
                                            <div class="name">{{ person.nickName }}</div>
                                            <div class="department">{{ person.fullName }}</div>
                                        </div>
                                    </div>
                                </div>
                            </swipeout-item>
                        </swipeout>
                    </div>
                </template>
            </swiper-item>
        </swiper>
    </div>
</template>

<script>
    import {Tab, TabItem, Swiper, SwiperItem, Search,CheckIcon,CellBox,Group,Scroller,Swipeout, SwipeoutItem, SwipeoutButton,XHeader } from 'vux'
    import MescrollVue from 'mescroll.js/mescroll.vue'
    export default {
        name: "ChooseUser",
        props: [],
        components: {
            MescrollVue,
            Tab, TabItem, Swiper, SwiperItem,Search,CheckIcon,CellBox,Group,Scroller,Swipeout, SwipeoutItem, SwipeoutButton,XHeader
        },
        data() {
            return {
                tabIndex: 0,
                tabList: [
                    {
                        title: "候选值",
                        keyword: ""
                    },
                    {
                        title: "已选择",
                        keyword: ""
                    }
                ],
                //人员列表
                personList: [],
                //已选择的人员列表
                alreadyChooseList: [],
                mescroll: "",
                mescrollUp: {
                    callback: this.getPersonList,
                    lazyLoad: {
                        use: true
                    }
                }
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            resetMescroll(){
                this.mescroll.resetUpScroll();
            },
            mescrollInit (mescroll) {
                this.mescroll = mescroll;
            },
            //获取人员列表
            getPersonList(page, mescroll){
                this.$axios.getPersonList({
                    data: {
                        params: {
                            page: page.num,
                            pageSize: page.size,
                            fullName: this.tabList[0].keyword
                        }
                    }
                }).then(res => {
                    if(res.code === 0) {
                        let dataList = res.data.records;
                        if(page.num === 1) {
                            this.personList = [];
                        }
                        this.personList = this.personList.concat(dataList);
                        this.$nextTick(() => {
                            mescroll.endSuccess(dataList.length);
                        })
                    }
                }).catch(err => {

                })
            },
            //选择人员
            choosePerson(index){
                let person = this.personList[index];
                let alreadyChooseList = this.alreadyChooseList;
                if(person.is_check) {
                    for(let i = 0; i < alreadyChooseList.length; i++) {
                        let item = alreadyChooseList[i];
                        if(item.userId === person.userId) {
                            alreadyChooseList.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    alreadyChooseList.push(JSON.parse(JSON.stringify(person)));
                }
                person.is_check = !person.is_check;
                this.$set(this.personList, index, person);
                this.alreadyChooseList = alreadyChooseList;
            },
            //删除人员
            delPerson(index){
                let alreadyChooseList = this.alreadyChooseList;
                alreadyChooseList.splice(index, 1);
                this.alreadyChooseList = alreadyChooseList;
            },
            //选择完成
            chooseComplete(){
                this.$bus.$emit('choosePerson', this.alreadyChooseList);
                this.$router.go(-1);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .chooseUserPage {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #EFEFF4;
        .searchInput {
            width: calc(100% - 30px);
            border-radius: 6px;
            background: #fff;
            margin: 10px;
            outline: 0;
            border: 0;
            line-height: 30px;
            font-size: 14px;
            padding-left: 10px;
            &::-webkit-input-placeholder {
                color: #999;
                text-align: center;
            }
        }
        & >>> .vux-slider {
            flex: 1;
            .vux-swiper {
                height: 100% !important;
                .vux-swiper-item {
                    display: flex;
                    flex-direction: column;
                    .scrollWrap {
                        flex: 1;
                    }
                }
            }
        }
        .personList {
            background: #fff;
            .item {
                position: relative;
                display: flex;
                align-items: center;
                padding: 15px 10px 15px 45px;
                border-bottom: 1px solid #ccc;
                width: calc(100% - 10px);
                margin-left: 10px;
                &:last-child {
                    border-bottom: 0;
                }
                &:after {
                    content: "";
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 50%;
                    left: 10px;
                    transform: translateY(-50%);
                    border: 1px solid #C0C0C0;
                    border-radius: 50%;
                }
                &.active {
                    &:after {
                        border-color: #157EFB;
                    }
                    &:before {
                        content: "";
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        left: 15px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: #157EFB;
                        border-radius: 50%;
                    }
                }
                &.no_check {
                    padding-left: 10px;
                    &:after,&:before {
                        display: none;
                    }
                }
                .userImg {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    margin-right: 10px;
                }
                .userMsg {
                    font-size: 14px;
                    .name {
                        color: #333;
                    }
                    .department {
                        color: #A6A6AA;
                        margin-top: 5px;
                    }
                }
            }
        }
    }
</style>
