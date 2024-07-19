<template>
  <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <!-- <el-form-item label="" prop="id">
        <el-input v-model="dataForm.id" placeholder=""></el-input>
      </el-form-item> -->
      <el-form-item label="盒子编号" prop="boxSn">
        <el-input v-model="dataForm.boxSn" placeholder="盒子编号"></el-input>
      </el-form-item>
      <el-form-item label="盒子名称" prop="boxName">
        <el-input v-model="dataForm.boxName" placeholder="盒子名称"></el-input>
      </el-form-item>
      <el-form-item label="版本号" prop="boxVersion">
        <el-input v-model="dataForm.boxVersion" placeholder="版本号"></el-input>
      </el-form-item>
      <el-form-item label="启动时间" prop="startTime">
        <el-input v-model="dataForm.startTime" placeholder="启动时间"></el-input>
      </el-form-item>
      <el-form-item label="云盒在线状态" prop="onLine">
        <!-- <el-input v-model="dataForm.onLine" placeholder="云盒在线状态：0离线，1在线"></el-input> -->
        <el-select style="width: 100%" v-model="dataForm.onLine" placeholder="云盒在线状态">
          <el-option label="离线" :value="0"></el-option>
          <el-option label="在线" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否已修改推流地址" prop="status">
        <el-select style="width: 100%" v-model="dataForm.status" placeholder="是否已修改推流地址">
          <el-option label="是" :value="0"></el-option>
          <el-option label="否" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否正在推流" prop="liveStatus">
        <el-select style="width: 100%" v-model="dataForm.liveStatus" placeholder="是否正在推流">
          <el-option label="是" :value="0"></el-option>
          <el-option label="否" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="推流地址" prop="liveUrl">
        <el-input v-model="dataForm.liveUrl" placeholder="推流地址"></el-input>
      </el-form-item>
      <el-form-item label="播放地址" prop="playUrl">
        <el-input v-model="dataForm.playUrl" placeholder="播放地址"></el-input>
      </el-form-item>
      <el-form-item label="自动速度" prop="autoSpeed" v-show="false">
        <el-input v-model="dataForm.autoSpeed" placeholder="自动速度"></el-input>
      </el-form-item>
      <el-form-item label="航高" prop="homeHeight">
        <el-input-number :min="0" :max="120" v-model="dataForm.homeHeight" />
      </el-form-item>
      <el-form-item label="最大速度" prop="maxSpeed">
        <el-input-number :min="0" :max="15" v-model="dataForm.maxSpeed" />
      </el-form-item>
      <el-form-item label="云盒控制权密码" prop="password">
        <el-input v-model="dataForm.password" placeholder="云盒控制权密码"></el-input>
      </el-form-item>
      <el-form-item label="坐标" prop="geom" v-show="false">
        <el-input v-model="dataForm.geom" placeholder="坐标"></el-input>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <el-button @click="visible = false">{{ $t("cancel") }}</el-button>
      <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t("confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import baseService from "@/service/baseService";
import { useDebounce } from "@/utils/utils";
export default defineComponent({
  setup() {
    return reactive({
      visible: false,
      dataForm: {
        id: "",
        boxSn: "",
        boxName: "",
        boxVersion: "",
        startTime: "",
        onLine: 0,
        videoServer: "",
        videoPort: "",
        geom: "POINT(118.883742 28.935852)",
        lastTaskId: "",
        status: 1,
        liveStatus: 1,
        liveUrl: "",
        playUrl: "",
        autoSpeed: "",
        homeHeight: "120",
        maxSpeed: "15",
        password: ""
      }
    });
  },
  computed: {
    dataRule() {
      return {
        boxSn: [{ required: true, message: "请输入盒子编号", trigger: "blur" }],
        password: [{ required: true, message: "请输入控制密码", trigger: "blur" }]
      };
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
  },
  methods: {
    init() {
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataFormRef"].resetFields();
        if (this.dataForm.id) {
          this.getInfo();
        }
      });
    },
    // 获取信息
    getInfo() {
      baseService.get("/project/patrolbox/id?id=" + this.dataForm.id).then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.dataForm = res.data;
      });
    },
    // 表单提交
    dataFormSubmitHandle() {
      this.dataForm.autoSpeed = this.dataForm.maxSpeed;
      this.$refs["dataFormRef"].validate((valid: boolean) => {
        if (!valid) {
          return false;
        }
        if (!this.dataForm.id) {
          baseService.post("/project/patrolbox/save", this.dataForm).then((res) => {
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
        } else {
          baseService.post("/project/patrolbox/update", this.dataForm).then((res) => {
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
        }
      });
    }
  }
});
</script>
