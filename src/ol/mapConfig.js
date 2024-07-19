// 天地图服务key
const getTDTServerkey = () => {
  let keys = [
    "886fbee4b8533dbfb239f5ec95b847a7", 
    "d9e26a854fb7764fa048698887153b82",
    "04e7587b338f869585a9b3158ca64306"
  ];
  return keys[Math.floor(Math.random() * 3)];
}

let mapConfig = {
  el: "map",
  mapOptions: {
    centerX: 118.889822,
    centerY: 28.939389,
    zoom: 13,
    minZoom: 4,
    maxZoom: 18,
    sr: {
      isEpsg: true,
      id: 4326,
      /* id为EPSG的标准id时，params可以不定义 */
      // params: "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=299960 +y_0=-2540 +ellps=GRS80 +units=m +no_defs"
    }
  },
  //layerType: ["XYZ", "WMTS"] // 天地图 vec_w -> cva_w    img_w -> cia_w
  baseLayers: [
    {
      url: "http://t{0-7}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk="+ getTDTServerkey(),
      id: "image",
      layerType: "XYZ",
      visible: true
    },
    {
      url: "http://t{0-7}.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk="+ getTDTServerkey(),
      id: "image-mark",
      layerType: "XYZ",
      visible: true
    },
  ],
  // 矢量服务图层
  featureLayers: [
    // {
    //   id: "geoserver",
    //   url: "https://wms.geo.admin.ch/",
    //   layer: "ch.swisstopo.pixelkarte-farbe-pk1000.noscale"
    // }
  ],
};

export default mapConfig;