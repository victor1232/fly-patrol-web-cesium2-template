<template>
  <div class="mod-demo__news">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.questionName" placeholder="问题名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.questionAddress" placeholder="问题地址" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.questionStatus" placeholder="问题状态" clearable>
          <el-option v-for="(item, index) in issueStatusList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.patrolPlanName" placeholder="任务名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border style="width: 100%">
      <el-table-column prop="questionSerialNo" label="问题编号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="questionName" label="问题名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="questionAddress" label="问题地址" header-align="center" align="center"></el-table-column>
      <el-table-column prop="questionStatus" label="问题状态" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ getIssueState(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="questionDate" label="发现时间" header-align="center" align="center"></el-table-column>
      <el-table-column prop="questionInfo" label="问题描述" header-align="center" align="center"></el-table-column>
      <el-table-column prop="areaName" label="区域名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uavName" label="无人机名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uavSerialNumber" label="无人机编号" header-align="center" align="center"></el-table-column>
      <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
        <template v-slot="scope">
          <el-button type="text" size="small" @click="addOrUpdateItem(scope.row)">{{ $t("update") }}</el-button>
          <el-button type="text" size="small" @click="deleteRowItem(scope.row.id)">{{ $t("delete") }}</el-button>
          <el-button type="text" size="small" @click="preViewArea(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="pageSizeChangeHandle" @current-change="pageCurrentChangeHandle"> </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" :issueStatusList="issueStatusList" @refreshDataList="getDataList"></add-or-update>
    <!-- 地图展示 -->
    <map-show v-show="mapShowVisible" ref="mapShow"></map-show>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./flyIssue-add-or-update.vue";
import MapShow from "../components/map-show.vue";
export default defineComponent({
  components: {
    AddOrUpdate,
    MapShow
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/plan/question/page",
      getDataListIsPage: true,
      deleteURL: "/project/plan/question/questionDelete",
      dataForm: {
        questionName: "", //名称
        questionAddress: "", //地址
        questionStatus: "", //状态
        patrolPlanName: "" //任务
      },
      //问题类型分类
      issueStatusList: [
        { label: "未处理", value: 0 },
        { label: "已处理", value: 1 },
        { label: "异常问题", value: 2 },
        { label: "无需处理", value: 3 }
      ] as Array<any>,
      mapShowVisible: false
    });
    //问题状态
    const getIssueState = (row: any) => {
      let stateInfo = state.issueStatusList.find((item: any) => item.value === row.questionStatus);
      if (stateInfo) return stateInfo.label;
      return "";
    };
    return {
      ...useView(state),
      ...toRefs(state),
      getIssueState
    };
  },
  methods: {
    preViewArea(row: any) {
      this.mapShowVisible = true;
      this.$refs.mapShow.init(row);
    }
  }
});
</script>
