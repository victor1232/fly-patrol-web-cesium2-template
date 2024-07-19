<template>
  <el-dialog v-model="visible" title="地图" :close-on-click-modal="false" :close-on-press-escape="false">
    <div v-if="visible" id="map"></div>
  </el-dialog>
</template>

<script lang="ts">
import mapConfig from "@/ol/mapConfig.js";
import MapClass from "@/ol/MapClass.js";
import { defineComponent, reactive } from "vue";
export default defineComponent({
  setup() {
    return reactive({
      mapInstance: null as any,
      visible: false
    });
  },
  methods: {
    init(row: any) {
      this.visible = true;
      this.$nextTick(() => {
        this.mapInstance = new MapClass(mapConfig);
        let geometry = this.mapInstance.wktToGeometry(row.geom);
        let type: any = geometry.getType();
        console.log(type);
        let typeMap: any = {
          Point: "marker",
          MultiPoint: "marker",
          Polygon: "polygon",
          MultiPolygon: "polygon",
          LineString: "line",
          MultiLineString: "line"
        };
        let style = this.mapInstance.getDefaultStyle(typeMap[type]);
        let feature = this.mapInstance.createFeature(geometry, style);
        this.mapInstance.zoomToGeometry(geometry, () => {
          this.mapInstance.addFeatureToLayer(this.mapInstance.drawLayer, feature);
        });
      });
    }
  }
});
</script>
<style lang="less" scoped>
#map {
  height: 520px;
}
</style>
