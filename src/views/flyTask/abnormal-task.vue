<template>
  <el-dialog v-model="visible" title="设置" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <el-form-item prop="patrolPlanError" label="异常原因">
        <el-input v-model.trim="dataForm.patrolPlanError" placeholder="异常原因"></el-input>
      </el-form-item>
      <el-form-item prop="coordinateInfo" label="协调时间">
        <el-date-picker style="width: 100%" v-model="dataForm.coordinateInfo" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择时间"> </el-date-picker>
      </el-form-item>
      <el-form-item prop="planErrorDate" label="异常时间">
        <el-date-picker style="width: 100%" v-model="dataForm.planErrorDate" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择时间"> </el-date-picker>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <el-button @click="closeDialog">{{ $t("cancel") }}</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t("confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import baseService from "@/service/baseService";
import { useDebounce } from "@/utils/utils";
export default defineComponent({
  props: {
    abnormalTaskId: {
      type: String,
      default: ""
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return reactive({
      dataForm: {
        id: "",
        patrolPlanError: "",
        coordinateInfo: "",
        planErrorDate: ""
      }
    });
  },
  computed: {
    dataRule() {
      return {
        patrolPlanError: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
      };
    },
    visible() {
      return this.modelValue;
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
  },
  methods: {
    // 表单提交
    dataFormSubmitHandle() {
      this.$refs["dataFormRef"].validate((valid: boolean) => {
        if (!valid) {
          return false;
        }
        this.dataForm.id = this.abnormalTaskId;
        baseService.post("/project/uav/plan/planUpdateError", this.dataForm).then((res) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg);
          }
          this.$message({
            message: this.$t("prompt.success"),
            type: "success",
            duration: 500,
            onClose: () => {
              this.$emit("update:modelValue", false);
              this.$emit("refreshDataList");
            }
          });
        });
      });
    },
    closeDialog() {
      this.$emit("update:modelValue", false);
    }
  }
});
</script>
