<template>
  <el-dialog v-model="visible" title="设置" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form class="area-permission-form" ref="dataFormRef" label-width="120px">
      <el-form-item label="选择区划">
        <el-tree class="area-tree" :data="areaList" :props="{ label: 'name', children: 'children' }" node-key="id" ref="areaListTree" accordion show-checkbox :default-expand-all="true" @check="areaCheckHandle"></el-tree>
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
    departId: {
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
      areaList: [{ id: "all", name: "全区域", children: [] }], //所有区域列表
      preSelectList: [] //之前拥有部门权限
    });
  },
  computed: {
    visible() {
      return this.modelValue;
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.$refs.areaListTree.setCheckedKeys([]);
        this.getAreaList();
        this.getPreSelectList();
      });
    },
    // 获取菜单列表
    getAreaList() {
      baseService.get("/project/sys/dept/area/selectAllDeptArea").then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.areaList = [{ id: "all", name: "全区域", children: res.data }];
      });
    },
    // 获取之前权限列表
    getPreSelectList() {
      baseService
        .post("/project/sys/dept/area/selectAreaIdByDeptId", {
          deptId: this.departId
        })
        .then((res) => {
          if (res.code !== 0) {
            this.$message.error(res.msg);
          }
          this.preSelectList = res.data;
          this.$refs.areaListTree.setCheckedKeys(this.preSelectList.map((v: any) => v.deptAreaId));
        });
    },
    // 选择区域
    areaCheckHandle(data: any, checked: boolean) {
      if (checked) {
        this.$refs.areaListTree.setCheckedKeys([data.id]);
      }
    },
    // 表单提交
    dataFormSubmitHandle() {
      //获取所有选中节点
      let checkedKeys = this.$refs.areaListTree.getCheckedKeys();
      let dataList: any[] = [];
      checkedKeys.forEach((item: any) => {
        if (item === "all") return;
        dataList.push({
          deptId: this.departId,
          deptAreaId: item
        });
      });
      baseService.post("/project/sys/dept/area/saveDeptArea", dataList).then((res) => {
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
    },
    closeDialog() {
      this.$emit("update:modelValue", false);
    }
  }
});
</script>
<style lang="less" scoped>
.area-permission-form {
  .area-tree {
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>
