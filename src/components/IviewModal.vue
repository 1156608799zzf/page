<template>
    <Modal
        v-model="modal.show"
        :title="modal.title ? modal.title : null"
        :width="1000"
        @on-ok="emitEvent('sure')"
        @on-cancel="emitEvent('cancel')"
    >
        <slot name="content"></slot>
        <slot name="footer"></slot>
    </Modal>
</template>

<script>
    import {Modal} from 'iview'
    export default {
        name: "IviewModal",
        props: ['modal'],
        components: {
            Modal
        },
        methods: {
            emitEvent(eventName, params){
                this.modal.type = this.modal.type.split("-")[0] + "-hide";
                this.$emit(eventName, params);
            }
        }
    }
</script>

<style scoped>

</style>
