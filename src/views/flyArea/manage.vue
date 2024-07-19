<template>
  <div class="mod-demo__news">
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
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateItem()">{{ $t("add") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" style="width: 100%">
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <!-- 地图展示 -->
    <map-show v-show="mapShowVisible" ref="mapShow"></map-show>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./flyArea-add-or-update.vue";
import MapShow from "../components/map-show.vue";
export default defineComponent({
  components: {
    AddOrUpdate,
    MapShow
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/uav/plan/areaPage",
      getDataListIsPage: true,
      deleteURL: "/project/area/areaDelete",
      dataForm: {
        name: "", //名称
        address: "" //地址
      },
      mapShowVisible: false
    });

    return {
      ...useView(state),
      ...toRefs(state)
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
