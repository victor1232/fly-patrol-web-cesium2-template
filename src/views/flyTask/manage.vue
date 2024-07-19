<template>
  <div class="mod-demo__news">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.patrolPlanName" placeholder="任务名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.patrolPlanNo" placeholder="任务编号" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.patrolStatus" placeholder="任务状态" clearable>
          <el-option v-for="(item, index) in taskTypeList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.patrolPlanInfo" placeholder="任务描述信息" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">{{ $t("query") }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateItem()">{{ $t("add") }}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" @sort-change="dataListSortChangeHandle" style="width: 100%">
      <el-table-column prop="patrolPlanNo" label="编号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolPlanName" label="名称" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolStatus" label="状态" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ getTaskState(scope.row.patrolStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="patrolPlanArea" label="任务区域" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolPlanResponsible" label="责任人" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uav" label="无人机" header-align="center" align="center"></el-table-column>
      <el-table-column prop="uavSerialNumber" label="无人机编号" header-align="center" align="center"></el-table-column>
      <el-table-column prop="mileage" label="飞行距离(km)" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolStartTime" label="计划开始时间" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolEndTime" label="计划结束时间" header-align="center" align="center"></el-table-column>
      <el-table-column prop="startTime" label="实际开始时间" header-align="center" align="center"></el-table-column>
      <el-table-column prop="endTime" label="实际结束时间" header-align="center" align="center"></el-table-column>
      <el-table-column prop="isReport" label="是否有报告" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.isReport === 1 ? "有报告" : scope.row.isReport === 0 ? "无报告" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="isVideo" label="是否有视频" header-align="center" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.isVideo === 1 ? "有视频" : scope.row.isVideo === 0 ? "无视频" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="outputUrl" label="视频播放地址" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolPlanInfo" label="描述信息" header-align="center" align="center"></el-table-column>
      <el-table-column prop="patrolPlanError" label="异常信息" header-align="center" align="center"></el-table-column>
      <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
        <template v-slot="scope">
          <el-button v-if="scope.row.patrolStatus === 1 || scope.row.patrolStatus === 4" type="text" size="small" @click="stopTask(scope.row)">结束任务</el-button>
          <el-button v-if="scope.row.patrolStatus === 0" type="text" size="small" @click="setTaskAbnormal(scope.row)">异常任务</el-button>
          <el-button v-if="scope.row.patrolStatus === 0" type="text" size="small" @click="addOrUpdateItem(scope.row)">{{ $t("update") }}</el-button>
          <el-button type="text" size="small" @click="deleteRowItem(scope.row.id)">{{ $t("delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="pageSizeChangeHandle" @current-change="pageCurrentChangeHandle"> </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" :droneList="droneList" @refreshDataList="getDataList"></add-or-update>
    <abnormal-task v-if="abnormalVisible" v-model="abnormalVisible" :abnormalTaskId="abnormalTaskId" @refreshDataList="getDataList"></abnormal-task>
  </div>
</template>

<script lang="ts">
import useView from "@/hooks/useView";
import baseService from "@/service/baseService";
import { defineComponent, reactive, toRefs } from "vue";
import AddOrUpdate from "./flyTask-add-or-update.vue";
import AbnormalTask from "./abnormal-task.vue";
export default defineComponent({
  components: {
    AddOrUpdate,
    AbnormalTask
  },
  setup() {
    const state = reactive({
      getDataListURL: "/project/uav/plan/planPage",
      getDataListIsPage: true,
      deleteURL: "/project/uav/plan/planDelete",
      dataForm: {
        patrolPlanName: "", //任务名称
        patrolPlanNo: "", //任务编号
        patrolStatus: "", //任务状态
        patrolPlanInfo: "" //任务描述信息
      },
      taskTypeList: [
        //任务状态类型
        { label: "未开始", value: 0 },
        { label: "进行中", value: 1 },
        { label: "任务结束", value: 2 },
        { label: "异常任务", value: 3 },
        { label: "暂停任务", value: 4 },
        { label: "准备中", value: 5 }
      ],
      droneList: [] as Array<any>, //无人机列表
      abnormalVisible: false, // 是否显示异常信息弹窗
      abnormalTaskId: "" //异常任务id
    });
    // 获取任务区域
    const getDroneList = () => {
      baseService
        .get("/project/uav/plan/uavPage", {
          page: 1,
          limit: 9999
        })
        .then((res) => {
          state.droneList = res.data.list;
        });
    };
    getDroneList();
    //任务状态
    const getTaskState = (type: number) => {
      let typeInfo = state.taskTypeList.find((item) => item.value === type);
      if (typeInfo) return typeInfo.label;
      return "";
    };
    //设置任务状态
    const setTaskAbnormal = (row: any) => {
      state.abnormalTaskId = row.id;
      state.abnormalVisible = true;
    };

    return {
      ...useView(state),
      ...toRefs(state),
      getTaskState,
      setTaskAbnormal
    };
  },
  methods: {
    //手动结束任务
    stopTask(row: any) {
      let taskId = row.id;
      this.$confirm("确定结束当前任务？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          baseService
            .post("/project/uav/plan/stopFlyPlan", {
              id: taskId
            })
            .then((res) => {
              console.log(res);
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 500,
                onClose: () => {
                  this.getDataList();
                }
              });
            });
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }
});
</script>
