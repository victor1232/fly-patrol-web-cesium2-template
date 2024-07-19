<template>
  <div class="map-tools">
    <div class="tool-content">
      <div v-for="(item, index) in mapTools" :key="index" class="tool-item">
        <el-tag @click="activeTool(item)" :title="item.name" class="el-tag" :class="item.action == curActiveTool ? 'active' : ''">
          <img class="img" :src="item.icon" alt="" />
          <div class="title">{{ item.name }}</div>
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  props: {
    mapInstance: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  setup() {
    let rect = import.meta.globEager(`../../assets/map/矩形.png`)["../../assets/map/矩形.png"].default;
    let circle = import.meta.globEager(`../../assets/map/圆形.png`)["../../assets/map/圆形.png"].default;
    let polygon = import.meta.globEager(`../../assets/map/多边形.png`)["../../assets/map/多边形.png"].default;
    let clear = import.meta.globEager(`../../assets/map/清除.png`)["../../assets/map/清除.png"].default;
    return reactive({
      mapTools: [
        { action: "drawRect", name: "矩形", icon: rect },
        { action: "drawCircle", name: "圆形", icon: circle },
        { action: "drawPolygon", name: "多边形", icon: polygon },
        { action: "clear", name: "清除", icon: clear }
      ],
      curActiveTool: ""
    });
  },
  methods: {
    activeTool(item: { action: string }) {
      this.curActiveTool = item.action;
      this.mapInstance.clearDraw();
      if (item.action === "drawRect") {
        this.drawRect();
      }
      if (item.action === "drawCircle") {
        this.drawCircle();
      }
      if (item.action === "drawPolygon") {
        this.drawPolygon();
      }
      if (item.action === "clear") {
        this.clear();
      }
    },
    // 矩形
    drawRect() {
      this.mapInstance.startDraw("rectangle");
    },
    // 画圆
    drawCircle() {
      this.mapInstance.startDraw("Circle");
    },
    // 画面
    drawPolygon() {
      this.mapInstance.startDraw("Polygon");
    },
    // 清除
    clear() {
      this.mapInstance.clearDraw();
    }
  }
});
</script>
<style lang="less">
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
</style>
