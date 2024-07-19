<template>
  <el-dialog width="80%" v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-row class="fly-area-edit" :gutter="20">
      <el-col :span="12">
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
          <el-form-item prop="patrolPlanName" label="任务名称">
            <el-input v-model.trim="dataForm.patrolPlanName" placeholder="任务名称"></el-input>
          </el-form-item>
          <el-form-item prop="area" label="任务区域">
            <el-select style="width: 100%" v-model="dataForm.area" multiple placeholder="任务区域" clearable @change="selectArea">
              <el-option v-for="item in taskAreaList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="patrolPlanArea" label="所属行政区">
            <el-select style="width: 100%" v-model="dataForm.patrolPlanArea" placeholder="所属行政区" clearable>
              <el-option v-for="(item, index) in districtList" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="patrolPlanResponsible" label="任务责任人">
            <el-input v-model.trim="dataForm.patrolPlanResponsible" placeholder="任务责任人"></el-input>
          </el-form-item>
          <el-form-item prop="uav" label="无人机">
            <el-select style="width: 100%" v-model="dataForm.uav" placeholder="无人机" clearable>
              <el-option v-for="item in droneList" :key="item.id" :label="item.uavName" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="patrolStartTime" label="计划开始时间">
            <el-date-picker style="width: 100%" v-model="dataForm.patrolStartTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择时间"> </el-date-picker>
          </el-form-item>
          <el-form-item prop="patrolEndTime" label="计划结束时间">
            <el-date-picker style="width: 100%" v-model="dataForm.patrolEndTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择时间"> </el-date-picker>
          </el-form-item>
          <el-form-item prop="patrolPlanInfo" label="信息描述">
            <el-input v-model.trim="dataForm.patrolPlanInfo" placeholder="信息描述"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <el-tabs v-model="activeTabName" type="border-card">
          <el-tab-pane :label="dataForm.id ? '修改区域' : '添加区域'" name="first">
            <div class="map-wrap" v-if="visible">
              <div id="map"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="区域列表" name="second">
            <div class="table-wrap" v-if="visible">
              <area-table ref="AreaTable" @selectAreaTable="selectAreaTable"></area-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <template v-slot:footer>
      <el-button @click="visible = false">{{ $t("cancel") }}</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t("confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import mapConfig from "@/ol/mapConfig.js";
import MapClass from "@/ol/MapClass.js";
import { defineComponent, reactive } from "vue";
import baseService from "@/service/baseService";
import { useDebounce } from "@/utils/utils";
import AreaTable from "./area-table.vue";
export default defineComponent({
  components: {
    AreaTable
  },
  props: {
    droneList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  setup(props: any) {
    return reactive({
      mapInstance: null as any,
      visible: false,
      areaFirstValid: true,
      uavFirstValid: true,
      dataForm: {
        id: "",
        patrolPlanName: "", //任务名称
        area: [] as any, //任务区域id
        patrolPlanArea: "", //所属行政区
        patrolPlanResponsible: "", //任务责任人
        uav: "" as any, //无人机id
        patrolStartTime: "", //计划开始时间
        patrolEndTime: "", //计划结束时间
        patrolPlanInfo: "" //任务描述信息
      },
      activeTabName: "first",
      taskAreaList: [] as Array<any>, //区域下拉值
      allFeatures: [], //存储所有区域
      districtList: [],
      droneList: props.droneList,
      editInitArea: [] as Array<any> //存储编辑时默认选中的区域
    });
  },
  computed: {
    dataRule() {
      const areaValid = (rule: any, value: any, callback: any) => {
        if (this.areaFirstValid) {
          this.areaFirstValid = false;
          return;
        }
        if (value.length === 0) {
          callback(new Error("必填项不能为空"));
        } else {
          callback();
        }
      };
      const uavValid = (rule: any, value: any, callback: any) => {
        if (this.uavFirstValid) {
          this.uavFirstValid = false;
          return;
        }
        if (value.length === 0) {
          callback(new Error("必填项不能为空"));
        } else {
          callback();
        }
      };
      return {
        patrolPlanName: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        patrolPlanArea: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        area: [{ required: true, validator: areaValid }],
        // uav: [{required: true, validator: uavValid }],
        uav: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        patrolStartTime: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        patrolEndTime: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        patrolPlanInfo: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
      };
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
    this.getDistrict();
  },
  watch: {
    dataForm: {
      handler(value) {
        if (value.area) {
          // 设置默认选中区域
          this.$refs.AreaTable.setDefaultSelection(value.area);
        }
      },
      deep: true
    }
  },
  methods: {
    init(row: any) {
      if (this.mapInstance) this.mapInstance.destroyMap();
      this.mapInstance = null;
      this.activeTabName = "first";
      this.visible = true;
      this.areaFirstValid = true;
      this.$nextTick(async () => {
        if (row) {
          this.dataForm = row;
        } else {
          this.$refs["dataFormRef"].clearValidate();
          this.dataForm = {
            id: "",
            patrolPlanName: "", //任务名称
            area: [], //任务区域id
            patrolPlanArea: "", //所属行政区
            patrolPlanResponsible: "", //任务责任人
            uav: "", //无人机id
            patrolStartTime: "", //计划开始时间
            patrolEndTime: "", //计划结束时间
            patrolPlanInfo: "" //任务描述信息
          };
        }

        if (row && row.id) {
          // 编辑获取任务详情
          let res = await baseService.post("/project/uav/plan/planInfo", { id: row.id });
          if (res.data.area && res.data.area.length) {
            res.data.area = res.data.area.map((item: any) => Number(item));
          }
          this.dataForm = res.data;
          if (res.data.uav) this.dataForm.uav = res.data.uav[0] || "";
        }
        // 设置默认选中区域
        this.$refs.AreaTable.setDefaultSelection(this.dataForm.area);
        this.mapInstance = new MapClass(mapConfig);
        // 获取所有任务区域
        baseService.get("/project/geoServer/patrolAllArea").then((res: any) => {
          if (res.features && res.features.length) {
            this.taskAreaList = res.features.map((v: any) => {
              return v.properties;
            });
            this.allFeatures = this.addArea(res);
            // 开启地图选择
            this.mapInstance.featureOnSelect((feature: any) => {
              let properties = feature.getProperties();
              let id = properties.id;
              const selIndex = this.dataForm.area.indexOf(id);
              if (selIndex < 0) {
                this.dataForm.area.push(id);
                feature.setStyle(this.mapInstance.getPolygonStyle("rgba(255,255,255,0.25)", "#3399CC", 2));
              } else {
                this.dataForm.area.splice(selIndex, 1);
                feature.setStyle(this.mapInstance.getPolygonStyle("rgba(12,92,202,0.2)", "rgb(12,92,202)", 1));
              }
            });
          }
        });
      });
    },
    // 表单提交
    dataFormSubmitHandle() {
      this.$refs["dataFormRef"].validate((valid: boolean) => {
        if (!valid) {
          return false;
        }

        let url = "/project/uav/plan/planSave"; //新增
        if (this.dataForm.id) {
          url = "/project/uav/plan/planUpdate"; //修改
        }
        this.dataForm.uav = [this.dataForm.uav];
        this.dataForm.area = this.dataForm.area.map((v: any) => Number(v));
        baseService.post(url, this.dataForm).then((res) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg);
          }
          this.$message({
            message: this.$t("prompt.success"),
            type: "success",
            duration: 500,
            onClose: () => {
              this.visible = false;
              this.$emit("refreshDataList");
            }
          });
        });
      });
    },
    // 选择区域
    selectArea(area: any, isTable: boolean) {
      this.allFeatures.forEach((feature: any) => {
        let properties = feature.getProperties();
        // 地图对应高亮显示
        if (area.includes(properties.id)) {
          feature.setStyle(this.mapInstance.getPolygonStyle("rgba(255,255,255,0.25)", "#3399CC", 2));
        } else {
          feature.setStyle(this.mapInstance.getPolygonStyle("rgba(12,92,202,0.2)", "rgb(12,92,202)", 1));
        }
      });
    },
    // 获取行政区
    getDistrict() {
      baseService.get("/project/uav/plan/countySelectList").then((res) => {
        this.districtList = res.data;
      });
    },
    addArea(data: any) {
      let features = this.mapInstance.jsonToFeatures(data);
      let style = this.mapInstance.getPolygonStyle("rgba(12,92,202,0.2)", "rgb(12,92,202)", 1);
      let highStyle = this.mapInstance.getPolygonStyle("rgba(255,255,255,0.25)", "#3399CC", 2);
      let geometries: any = [];
      features.forEach((item: any) => {
        let properties = this.mapInstance.getAttributeByFeature(item);
        let polygon = this.mapInstance.getGeometryByFeature(item);
        let center = this.mapInstance.getGeometryCenter(polygon);
        if (this.dataForm.area.includes(properties.id)) {
          this.mapInstance.setFeatureStyle(item, highStyle);
        } else {
          this.mapInstance.setFeatureStyle(item, style);
        }
        this.mapInstance.addHighLightFeature(item);
        // 标注
        let textStyle = this.mapInstance.getTextStyle(properties.name, "#fff", 12, "#ccc");
        let textFeature = this.mapInstance.createFeature(center, textStyle, properties);
        this.mapInstance.addHighLightFeature(textFeature);
        geometries.push(polygon);
      });
      this.mapInstance.zoomToGeometry(geometries);
      this.mapInstance.addHighLightFeature(features);
      return features;
    },
    // 表格区域选择
    selectAreaTable(id: any, isAdd: boolean) {
      if (isAdd) {
        // 添加
        if (!this.dataForm.area.includes(Number(id))) {
          this.dataForm.area.push(Number(id));
        }
      } else {
        // 删除
        for (var i = 0; i < this.dataForm.area.length; i++) {
          if (this.dataForm.area[i] == Number(id)) {
            this.dataForm.area.splice(i, 1);
            break;
          }
        }
      }

      this.selectArea(this.dataForm.area, true);
    }
  }
});
</script>
<style lang="less" scoped>
.fly-area-edit {
  /deep/ .el-tabs {
    height: 100%;
  }
  /deep/ .el-tabs__content {
    height: calc(100% - 40px);
  }
  /deep/ .el-tab-pane {
    height: 100%;
  }
  .map-wrap {
    height: 100%;
    position: relative;
    #map {
      height: 100%;
    }
  }
  .map-tools {
    width: 38px;
    position: absolute;
    top: 50%;
    right: 5px;
    transform: translate(0, -50%);
    z-index: 2;
    cursor: pointer;
    border-radius: 3px;
    background-color: #fff;

    .tool-btn {
      margin-bottom: 5px;
    }

    .tool-content {
      width: 100%;

      .tool-item {
        box-shadow: 5px 2px 4px 0px rgba(244, 244, 244, 0.15);
        width: 100%;
        border-radius: 3px;
      }

      .el-tag {
        border: none;
        background: transparent;
        display: inline-block;
        height: 44px;
        line-height: 1;
        width: 100%;
        padding: 3px 2px;
        text-align: center;
        box-sizing: border-box;

        .img {
          width: 24px;
        }

        .title {
          color: #333;
          font-size: 12px;
          user-select: none;
        }
      }

      .active {
        background-color: #ddd;
      }
    }
  }
}
</style>
