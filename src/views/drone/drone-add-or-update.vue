<template>
  <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <el-form-item prop="uavName" label="名称">
        <el-input v-model.trim="dataForm.uavName" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item prop="uavSerialNumber" label="序列号">
        <el-input v-model.trim="dataForm.uavSerialNumber" placeholder="序列号"></el-input>
      </el-form-item>
      <el-form-item prop="uavInfo" label="描述">
        <el-input v-model.trim="dataForm.uavInfo" placeholder="描述"></el-input>
      </el-form-item>
      <el-form-item prop="uavOwnerId" label="所属飞行队">
        <el-select style="width: 100%" v-model="dataForm.uavOwnerId" placeholder="所属飞行队" clearable>
          <el-option v-for="item in flyTeamList" :key="item.id" :label="item.flightName" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="uavModel" label="类型">
        <el-input v-model.trim="dataForm.uavModel" placeholder="类型"></el-input>
      </el-form-item>
      <el-form-item prop="uavType" label="型号">
        <el-select style="width: 100%" v-model="dataForm.uavType" placeholder="型号" clearable>
          <el-option v-for="(item, index) in droneTypeList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="inputUrl" label="推流地址">
        <el-input v-model.trim="dataForm.inputUrl" placeholder="推流地址"></el-input>
      </el-form-item>
      <el-form-item prop="outputUrl" label="拉流地址">
        <el-input v-model.trim="dataForm.outputUrl" placeholder="拉流地址"></el-input>
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
  props: {
    flyTeamList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  setup(props: any) {
    console.log(props);

    return reactive({
      visible: false,
      dataForm: {
        id: "",
        uavName: "",
        uavSerialNumber: "",
        uavInfo: "",
        uavOwnerId: "",
        uavModel: "",
        uavType: "",
        inputUrl: "",
        outputUrl: ""
      },
      droneTypeList: [
        { label: "大疆无人机", value: 1 },
        { label: "飞马无人机", value: 2 },
        { label: "其他无人机", value: 3 }
      ],
      flyTeamList: props.flyTeamList
    });
  },
  computed: {
    dataRule() {
      return {
        uavSerialNumber: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
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

        let url = "/project/patrol/uav/uavSave"; //新增
        if (this.dataForm.id) {
          url = "/project/patrol/uav/uavUpdate"; //修改
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
