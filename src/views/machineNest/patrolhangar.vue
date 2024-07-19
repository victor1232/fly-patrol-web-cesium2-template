<template>
  <div class="mod-project__patrolhangar">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <!-- <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item> -->
      <!-- <el-form-item>
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
      <el-table-column prop="code" label="编号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="type" label="型号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="memo" label="备注" header-align="center" align="center"></el-table-column>
      <el-table-column prop="startTime" label="开始使用日期" header-align="center" align="center"></el-table-column>
      <el-table-column prop="accessKey" label="匹配码" header-align="center" align="center"></el-table-column>
      <el-table-column prop="hangarId" label="机库id" header-align="center" align="center"></el-table-column>
      <el-table-column prop="boxSn" label="云盒编号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="autoSpeed" label="自动速度" header-align="center" align="center"></el-table-column>
      <el-table-column prop="homeHeight" label="航高" header-align="center" align="center"></el-table-column>
      <el-table-column prop="maxSpeed" label="最大速度" header-align="center" align="center"></el-table-column>
      <el-table-column prop="password" label="控制密码" header-align="center" align="center"></el-table-column>
      <!-- <el-table-column prop="creator" label="创建者" header-align="center" align="center"></el-table-column>
      <el-table-column prop="createDate" label="创建时间" header-align="center" align="center"></el-table-column>
      <el-table-column prop="updater" label="更新者" header-align="center" align="center"></el-table-column>
      <el-table-column prop="updateDate" label="更新时间" header-align="center" align="center"></el-table-column> -->
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
import AddOrUpdate from "./patrolhangar-add-or-update.vue";
export default defineComponent({
  components: {
    AddOrUpdate
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/patrolhangar/page",
      getDataListIsPage: true,
      exportURL: "/project/patrolhangar/export",
      deleteURL: "/project/patrolhangar",
      deleteIsBatch: true,
      dataForm: {}
    });
    return { ...useView(state), ...toRefs(state) };
  },
  watch: {}
});
</script>
