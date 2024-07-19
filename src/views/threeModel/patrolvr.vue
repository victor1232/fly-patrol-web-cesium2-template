<template>
  <div class="mod-project__patrolmodel">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <!-- <el-form-item>
        <el-input v-model="dataForm.name" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateHandle()">{{ $t("add") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" row-key="id" border style="width: 100%">
      <el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="parentName" label="上级" header-align="center" align="center"></el-table-column>
      <el-table-column prop="geom" label="坐标" header-align="center" align="center"></el-table-column>
      <el-table-column prop="vrUrl" label="链接地址" header-align="center" align="center"></el-table-column>

      <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
        <template v-slot="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{ $t("update") }}</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t("delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./patrolvr-add-or-update.vue";
export default defineComponent({
  components: {
    AddOrUpdate
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/patrolvr/listTree",
      exportURL: "/project/patrolvr/export",
      deleteURL: "/project/patrolvr",
      deleteIsBatch: true,
      dataForm: {
        name: ""
      }
    });
    return { ...useView(state), ...toRefs(state) };
  },
  watch: {}
});
</script>
