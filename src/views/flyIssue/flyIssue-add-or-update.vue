<template>
  <el-dialog v-model="visible" width="80%" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-row class="fly-issue-edit" :gutter="20">
      <el-col :span="12">
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
          <el-form-item prop="questionName" label="问题名称">
            <el-input v-model.trim="dataForm.questionName" placeholder="问题名称"></el-input>
          </el-form-item>
          <el-form-item prop="questionAddress" label="问题地址">
            <el-input v-model.trim="dataForm.questionAddress" placeholder="问题地址"></el-input>
          </el-form-item>
          <el-form-item prop="questionStatus" label="问题状态">
            <el-select style="width: 100%" v-model="dataForm.questionStatus" placeholder="问题状态" clearable>
              <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="questionInfo" label="问题描述">
            <el-input v-model.trim="dataForm.questionInfo" placeholder="问题描述"></el-input>
          </el-form-item>
          <el-form-item prop="questionSerialNo" label="问题序号">
            <el-input v-model.trim="dataForm.questionSerialNo" placeholder="问题序号"></el-input>
          </el-form-item>
          <el-form-item prop="questionNo" label="问题编号">
            <el-input v-model.trim="dataForm.questionNo" placeholder="问题编号"></el-input>
          </el-form-item>
          <el-form-item prop="processingUnit" label="责任单位">
            <el-input v-model.trim="dataForm.processingUnit" placeholder="责任单位"></el-input>
          </el-form-item>
          <el-form-item prop="questionDate" label="发现时间">
            <el-date-picker style="width: 100%" v-model="dataForm.questionDate" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择时间"> </el-date-picker>
          </el-form-item>
          <el-form-item prop="patrolPlanName" label="任务名称">
            <el-input v-model.trim="dataForm.patrolPlanName" placeholder="任务名称"></el-input>
          </el-form-item>
          <el-form-item prop="areaName" label="区域名称">
            <el-input v-model.trim="dataForm.areaName" placeholder="区域名称"></el-input>
          </el-form-item>
          <el-form-item prop="uavName" label="无人机名称">
            <el-input v-model.trim="dataForm.uavName" placeholder="无人机名称"></el-input>
          </el-form-item>
          <el-form-item prop="questionRemark" label="问题备注">
            <el-input v-model.trim="dataForm.questionRemark" :rows="2" type="textarea" placeholder="问题备注" />
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <el-tabs v-model="activeTabName" type="border-card">
          <el-tab-pane :label="dataForm.id ? '修改问题' : '添加问题'" name="first">
            <div class="map-wrap" v-if="visible">
              <div id="map"></div>
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
export default defineComponent({
  props: {
    issueStatusList: {
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
      dataForm: {
        id: "",
        questionName: "",
        questionAddress: "",
        questionStatus: "",
        questionInfo: "",
        questionSerialNo: "",
        questionNo: "",
        processingUnit: "",
        questionDate: "",
        patrolPlanName: "",
        areaName: "",
        uavName: "",
        questionRemark: "",
        geom: ""
      },
      activeTabName: "first",
      issueStatusList: props.issueStatusList
    });
  },
  computed: {
    dataRule() {
      return {
        questionName: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        questionAddress: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }],
        questionStatus: [{ required: true, message: this.$t("validate.required"), trigger: "blur" }]
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
            let style = this.mapInstance.getDefaultStyle("marker");
            let feature = this.mapInstance.createFeature(geometry, style);
            this.mapInstance.zoomToGeometry(geometry, () => {
              this.mapInstance.addFeatureToLayer(this.mapInstance.drawLayer, feature);
              this.mapInstance.startModify(this.mapInstance.drawLayer);
            });
          }
        });
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
            message: "请设置问题点"
          });
          return;
        }
        let url = "/project/plan/question/questionUpdate"; //修改
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
    }
  }
});
</script>
<style lang="less" scoped>
.fly-issue-edit {
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
