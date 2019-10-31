<template>
    <div>
        <Form :label-width="120" :model="formModel" ref="pcForm" :rules="rules">
            <template v-for="item in formData">
                <PcItem :item="item" :formModel="formModel" :form-value="formValue"></PcItem>
            </template>
            <FormItem style="text-align:center;" v-if="formData.length > 0">
                <Button type="primary" @click="submitForm">提交</Button>
            </FormItem>
        </Form>
    </div>
</template>

<script>
    import {Form, FormItem, Button} from 'iview'
    import PcItem from '../components/Pc/PcItem'
    import '../assets/js/form'
    export default {
        name: "PC",
        props: ['formData', 'formModel', 'ajaxData', 'formValue'],
        components: {
            PcItem,
            Form,
            FormItem,
            Button,
        },
        data(){
            return {
                //表单规则
                rules: {}
            }
        },
        watch: {
            formData(){
                //生成校验规则
                this.formatRules();
                //生成监听
                this.updateWatch();
            }
        },
        methods: {
            //计算校验规则
            formatRules(){
                let rules = {};
                let list = this.formData;
                let parser = form.parser();
                list.forEach(item => {
                    let {required, inputRules,key: field} = item.options;
                    let fieldRulesArr = [];
                    //必填的规则
                    if(required) {
                        let {type, expression} = required;
                        if(type !== 'off') {
                            if(type === 'on') {
                                fieldRulesArr.push({
                                    required: true,
                                    message: "此项为必填项",
                                    trigger: "blur"
                                })
                            } else {
                                const exprFn = (rule, value, callback) => {
                                    if(form.utils.runExpression(expression, {
                                        $form: this.formModel
                                    }, parser)) {
                                        if(value === '') {
                                            callback(new Error('此项为必填项'));
                                        } else {
                                            callback()
                                        }
                                    }
                                };
                                fieldRulesArr.push({
                                    validator: exprFn,
                                    trigger: "blur"
                                })
                            }
                        }
                    }
                    //输入的验证规则
                    if(inputRules && inputRules.length > 0) {
                        inputRules.forEach(rules => {
                            let {message, validateType } = rules;
                            let expression = rules.regularOrExpression;
                            switch (validateType) {
                                case 'local':
                                    if(eval(expression) instanceof RegExp) {
                                        fieldRulesArr.push({
                                            pattern: eval(expression),
                                            message: message,
                                            trigger: "blur"
                                        })
                                    }
                                    break;
                                case 'expression':
                                    const exprFn = (rule, value, callback) => {
                                        if(form.utils.runExpression(expression, {
                                            $form: this.formModel
                                        }, parser)) {
                                            callback(new Error(message));
                                        } else {
                                            callback();
                                        }
                                    };
                                    fieldRulesArr.push({
                                        validator: exprFn,
                                        trigger: "blur"
                                    });
                                    break;
                                case 'remote':
                                    const remoteFn = (rule, value, callback) => {
                                        this.$axios.ajax({
                                            url: expression,
                                            data: {
                                                params: {
                                                    v: value
                                                }
                                            }
                                        }).then(res => {
                                            if(res.data) {
                                                callback();
                                            } else {
                                                callback(new Error(message));
                                            }
                                        })
                                    };
                                    fieldRulesArr.push({
                                        validator: remoteFn,
                                        trigger: "blur"
                                    });
                                    break;
                            }
                        });
                    }
                    rules[field] = fieldRulesArr;
                });
                this.rules = rules;
            },
            //提交表单
            submitForm(){
                this.$bus.$emit('submitForm');
            },
            //监听
            updateWatch(){
                let list = this.formData;
                let parser = form.parser();
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
            }
        }
    }
</script>

<style scoped>

</style>
