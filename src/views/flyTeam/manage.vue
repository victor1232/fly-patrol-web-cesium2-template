<template>
  <div class="mod-demo__news">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.flightName" placeholder="飞行队名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.flightHead" placeholder="负责人" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.flightMembers" placeholder="成员名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.flightInfo" placeholder="信息描述" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateItem()">{{ $t("add") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle"
      @sort-change="dataListSortChangeHandle" style="width: 100%">
      <el-table-column prop="flightName" label="飞行队名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="flightHead" label="负责人" header-align="center" align="center"></el-table-column>
      <el-table-column prop="flightMembers" label="成员名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="flightInfo" label="信息描述" header-align="center" align="center"></el-table-column>
      <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
        <template v-slot="scope">
          <el-button type="text" size="small" @click="addOrUpdateItem(scope.row)">{{ $t("update") }}</el-button>
          <el-button type="text" size="small" @click="deleteRowItem(scope.row.id)">{{ $t("delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="limit" :total="total"
      layout="total, sizes, prev, pager, next, jumper" @size-change="pageSizeChangeHandle"
      @current-change="pageCurrentChangeHandle"> </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./flyTeam-add-or-update.vue";
export default defineComponent({
  components: {
    AddOrUpdate
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/uav/flight/page",
      getDataListIsPage: true,
      deleteURL: "/project/uav/flight/flightDelete",
      dataForm: {
        flightName: "", //飞行队名称
        flightHead: "", //飞行队负责人
        flightMembers: "", //成员名称
        flightInfo: "" //描述信息
      }
    });
    return {
      ...useView(state),
      ...toRefs(state)
    };
  }
});
</script>
