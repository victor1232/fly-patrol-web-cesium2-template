<template>
  <div class="mod-project__patrolhangarsite">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <!-- <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="exportHandle()">{{ $t("export") }}</el-button>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateHandle()">{{ $t("add") }}</el-button>
      </el-form-item>
      <!-- <el-form-item>
        <el-button  type="danger" @click="deleteHandle()">{{ $t("deleteBatch") }}</el-button>
      </el-form-item> -->
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" style="width: 100%">
      <!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
      <!-- <el-table-column prop="id" label="" header-align="center" align="center"></el-table-column> -->
      <el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="accessKey" label="匹配码" header-align="center" align="center"></el-table-column>
      <el-table-column prop="addr" label="地址" header-align="center" align="center"></el-table-column>
      <el-table-column prop="code" label="编码" header-align="center" align="center"></el-table-column>
      <el-table-column prop="controlRadius" label=" 遥控半径（M）" header-align="center" align="center"></el-table-column>
      <el-table-column prop="hangarId" label="机库id" header-align="center" align="center"></el-table-column>
      <el-table-column prop="siteId" label="站点id" header-align="center" align="center"></el-table-column>
      <el-table-column prop="lon" label="经度" header-align="center" align="center"></el-table-column>
      <el-table-column prop="lat" label="纬度" header-align="center" align="center"></el-table-column>
      <el-table-column prop="liveAiUrl" label="AI直播URL" header-align="center" align="center"></el-table-column>
      <el-table-column prop="liveHangarUrl" label="机库直播 URL" header-align="center" align="center"></el-table-column>
      <el-table-column prop="liveUavUrl" label="无人机直播 URL" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uavId" label="无人机id" header-align="center" align="center"></el-table-column>
      <!-- <el-table-column prop="creator" label="创建者" header-align="center" align="center"></el-table-column>
      <el-table-column prop="createDate" label="创建时间" header-align="center" align="center"></el-table-column> -->
      <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
        <template v-slot="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t("update") }}</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t("delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="pageSizeChangeHandle" @current-change="pageCurrentChangeHandle"> </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./patrolhangarsite-add-or-update.vue";
export default defineComponent({
  components: {
    AddOrUpdate
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/patrolhangarsite/page",
      getDataListIsPage: true,
      exportURL: "/project/patrolhangarsite/export",
      deleteURL: "/project/patrolhangarsite",
      deleteIsBatch: true,
      dataForm: {}
    });
    return { ...useView(state), ...toRefs(state) };
  },
  watch: {}
});
</script>
