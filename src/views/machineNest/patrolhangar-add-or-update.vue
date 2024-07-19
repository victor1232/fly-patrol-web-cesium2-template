<template>
  <el-dialog v-model="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmitHandle()" label-width="120px">
      <!-- <el-form-item label="" prop="id">
        <el-input v-model="dataForm.id" placeholder=""></el-input>
      </el-form-item> -->
      <el-form-item label="编号" prop="code">
        <el-input v-model="dataForm.code" placeholder="编号"></el-input>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="型号" prop="type">
        <el-input v-model="dataForm.type" placeholder="型号"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="memo">
        <el-input v-model="dataForm.memo" placeholder="备注"></el-input>
      </el-form-item>
      <el-form-item label="开始使用日期" prop="startTime">
        <el-input v-model="dataForm.startTime" placeholder="开始使用日期"></el-input>
      </el-form-item>
      <el-form-item label="匹配码" prop="accessKey">
        <el-input v-model="dataForm.accessKey" placeholder="匹配码"></el-input>
      </el-form-item>
      <el-form-item label="机库id" prop="hangarId">
        <el-input v-model="dataForm.hangarId" placeholder="机库id"></el-input>
      </el-form-item>
      <el-form-item label="云盒编号" prop="boxSn">
        <el-select style="width: 100%" clearable v-model="dataForm.boxSn" placeholder="云盒编号">
          <el-option :label="item.boxSn" :value="item.boxSn" v-for="item in listHangar" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="自动速度" prop="autoSpeed" v-show="false">
        <el-input v-model="dataForm.autoSpeed" placeholder="自动速度"></el-input>
      </el-form-item>
      <el-form-item label="航高" prop="homeHeight">
        <el-input-number :min="0" :max="120" v-model="dataForm.homeHeight" />
      </el-form-item>
      <el-form-item label="最大速度" prop="maxSpeed">
        <!-- <el-input v-model="dataForm.maxSpeed" placeholder="云盒编号"></el-input> -->
        <el-input-number :min="0" :max="15" v-model="dataForm.maxSpeed" />
      </el-form-item>
      <el-form-item label="控制密码" prop="password">
        <el-input v-model="dataForm.password" placeholder="控制密码"></el-input>
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
      listHangar: [] as any[],
      visible: false,
      dataForm: {
        id: "",
        code: "",
        name: "",
        type: "",
        memo: "",
        startTime: "",
        accessKey: "",
        hangarId: "",
        boxSn: "",
        autoSpeed: "",
        homeHeight: "120",
        maxSpeed: "15",
        password: "",
        creator: "",
        createDate: "",
        updater: "",
        updateDate: ""
      }
    });
  },
  data() {
    return {
      // listHangar: [] as any[]
    };
  },
  computed: {
    dataRule() {
      return {
        hangarId: [{ required: true, message: "请输入机库ID", trigger: "blur" }],
        password: [{ required: true, message: "请输入控制密码", trigger: "blur" }]
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
      baseService.get("project/patrolhangarsite/listbox").then((res: any) => {
        // this.listHangar = res.data;
        // var emo:any =  res.data
        this.listHangar = res.data;
      });
    },
    // 获取信息
    getInfo() {
      baseService.get("/project/patrolhangar/id?id=" + this.dataForm.id).then((res) => {
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
          baseService.post("/project/patrolhangar/save", this.dataForm).then((res) => {
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
          baseService.post("/project/patrolhangar/update", this.dataForm).then((res) => {
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
