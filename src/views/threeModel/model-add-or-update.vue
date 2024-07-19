<template>
  <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item prop="parentName" label="上级" class="model-list">
        <el-popover v-model:visible="modelListVisible" :width="400" ref="modelListPopover" placement="bottom-start" trigger="click">
          <template v-slot:reference>
            <el-input v-model="dataForm.parentName" :readonly="true">
              <template v-slot:suffix> <i v-if="dataForm.pid !== '0'" @click.stop="deptListTreeSetDefaultHandle()" class="el-icon-circle-close el-input__icon"></i></template>
            </el-input>
          </template>
          <el-tree :data="modelList" :props="{ label: 'name', children: 'children' }" node-key="id" ref="modelListTree" :highlight-current="true" :expand-on-click-node="false" accordion @current-change="deptListTreeCurrentChangeHandle"> </el-tree>
        </el-popover>
      </el-form-item>
      <el-form-item label="模型时间">
        <el-date-picker type="date" placeholder="选择日期" v-model="dataForm.modelTime" prop="modelTime" style="width: 100%"></el-date-picker>
      </el-form-item>
      <el-form-item label="模型编号" prop="modelCode">
        <el-input v-model="dataForm.modelCode" placeholder="模型编号"></el-input>
      </el-form-item>
      <el-form-item label="模型地址" prop="modelUrl">
        <el-input v-model="dataForm.modelUrl" placeholder="模型地址"></el-input>
      </el-form-item>
      <el-form-item label="是否展示" prop="isShow">
        <el-select style="width: 100%" v-model="dataForm.isShow" placeholder="是否展示">
          <el-option label="是" :value="0"></el-option>
          <el-option label="否" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模型高度" prop="hight">
        <el-input-number v-model="dataForm.hight" />
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
      modelList: [],
      modelListVisible: false,
      dataForm: {
        id: "",
        name: "",
        pid: "0",
        parentName: "无",
        modelCode: "",
        modelUrl: "",
        isShow: 0,
        hight: 0,
        modelTime: ""
      }
    });
  },
  computed: {
    dataRule() {
      return {
        name: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        modelUrl: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
      };
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
  },
  methods: {
    init() {
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataFormRef"].resetFields();
        if (this.dataForm.id) {
          this.getInfo();
        } else {
          this.getTime();
        }
        this.getModelList();
      });
    },
    // 新增默认时间
    getTime() {
      var date = new Date();
      var y = date.getFullYear();
      var m = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
      var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      const time = y + "-" + m + "-" + d;
      this.dataForm.modelTime = time;
    },
    // 获取信息
    getInfo() {
      baseService.get("/project/patrolmodel/" + this.dataForm.id).then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.dataForm = res.data;
      });
    },
    // 上级菜单树, 设置默认值
    deptListTreeSetDefaultHandle() {
      this.dataForm.pid = "0";
      this.dataForm.parentName = "无";
    },
    // 获取模型列表
    getModelList() {
      baseService.get("/project/patrolmodel/listTree").then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.modelList = res.data;
      });
    },
    // 上级模型树, 选中
    deptListTreeCurrentChangeHandle(data: any) {
      this.dataForm.pid = data.id;
      this.dataForm.parentName = data.name;
      this.modelListVisible = false;
    },
    // 表单提交
    dataFormSubmitHandle() {
      var date = new Date(this.dataForm.modelTime);
      var y = date.getFullYear();
      var m = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
      var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      const time = y + "-" + m + "-" + d;
      this.dataForm.modelTime = time;
      this.$refs["dataFormRef"].validate((valid: boolean) => {
        if (!valid) {
          return false;
        }
        (!this.dataForm.id ? baseService.post : baseService.put)("/project/patrolmodel", this.dataForm).then((res) => {
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
