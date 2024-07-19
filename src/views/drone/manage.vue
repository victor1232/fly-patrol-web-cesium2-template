<template>
  <div class="mod-demo__news">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.uavName" placeholder="无人机名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.uavOwnerId" placeholder="所属飞行队" clearable>
          <el-option v-for="item in flyTeamList" :key="item.id" :label="item.flightName" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.uavSerialNumber" placeholder="无人机序列号" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateItem()">{{ $t("add") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" style="width: 100%">
      <el-table-column prop="uavName" label="名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uavState" label="状态" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ getDroneState(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uavModel" label="类型" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uavType" label="型号" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ getDroneType(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uavOwnerId" label="所属飞行队" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ getFlyTeam(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uavVoyage" label="航行里程(km)" header-align="center" align="center"></el-table-column>
      <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
        <template v-slot="scope">
          <el-button type="text" size="small" @click="addOrUpdateItem(scope.row)">{{ $t("update") }}</el-button>
          <el-button type="text" size="small" @click="deleteRowItem(scope.row.id)">{{ $t("delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="pageSizeChangeHandle" @current-change="pageCurrentChangeHandle"> </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" :flyTeamList="flyTeamList" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script lang="ts">
import baseService from "@/service/baseService";
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./drone-add-or-update.vue";
export default defineComponent({
  components: {
    AddOrUpdate
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/patrol/uav/uavPage",
      getDataListIsPage: true,
      deleteURL: "/project/patrol/uav/uavDelete",
      dataForm: {
        uavName: "", //无人机名称模糊查询
        uavOwnerId: "", //所属飞行队ID
        uavSerialNumber: "" //无人机序列号模糊查询
      },
      flyTeamList: [] as Array<any> //飞行队信息
    });

    const getFlyTeamList = () => {
      baseService.get("/project/patrol/uav/uavSelectFlight").then((res) => {
        state.flyTeamList = res.data;
      });
    };
    getFlyTeamList();

    // 计算飞行队
    const getFlyTeam = (row: { uavOwnerId: string | number }) => {
      let flyTeam: any = state.flyTeamList.find((item: any): boolean => item.id === row.uavOwnerId);
      return flyTeam ? flyTeam.flightName : "";
    };

    const getDroneState = (row: { uavState: string | number }) => {
      let stateType: any = {
        "0": "待飞",
        "1": "在飞",
        "2": "停飞",
        "3": "保养",
        "4": "报废"
      };
      return stateType[row.uavState];
    };
    const getDroneType = (row: { uavType: string | number }) => {
      let droneType: any = {
        "0": "大疆无人机",
        "1": "飞马无人机",
        "2": "其他无人机"
      };
      return droneType[row.uavType];
    };
    return {
      ...useView(state),
      ...toRefs(state),
      getFlyTeam,
      getDroneState,
      getDroneType
    };
  }
});
</script>
