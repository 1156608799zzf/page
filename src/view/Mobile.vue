<template>
    <div>
        <XHeader :left-options="{showBack: false}">
            表单
            <div slot="right" @click="submitForm">完成</div>
        </XHeader>
        <group class="group">
            <template v-for="item in formData">
                <MobileItem :item="item" :formModel="formModel" :form-value="formValue"></MobileItem>
            </template>
        </group>
    </div>
</template>

<script>
    import { XButton, Group, XHeader} from 'vux'
    import MobileItem from '../components/Mobile/MobileItem'
    import '../assets/js/form'
    export default {
        name: "Mobile",
        props: ['formData', 'formModel', 'ajaxData', 'formValue'],
        components: {
            MobileItem,
            XButton,Group,XHeader
        },
        data(){
            return {
                parser: ""
            }
        },
        watch: {
            formData(){
                //生成监听
                this.updateWatch();
            }
        },
        mounted(){
            //初始化表单运算表达式方法
            this.parser = form.parser();
        },
        methods: {
            //监听
            updateWatch(){
                let list = this.formData;
                let parser = this.parser;
                let watchArr = [],
                    watchColl = {};
                list.forEach(item => {
                    let field = item.options ? item.options.key : '';
                    let {watch} = item.options;
                    if(field && watch) {
                        watch.forEach(watchObj => {
                            watchObj.el = field;
                            watchArr.push(watchObj);
                        })
                    }
                });
                watchArr.forEach(item => {
                    let {expression, el} = item;
                    let varArr = form.parseExpressionField(expression);
                    varArr.forEach(modelVar => {
                        let str = modelVar.replace('$form.', '');
                        if(!watchColl[str]) {
                            watchColl[str] = [];
                        }
                        watchColl[str].push({
                            el,
                            expression
                        })
                    })
                });
                for(let i in watchColl) {
                    this.$watch('formModel.' + i, () => {
                        let arr = watchColl[i];
                        arr.forEach(item => {
                            let expression = item.expression;
                            this.formModel[item.el] = String(form.utils.runExpression(expression, {
                                $form: this.formModel
                            }, parser));
                        })
                    })
                }
            },
            //提交表单
            submitForm(){
                this.$bus.$emit('submitForm');
            }
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
        & >>> :after {
            display: none !important;
        }
    }
</style>
