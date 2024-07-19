<template>
    <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false"
        :close-on-press-escape="false">
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()"
            label-width="120px">
            <el-form-item prop="deviceName" label="设备名称">
                <el-input v-model.trim="dataForm.deviceName" placeholder="设备名称"></el-input>
            </el-form-item>
            <el-form-item prop="deviceType" label="设备类型">
                <el-input v-model.trim="dataForm.deviceType" placeholder="设备类型"></el-input>
            </el-form-item>
            <el-form-item prop="deviceModel" label="设备型号">
                <el-input v-model.trim="dataForm.deviceModel" placeholder="设备型号"></el-input>
            </el-form-item>
            <el-form-item prop="deviceFactory" label="设备厂家">
                <el-input v-model.trim="dataForm.deviceFactory" placeholder="设备厂家"></el-input>
            </el-form-item>
            <el-form-item prop="deviceNumber" label="设备序列号">
                <el-input v-model.trim="dataForm.deviceNumber" placeholder="设备序列号"></el-input>
            </el-form-item>
            <el-form-item prop="deviceStatus" label="设备状态">
                <el-input v-model.trim="dataForm.deviceStatus" placeholder="设备状态"></el-input>
            </el-form-item>
            <el-form-item prop="equipmentProcurementTime" label="设备采购时间">
                <el-input v-model.trim="dataForm.equipmentProcurementTime" placeholder="设备采购时间"></el-input>
            </el-form-item>
            <el-form-item prop="deviceDepartment" label="设备归属部门">
                <el-input v-model.trim="dataForm.deviceDepartment" placeholder="设备归属部门"></el-input>
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
                deviceName: "", // 设备名称
                deviceType: "", // 设备类型
                deviceModel: "", // 设备型号
                deviceFactory: "", // 设备厂家
                deviceNumber: "", // 设备序列号
                deviceStatus: "", // 设备状态
                equipmentProcurementTime: "", // 设备采购时间
                deviceDepartment: "", // 设备归属部门
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
