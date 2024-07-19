<template>
    <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false"
        :close-on-press-escape="false">
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()"
            label-width="120px">
            <el-form-item prop="fireName" label="姓名">
                <el-input v-model.trim="dataForm.fireName" placeholder="姓名"></el-input>
            </el-form-item>
            <el-form-item prop="company" label="单位">
                <el-input v-model.trim="dataForm.company" placeholder="单位"></el-input>
            </el-form-item>
            <el-form-item prop="certificateType" label="证书类型">
                <el-input v-model.trim="dataForm.certificateType" placeholder="证书类型"></el-input>
            </el-form-item>
        </el-form>
        <template v-slot:footer>
            <el-button @click="visible = false">{{ $t("cancel") }}</el-button>
            <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t("confirm") }}</el-button>
        </template>
    </el-dialog>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import baseService from "@/service/baseService";
import { useDebounce } from "@/utils/utils";
export default defineComponent({
    setup() {
        return reactive({
            visible: false,
            dataForm: {
                id:"",
                fireName: "", // 姓名
                company: "", // 单位
                certificateType: "", // 证书类型
            }
        });
    },
    computed: {
        dataRule() {
            return {
                fireName: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
                company: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
                certificateType: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
            };
        }
    },
    created() {
        this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
    },
    methods: {
        init(row: any) {
            this.dataForm = row || {};
            this.visible = true;
        },
        // 获取信息
        getInfo() {
            baseService.post(`/project/patrol/uav/uavInfo`, { id: this.dataForm.id }).then((res) => {
                if (res.code !== 0) {
                    return this.$message.error(res.msg);
                }
                this.dataForm = res.data;
            });
        },
        // 表单提交
        dataFormSubmitHandle() {
            this.$refs["dataFormRef"].validate((valid: boolean) => {
                if (!valid) {
                    return false;
                }

                let url = "/project/uav/flight/flightSave"; //新增
                if (this.dataForm.id) {
                    url = "project/uav/flight/flightUpdate"; //修改
                }
                baseService.post(url, this.dataForm).then((res) => {
                    if (res.code !== 0) {
                        return this.$message.error(res.msg);
                    }
                    this.$message({
                        message: this.$t("prompt.success"),
                        type: "success",
                        duration: 500,
                        onClose: () => {
                            this.visible = false;
                            this.$emit("refreshDataList");
                        }
                    });
                });
            });
        }
    }
});
</script>
