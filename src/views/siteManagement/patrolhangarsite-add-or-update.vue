<template>
  <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <!-- <el-form-item label="" prop="id">
        <el-input v-model="dataForm.id" placeholder=""></el-input>
      </el-form-item> -->
      <el-form-item label="名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="匹配码" prop="accessKey">
        <el-input v-model="dataForm.accessKey" placeholder="匹配码"></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="addr">
        <el-input v-model="dataForm.addr" placeholder="地址"></el-input>
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="dataForm.code" placeholder="编码"></el-input>
      </el-form-item>
      <el-form-item label=" 遥控半径（M）" prop="controlRadius">
        <el-input v-model="dataForm.controlRadius" placeholder=" 遥控半径（M）"></el-input>
      </el-form-item>
      <el-form-item label="站点id" prop="siteId">
        <el-input v-model="dataForm.siteId" placeholder="站点id"></el-input>
      </el-form-item>
      <el-form-item label="机库id" prop="hangarId">
        <!-- <el-input v-model="dataForm.hangarId" placeholder="机库 ID"></el-input> -->
        <el-select style="width: 100%" clearable v-model="dataForm.hangarId" placeholder="机库id选择">
          <el-option :label="item.hangarId" :value="item.hangarId" v-for="item in listHangar" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="经度" prop="lon">
        <el-input v-model="dataForm.lon" placeholder="经度"></el-input>
      </el-form-item>
      <el-form-item label="纬度" prop="lat">
        <el-input v-model="dataForm.lat" placeholder="纬度"></el-input>
      </el-form-item>
      <el-form-item label="AI直播URL" prop="liveAiUrl">
        <el-input v-model="dataForm.liveAiUrl" placeholder="AI直播URL"></el-input>
      </el-form-item>
      <el-form-item label="机库直播 URL" prop="liveHangarUrl">
        <el-input v-model="dataForm.liveHangarUrl" placeholder="机库直播 URL"></el-input>
      </el-form-item>
      <el-form-item label="无人机直播 URL" prop="liveUavUrl">
        <el-input v-model="dataForm.liveUavUrl" placeholder="无人机直播 URL"></el-input>
      </el-form-item>
      <!-- <el-form-item label="无人机 ID" prop="uavId">
        <el-input v-model="dataForm.uavId" placeholder="无人机 ID"></el-input>
      </el-form-item> -->
      <!-- <el-form-item label="创建者" prop="creator">
        <el-input v-model="dataForm.creator" placeholder="创建者"></el-input>
      </el-form-item>
      <el-form-item label="创建时间" prop="createDate">
        <el-input v-model="dataForm.createDate" placeholder="创建时间"></el-input>
      </el-form-item> -->
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
      listHangar: [] as any[],
      visible: false,
      dataForm: {
        id: "",
        accessKey: "",
        addr: "",
        code: "",
        controlRadius: "",
        hangarId: "",
        siteId: "",
        lat: "",
        liveAiUrl: "",
        liveHangarUrl: "",
        liveUavUrl: "",
        lon: "",
        name: "",
        uavId: "",
        creator: "",
        createDate: ""
      }
    });
  },
  data() {
    return {
      // listHangar: []
    };
  },
  computed: {
    dataRule() {
      return {
        siteId: [{ required: true, message: "请输入站点id", trigger: "blur" }]
      };
    }
  },
  created() {
    this.dataFormSubmitHandle = useDebounce(this.dataFormSubmitHandle);
    this.gethangarId();
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
    gethangarId() {
      baseService.get("project/patrolhangarsite/listHangar").then((res: any) => {
        this.listHangar = res.data;
      });
    },
    // 获取信息
    getInfo() {
      baseService.get("/project/patrolhangarsite/" + this.dataForm.id).then((res) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.dataForm = res.data;
      });
    },
    // 表单提交
    dataFormSubmitHandle() {
      this.$refs["dataFormRef"].validate((valid: boolean) => {
        if (!valid) {
          return false;
        }
        (!this.dataForm.id ? baseService.post : baseService.put)("/project/patrolhangarsite", this.dataForm).then((res) => {
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
