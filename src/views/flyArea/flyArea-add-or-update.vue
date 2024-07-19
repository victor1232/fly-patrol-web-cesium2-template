<template>
  <el-dialog width="80%" v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-row class="fly-area-edit" :gutter="20">
      <el-col :span="12">
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
          <el-form-item prop="name" label="名称">
            <el-input v-model.trim="dataForm.name" placeholder="名称"></el-input>
          </el-form-item>
          <el-form-item prop="address" label="地址">
            <el-input v-model.trim="dataForm.address" placeholder="地址"></el-input>
          </el-form-item>
          <el-form-item prop="siteNumber" label="编号">
            <el-input v-model="dataForm.siteNumber" type="number" maxlength="9" placeholder="编号"></el-input>
          </el-form-item>
          <el-form-item prop="level" label="级别">
            <el-input v-model.trim="dataForm.level" placeholder="级别"></el-input>
          </el-form-item>
          <el-form-item prop="type" label="类型">
            <el-input v-model.trim="dataForm.type" placeholder="类型"></el-input>
          </el-form-item>
          <el-form-item prop="constion" label="责任单位">
            <el-input v-model.trim="dataForm.constion" placeholder="责任单位"></el-input>
          </el-form-item>
          <el-form-item prop="town" label="所属办事处">
            <el-input v-model.trim="dataForm.town" placeholder="所属办事处"></el-input>
          </el-form-item>
          <el-form-item prop="eppoint" label="国控点距离">
            <el-input v-model.trim="dataForm.eppoint" type="number" placeholder="国控点距离"></el-input>
          </el-form-item>
          <el-form-item prop="isFile" label="是否有文件">
            <el-select style="width: 100%" v-model="dataForm.isFile" placeholder="是否有文件" clearable>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="isMajor" label="是否为重点企业">
            <el-select style="width: 100%" v-model="dataForm.isMajor" placeholder="是否为重点企业" clearable>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <el-tabs v-model="activeTabName" type="border-card">
          <el-tab-pane :label="dataForm.id ? '修改区域' : '添加区域'" name="first">
            <div class="map-wrap" v-if="visible">
              <div id="map"></div>
              <map-tool v-if="mapInstance" :mapInstance="mapInstance"></map-tool>
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
import MapTool from "../components/map-tool.vue";
export default defineComponent({
  components: {
    MapTool
  },
  props: {
    taskAreaList: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  setup(props: any) {
    return reactive({
      mapInstance: null as any,
      visible: false,
      dataForm: {
        id: "",
        name: "",
        address: "",
        siteNumber: 0 as number,
        level: "",
        type: "",
        constion: "",
        town: "",
        eppoint: "",
        isFile: "",
        isMajor: "",
        geom: ""
      },
      activeTabName: "first",
      taskAreaList: props.taskAreaList
    });
  },
  computed: {
    dataRule() {
      return {
        name: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        address: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        siteNumber: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
      };
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.mapInstance = new MapClass(mapConfig);
          if (this.dataForm.id) {
            let geometry = this.mapInstance.wktToGeometry(this.dataForm.geom);
            let style = this.mapInstance.getDefaultStyle("polygon");
            let feature = this.mapInstance.createFeature(geometry, style);
            this.mapInstance.zoomToGeometry(geometry, () => {
              this.mapInstance.addFeatureToLayer(this.mapInstance.drawLayer, feature);
              this.mapInstance.startModify(this.mapInstance.drawLayer);
            });
          } else {
            // 获取所有任务区域
            baseService.get("/project/geoServer/patrolAllArea").then((res: any) => {
              if (res.features && res.features.length) {
                this.addArea(res);
              }
            });
          }
        });
      } else {
        if (this.mapInstance) this.mapInstance.destroyMap();
        this.mapInstance = null;
      }
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
  },
  methods: {
    init(row: any) {
      this.dataForm = row || {};
      this.visible = true;
    },
    // 表单提交
    dataFormSubmitHandle() {
      this.$refs["dataFormRef"].validate((valid: boolean) => {
        if (!valid) {
          return false;
        }
        let features = this.mapInstance.drawLayerSource.getFeatures();
        if (features.length) {
          this.dataForm.geom = this.mapInstance.geometryToWkt(features[0].getGeometry());
        }
        if (!this.dataForm.geom) {
          this.$message({
            type: "warning",
            message: "请设置区域"
          });
          return;
        }
        if (this.dataForm.siteNumber) {
          this.dataForm.siteNumber = Number(this.dataForm.siteNumber);
        }
        let url = "/project/area/areaSave"; //新增
        if (this.dataForm.id) {
          url = "/project/area/areaUpdate"; //修改
        }
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
    addArea(data: any) {
      let features = this.mapInstance.jsonToFeatures(data);
      let style = this.mapInstance.getPolygonStyle("rgba(12,92,202,0.2)", "rgb(12,92,202)", 1);
      let geometries: any = [];
      features.forEach((item: any) => {
        let properties = this.mapInstance.getAttributeByFeature(item);
        let polygon = this.mapInstance.getGeometryByFeature(item);
        let center = this.mapInstance.getGeometryCenter(polygon);
        this.mapInstance.setFeatureStyle(item, style);
        this.mapInstance.addHighLightFeature(item);
        // 标注
        let textStyle = this.mapInstance.getTextStyle(properties.name, "#fff", 12, "#ccc");
        let textFeature = this.mapInstance.createFeature(center, textStyle, properties);
        this.mapInstance.addHighLightFeature(textFeature);
        geometries.push(polygon);
      });
      this.mapInstance.zoomToGeometry(geometries);
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
}
</style>
