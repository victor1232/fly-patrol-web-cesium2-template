<template>
  <div class="mod-demo__news task_area_select">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.address" placeholder="地址" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="AreaSelectTable" v-loading="dataListLoading" :data="dataList" border :row-key="getRowKeys" @selection-change="selectionChangeHandle" :header-cell-class-name="cellClass" height="280" style="width: 100%">
      <el-table-column type="selection" width="55" align="center" :reserve-selection="true"></el-table-column>
      <el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="address" label="地址" header-align="center" align="center"></el-table-column>
      <el-table-column prop="siteNumber" label="编号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="level" label="级别" header-align="center" align="center"></el-table-column>
      <el-table-column prop="type" label="类型" header-align="center" align="center"></el-table-column>
      <el-table-column prop="constion" label="责任单位" header-align="center" align="center"></el-table-column>
      <el-table-column prop="town" label="所属办事处" header-align="center" align="center"></el-table-column>
      <el-table-column prop="eppoint" label="国控点距离" header-align="center" align="center"></el-table-column>
      <el-table-column prop="isFile" label="是否有文件" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.isFile === 1 ? "是" : scope.row.isFile === 0 ? "否" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="isMajor" label="是否为重点企业" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.isMajor === 1 ? "是" : scope.row.isMajor === 0 ? "否" : "" }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="limit" :pager-count="5" :total="total" layout="total, sizes, prev, pager, next" @size-change="pageSizeChangeHandle" @current-change="pageCurrentChangeHandle"> </el-pagination>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      getDataListURL: "/project/uav/plan/areaPage",
      getDataListIsPage: true,
      deleteURL: "/project/area/areaDelete",
      dataForm: {
        name: "", //名称
        address: "" //地址
      },
      mapShowVisible: false,
      preSelections: [],
      isDeafaultSelect: false
    });

    return {
      ...useView(state),
      ...toRefs(state)
    };
  },
  methods: {
    setDefaultSelection(value: any) {
      this.preSelections = value.map((v: any) => String(v));
      this.isDeafaultSelect = true;
      this.$refs.AreaSelectTable.clearSelection();
      this.$nextTick(() => {
        value.forEach((id: any) => {
          let selectItem = { id: String(id) };
          this.$refs.AreaSelectTable.toggleRowSelection(selectItem, true);
        });
        this.getDataList();
        this.$nextTick(() => {
          this.isDeafaultSelect = false;
        });
      });
    },
    selectionChangeHandle(value: any) {
      // 防止父级设置勾选时触发选中事件
      if (this.isDeafaultSelect) return;
      let selections = value.map((v: any) => v.id);
      if (selections.length > this.preSelections.length) {
        this.$emit("selectAreaTable", selections[selections.length - 1], true);
      } else {
        this.preSelections.forEach((item) => {
          if (!selections.includes(item)) {
            this.$emit("selectAreaTable", item, false);
          }
        });
      }
      this.preSelections = selections;
    },
    // 记录选中
    getRowKeys(row: any) {
      return row.id;
    },
    // 禁用全选
    cellClass(row: any) {
      if (row.columnIndex === 0) {
        return "disabledCheck";
      }
    }
  }
});
</script>
<style lang="less">
.task_area_select {
  .el-table .disabledCheck .cell .el-checkbox__inner {
    display: none !important;
  }

  .el-table .disabledCheck .cell::before {
    content: "选择";
    text-align: center;
    line-height: 37px;
  }
}
</style>
