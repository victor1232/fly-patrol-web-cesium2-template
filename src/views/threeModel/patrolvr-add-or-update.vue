<template>
  <el-dialog v-model="visible" width="80%" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" class="formStyle" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <!-- <el-form-item label="坐标" prop="geom">
            <el-input class="geomStyle" v-model="dataForm.geom" placeholder="坐标"></el-input>
            <el-button class="btn-blue" @click="drawIssuePoint">点选</el-button>
          </el-form-item> -->
      <el-form-item prop="parentName" label="上级" class="model-list">
        <el-popover v-model:visible="modelListVisible" :width="400" ref="modelListPopover" placement="bottom-start" trigger="click">
          <template v-slot:reference>
            <el-input v-model="dataForm.parentName" :readonly="true">
              <template v-slot:suffix> <i v-if="dataForm.pid !== '0'" @click.stop="deptListTreeSetDefaultHandle()" class="el-icon-circle-close el-input__icon"></i></template></el-input
          ></template>
          <el-tree :data="modelList" :props="{ label: 'name', children: 'children' }" node-key="id" ref="modelListTree" :highlight-current="true" :expand-on-click-node="false" accordion @current-change="deptListTreeCurrentChangeHandle"> </el-tree>
        </el-popover>
      </el-form-item>

      <el-form-item label="链接地址" prop="vrUrl">
        <el-input v-model="dataForm.vrUrl" placeholder="链接地址"></el-input>
      </el-form-item>
      <el-form-item label="地图点选">
        <div class="map-wrap">
          <div id="map"></div>
        </div>
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <el-button @click="qingchu">清除/添加坐标</el-button>
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
export default defineComponent({
  setup() {
    return reactive({
      mapInstance: null as any,
      visible: false,
      dataForm: {
        id: "",
        name: "",
        geom: "",
        vrUrl: "",
        pid: "0",
        parentName: "无"
      },
      modelList: [],
      modelListVisible: false,
      activeTabName: "first"
    });
  },
  computed: {
    dataRule() {
      return {
        name: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
      };
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
  },
  methods: {
    qingchu() {
      this.dataForm.geom = "";
      this.mapInstance.clearDraw();
      this.mapInstance.startDraw("Point", (geometry: any, feature: any) => {
        feature.setStyle(this.mapInstance.getDefaultStyle("marker"));
        this.mapInstance.startModify(this.mapInstance.drawLayer);
        this.dataForm.geom = this.mapInstance.geometryToWkt(geometry);
      });
    },
    init() {
      if (this.mapInstance) this.mapInstance.destroyMap();
      this.mapInstance = null;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataFormRef"].resetFields();
        this.dataForm.geom = "";
        this.mapInstance = new MapClass(mapConfig);
        if (this.dataForm.id) {
          this.getInfo();
        } else {
          this.mapInstance.clearDraw();
          this.mapInstance.startDraw("Point", (geometry: any, feature: any) => {
            feature.setStyle(this.mapInstance.getDefaultStyle("marker"));
            this.mapInstance.startModify(this.mapInstance.drawLayer);
            this.dataForm.geom = this.mapInstance.geometryToWkt(geometry);
          });
        }
      });
      this.getModelList();
    },
    // 获取模型列表
    getModelList() {
      baseService.get("/project/patrolvr/listTree").then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.modelList = res.data;
      });
    },
    // 上级菜单树, 设置默认值
    deptListTreeSetDefaultHandle() {
      this.dataForm.pid = "0";
      this.dataForm.parentName = "无";
    },
    // 上级模型树, 选中
    deptListTreeCurrentChangeHandle(data: any) {
      this.dataForm.pid = data.id;
      this.dataForm.parentName = data.name;
      this.modelListVisible = false;
    },
    // 获取信息
    getInfo() {
      baseService.get("/project/patrolvr/" + this.dataForm.id).then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.dataForm = res.data;
        if (this.dataForm.geom) {
          let geometry = this.mapInstance.wktToGeometry(this.dataForm.geom);
          let style = this.mapInstance.getDefaultStyle("marker");
          let feature = this.mapInstance.createFeature(geometry, style);
          this.mapInstance.zoomToGeometry(geometry, () => {
            this.mapInstance.addFeatureToLayer(this.mapInstance.drawLayer, feature);
            this.mapInstance.startModify(this.mapInstance.drawLayer);
          });
        }
      });
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
        // if (!this.dataForm.geom) {
        //   this.$message({
        //     type: "warning",
        //     message: "请地图点选位置"
        //   });
        //   return;
        // }
        let data = {
          id: this.dataForm.id || "",
          name: this.dataForm.name,
          geom: this.dataForm.geom,
          vrUrl: this.dataForm.vrUrl,
          pid: this.dataForm.pid
        };
        (!this.dataForm.id ? baseService.post : baseService.put)("/project/patrolvr", data).then((res) => {
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
    }
  }
});
</script>
<style lang="less" scoped>
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
  height: 400px;
  position: relative;
  #map {
    height: 100%;
  }
}
.btn-blue {
  width: 56px;
}
</style>
