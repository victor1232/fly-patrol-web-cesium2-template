import modules from "./modules";
import { io } from "jsts";
import WKT from "wkt";
import defaultMarker from "../assets/map/marker_blue.png";
class MapClass {
  constructor(options) {
    this.options = options;
    this.modules = modules;
    // jsts工具、缓冲区、拓扑计算
    this.jstsParser = new io.OL3Parser();
    this.jstsParser.inject(
      this.modules.Point,
      this.modules.LineString,
      this.modules.LinearRing,
      this.modules.Polygon,
      this.modules.MultiPoint,
      this.modules.MultiLineString,
      this.modules.MultiPolygon,
      this.modules.GeometryCollection
    );
    this.init();
  }
  async init() {
    // 创建地图
    this.viewProjection = this.setProjection(this.options.mapOptions.sr);
    this.map = new this.modules.Map({
      target: this.options.el,
      layers: [...this.initBaseLayers(this.options.baseLayers)],
      view: new this.modules.View({
        center: [this.options.mapOptions.centerX, this.options.mapOptions.centerY],
        zoom: this.options.mapOptions.zoom || 12,
        minZoom: this.options.mapOptions.minZoom || 4,
        maxZoom: this.options.mapOptions.maxZoom || 18,
        projection: this.viewProjection
      }),
      controls: this.modules.defaultControls({
        attribution: false,
        rotate: false,
        zoom: false
      })
    });
    // 添加比例尺
    this.map.addControl(new this.modules.ScaleLine());
    // 添加管网设施图层
    this.initFeatureLayer(this.options.featureLayers);
    // 绘制图层
    this.drawLayerSource = new this.modules.VectorSource({wrapX: false});
    this.drawLayer = new this.modules.VectorLayer({
      source: this.drawLayerSource
    });
    this.map.addLayer(this.drawLayer);
    // 高亮显示图层
    this.highLightLayerSource = new this.modules.VectorSource({wrapX: false});
    let highLightLayer = new this.modules.VectorLayer({
      source: this.highLightLayerSource
    });
    this.map.addLayer(highLightLayer);
    // 弹窗
    this.overlay = new this.modules.Overlay({
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    this.map.addOverlay(this.overlay);    
  }
  // 设置坐标系
  setProjection(sr) {
    let viewProjection;
    if(sr.isEpsg) {
      if(sr.id == 3857 || sr.id == 4326) {
        viewProjection = this.modules.getProjection('EPSG:' + sr.id);
      }
    }else {
      viewProjection = this.modules.getProjection('EPSG:3857');
    }
    return viewProjection;
  }
  // 地图加载完成
  mapLoaded() {
    return new Promise(resolve => {
      this.map.on("rendercomplete", evt => {
        resolve(true);
      });
    });
  }
  // 初始化底图
  initBaseLayers(layers) {
    if(!layers || !layers.length) return [];
    let baseLayers = [];
    layers.forEach(item => {
      switch (item.layerType) {
        case "XYZ":
          baseLayers.push(new this.modules.TileLayer({
            source: new this.modules.XYZSource({ 
              crossOrigin: "anonymous",
              url: item.url
            }),
            id: item.id,
            visible: Boolean(item.visible)
          }));
          break;
        case "WMTS":
          let resolutions = [], matrixIds = [];
          for (let z = item.level.min; z <= Number(item.level.max); ++z) {
            resolutions[z] = item.maxResolution / Math.pow(2, z);
            matrixIds[z] = z;
          }
          baseLayers.push(new this.modules.TileLayer({
            source: new this.modules.WMTSSource({
              crossOrigin: "anonymous", 
              url: item.url,
              format: "image/png",
              style: 'default',
              tileGrid: new this.modules.WMTSTileGrid({
                origin: this.viewProjection.getUnits() === "m" ? [-2.0037508342787E7, 2.0037508342787E7] : [-180, 90],
                resolutions: resolutions,
                matrixIds: matrixIds,
              })
            }),
            id: item.id,
            visible: Boolean(item.visible)
          }));
        default:
          break;
      }
    });
    return baseLayers;
  }
  // 添加管线图层
  initFeatureLayer(layers) {
    if(!layers.length) return;
    layers.forEach(item => {
      this.map.addLayer(new this.modules.TileLayer({
        preload: Infinity,
        id: item.id,
        source: new this.modules.TileWMS({
          crossOrigin: "anonymous",
          url: item.url,
          extent: this.viewProjection.getUnits() === "m" ? [-2.0037508342787E7, -2.0037508342787E7,2.0037508342787E7, 2.0037508342787E7] : [-180, -90, 180, 90],
          params: {
            LAYERS: item.layer,
            FORMAT: 'image/jpeg',
          }
        })
      }));
    });
  }
  // 添加管线图层
  addGeojsonLayer(url, id, style) {
    let geojsonLayer = new this.modules.VectorLayer({
      id,
      source: new this.modules.VectorSource({
        projection: this.viewProjection,
        url: url, //GeoJSON的文件路径
        format: new this.modules.formatGeoJSON()
      }),
      style
    });
    this.map.addLayer(geojsonLayer);
    return geojsonLayer;
  }
  /**
   * 设置图层显示隐藏
   * @param {String|Array} layerId 图层id
   * @param {Boolean} visible 是否显示
   */
  setLayerVisible(layerId, visible) {
    let isArray = Array.isArray(layerId);
    this.map.getLayers().forEach(item => {
      if(isArray) {
        if(layerId.includes(item.getProperties().id)) {
          item.setVisible(visible);
        }
      }else {
        if(layerId === item.getProperties().id) {
          item.setVisible(visible);
        }
      }
    });
  }
  /**
   * 绘制图形
   * @param {String} type 绘制类型 ["point","polyline","polygon","Circle","rectangle"]
   * @param {Function} callback 返回绘制geometry,graphic
   * @param {Boolean} isAgain 是否连续绘制
   */
  startDraw(type, callback, isAgain) {
    this.closeDraw(); //先关闭绘制
    this.drawTools = new this.modules.Draw({
      source: this.drawLayerSource,
      type: type === "rectangle" ? "Circle" : type, //绘制矩形需要type="Circle"
      geometryFunction: type === "rectangle" ? this.modules.createBox() : undefined, //绘制矩形函数
    });
    this.map.addInteraction(this.drawTools);
    this.drawTools.on("drawend", evt => {
      if(!isAgain) {
        // 防止触发双击放大事件
        setTimeout(() => this.map.removeInteraction(this.drawTools));
      }
      if(callback) callback(evt.feature.getGeometry(), evt.feature);
    });
  }
  // 关闭绘制工具
  closeDraw() {
    if(this.drawTools) this.map.removeInteraction(this.drawTools);
  }
  // 清除绘制数据
  clearDraw() {
    this.closeDraw();
    this.drawLayerSource.clear();
  }
  // 开启编辑
  startModify(layer) {
    this.modifyTool = new this.modules.Modify({
      source: layer.getSource()
    });
    this.map.addInteraction(this.modifyTool);
    this.snapTool = new this.modules.Snap({
      source: layer.getSource()
    });
    this.map.addInteraction(this.snapTool);
  }
  // 关闭编辑
  closeModify() {
    if(this.modifyTool) this.map.removeInteraction(this.modifyTool);
    if(this.snapTool) this.map.removeInteraction(this.snapTool);
  }
  // 测量长度
  measureLegth() {
    this.closeDraw();
    this.drawTools = new this.modules.Draw({
      source: this.drawLayerSource,
      type: "LineString",
    });
    this.map.addInteraction(this.drawTools);
    this.drawTools.on("drawend", evt => {
      // 防止触发双击放大事件
      setTimeout(() => this.map.removeInteraction(this.drawTools));
      let geometry = evt.feature.getGeometry();
      let length = this.modules.getLength(geometry);
      let endPoint = geometry.getLastCoordinate();
      let feature = new this.modules.Feature({
        geometry: new this.modules.Point(endPoint)
      });
      feature.setStyle(new this.modules.Style({
        text: new this.modules.Text({
          text: "长度: " + length.toFixed(3) + "m",
          fill: new this.modules.Fill({
            color: "#ff0000"
          }),
          scale: 2,
          offsetY: -10
        })
      }));
      this.drawLayerSource.addFeature(feature);
    });
  }
  // 测量面积
  measureArea() {
    this.closeDraw();
    this.drawTools = new this.modules.Draw({
      source: this.drawLayerSource,
      type: "Polygon",
    });
    this.map.addInteraction(this.drawTools);
    this.drawTools.on("drawend", evt => {
      // 防止触发双击放大事件
      setTimeout(() => this.map.removeInteraction(this.drawTools));
      let geometry = evt.feature.getGeometry();
      let area = this.modules.getArea(geometry);
      let center = this.modules.getExtentCenter(geometry.getExtent());
      let feature = new this.modules.Feature({
        geometry: new this.modules.Point(center)
      });
      feature.setStyle(new this.modules.Style({
        text: new this.modules.Text({
          text: "面积: " + area.toFixed(3) + "m²",
          fill: new this.modules.Fill({
            color: "#ff0000"
          }),
          scale: 2
        })
      }));
      this.drawLayerSource.addFeature(feature);
    });
  }
  // 地图放大
  zoomIn() {
    this.map.getView().setZoom(this.map.getView().getZoom() + 1);
  }
  // 地图缩小
  zoomOut() {
    this.map.getView().setZoom(this.map.getView().getZoom() - 1);
  }
  // 获取当前缩放级别
  getCurZoom() {
    return this.map.getView().getZoom();
  }
  // 获取当前视图范围
  getCurViewExtent() {
    return this.modules.fromExtent(this.map.getView().calculateExtent());
  }
  // 获取点的坐标值
  getPointCoords(point) {
    let coords = point.getCoordinates();
    return {
      x: coords[0],
      y: coords[1]
    };
  }
  // 获取线的坐标值
  getPolylineCoords(polyline) {
    return polyline.getCoordinates();
  }
  // 获取面的坐标值
  getPolygonCoords(polygon) {
    return polygon.getCoordinates();
  }
  // 获取图形的中心点
  getGeometryCenter(geometry) {
    let center;
    if(geometry.getType() === "Point") {
      return geometry;
    }else {
      center = this.modules.getExtentCenter(geometry.getExtent());
    }
    return this.createPoint(center[0], center[1]);
  }
  // 获取图形类型
  getGeometryType(geometry) {
    return geometry.getType();
  }
  /**
   * 坐标缩放定位
   * @param {Number} x x坐标值
   * @param {Number} y y坐标值
   * @param {Number} zoom 缩放级别（可选）
   */
  setCenterZoom(x, y, zoom) {
    this.map.getView().setCenter([x, y]);
    zoom && this.map.getView().setZoom(zoom);
  }
  /**
   * 坐标缩放定位（动画）
   * @param {Number} x x坐标值
   * @param {Number} y y坐标值
   * @param {Number} zoom 缩放级别
   */
  animateTo(x, y, zoom) {
    this.map.getView().animate({
      zoom,
      center: [x, y]
    });
  }
  /**
   * 要素定位
   * @param {Object<Geometry>||Array<Geometry>} geometry 单个或多个图形要素
   * @param {Function} callback 定位结束回调 （可选）
   */
  zoomToGeometry(geometry, callback) {
    if(Array.isArray(geometry)) {
      geometry = this.getUnionGeometry(geometry);
    }
    this.map.getView().fit(geometry, {
      size: this.map.getSize(),
      padding: [100, 100, 100, 100],
      duration: 500,
      callback
    });
  }
  /**
   * 点坐标转屏幕坐标
   * @param {Object<Geometry>} point 点要素
   * @returns {Object} {x: 123, y: 456}
   */
  pointToScreen(point) {
    return this.map.getPixelFromCoordinate(point.getCoordinates());
  }
  // 要素数据转geojson
  geometryToGeojson(geometry) {
    return new this.modules.formatGeoJSON().writeGeometryObject(geometry);
  }
  // geojson转要素数据
  geojsonToGeometry(geojson) {
    return new this.modules.formatGeoJSON().readGeometry(geojson);
  }
  // 要素数据转wkt
  geometryToWkt(geometry) {
    let geojson = new this.modules.formatGeoJSON().writeGeometryObject(geometry);
    return WKT.stringify(geojson);
  }
  // wkt转要素数据
  wktToGeometry(wkt) {
    let geojson = WKT.parse(wkt);
    return new this.modules.formatGeoJSON().readGeometry(geojson);
  }
  // 图形要素转json
  featureToJson(feature) {
    let geojson = new this.modules.formatGeoJSON().writeFeatureObject(feature);
    return JSON.stringify(geojson);
  }
  // json<Feature>转要素数据
  jsonToFeature(json) {
    return new this.modules.formatGeoJSON().readFeature(json);
  }
  // json<FeatureCollection> 转要素集合数据
  jsonToFeatures(json) {
    return new this.modules.formatGeoJSON().readFeatures(json);
  }
  /**
   * 创建点图形
   * @param {Number} x x坐标值
   * @param {Number} y y坐标值
   * @returns Object<Point> 点图形数据
   */
  createPoint(x, y) {
    return new this.modules.Point([x, y]);
  }
  /**
   * 创建线图形
   * @param {Number} coordinates 坐标值[[x, y], [x, y]]
   * @returns Object<Polyline> 线图形数据
   */
  createPolyline(coordinates) {
    return new this.modules.LineString(coordinates);
  }
  /**
   * 创建面图形
   * @param {Number} coordinates 坐标值[[[x, y], [x, y]]]
   * @returns Object<Polygon> 面图形数据
   */
  createPolygon(coordinates) {
    return new this.modules.Polygon(coordinates);
  }
  /**
   * 获取圆点样式
   * @param {String|Array} color 填充颜色#ff0000 | [r, g, b, a]
   * @param {Number} size 圆点大小，像素数值值大小
   * @returns Object 样式对象
   */ 
  getPointStyle(color, size) {
    return new this.modules.Style({
      image: new this.modules.CircleStyle({
        radius: size / 2,
        fill: new this.modules.Fill({
          color: color
        }),
        stroke: new this.modules.Stroke({
          color: '#fff',
          width: 1
        })
      }),
      zIndex: 3
    });
  }
  /**
   * 获取点图标样式
   * @param {String} url 图标地址
   * @param {String} scale 图标缩放比例
   * @param {String} xoffset x偏移 （可选）
   * @param {String} yoffset y偏移 （可选）
   * @returns Object 样式对象
   */  
  getMarkerStyle(url, scale, xoffset, yoffset) {
    return new this.modules.Style({
      image: new this.modules.Icon({
        src: url,
        scale,
        anchor: [xoffset || 0.5, yoffset || 0.5],
      }),
      zIndex: 4
    });
  }
  /**
   * 获取标注样式
   * @param {String} text 文本内容
   * @param {String|Array} color 填充颜色#ff0000 | [r, g, b, a]
   * @param {Number} fontSize 字体大小
   * @param {String} xoffset x偏移 （可选）
   * @param {String} yoffset y偏移 （可选）
   * @returns Object 样式对象
   */ 
  getTextStyle(text, color, fontSize, strokeColor, xoffset, yoffset) {
    return new this.modules.Style({
      text: new this.modules.Text({
        text,
        fill: new this.modules.Fill({
          color,
        }),
        stroke: new this.modules.Stroke({
          color: strokeColor,
          width: 2
        }),
        scale: fontSize / 12,
        offsetX: xoffset || 0,
        offsetY: yoffset || 0,
      }),
      zIndex: 5
    });
  }
  
  getMarkerTextStyle(url, scale, xoffset, yoffset, text, color, fontSize, strokeColor, txoffset, tyoffset) {
    return new this.modules.Style({
      image: new this.modules.Icon({
        src: url,
        scale,
        anchor: [xoffset || 0.5, yoffset || 0.5],
      }),
      text: new this.modules.Text({
        text: text,
        fill: new this.modules.Fill({
          color,
        }),
        stroke: new this.modules.Stroke({
          color: strokeColor,
          width: 0.3
        }),
        scale: fontSize / 12,
        offsetX: txoffset || 0,
        offsetY: tyoffset || 0,
      }),
      zIndex: 9
    });
  }

  /**
   * 获取线样式
   * @param {String|Array} color 填充颜色#ff0000 | [r, g, b, a]
   * @param {Number} width 线宽度 1
   * @param {String} style 线样式 solid-实线 dash-虚线 （可选）
   * @returns Object 样式对象
   */ 
  getLineStyle(color, width, style) {
    return new this.modules.Style({
      stroke: new this.modules.Stroke({
        lineJoin: "round",
        color,
        width,
        lineDash: style === "dash" ? [10, 10] : null,
      }),
      zIndex: 2
    });
  }
  /**
   * 获取面样式
   * @param {String|Array} color 填充颜色#ff0000 | [r, g, b, a]
   * @param {String|Array} outLineColor 边线颜色#ff0000 | [r, g, b, a]
   * @param {Number} outLineWidth 边线宽度 1
   * @param {String} outLineStyle 边线样式 solid-实线 dash-虚线 （可选）
   * @returns Object 样式对象
   */
  getPolygonStyle(color, outLineColor, outLineWidth, outLineStyle) {
    return new this.modules.Style({
      fill: new this.modules.Fill({
        color,
      }),
      stroke: new this.modules.Stroke({
        color: outLineColor,
        width: outLineWidth,
        lineDash: outLineStyle === "dash" ? [10, 10] : null,
      }),
      zIndex: 1
    });
  }
  /**
   * 获取默认样式
   * @param {String} type 样式类型'point','marker','line','polygon'
   * @returns Object 样式对象
   */
  getDefaultStyle(type) {
    let style;
    if(type === "point") {
      style = new this.modules.Style({
        image: new this.modules.CircleStyle({
          radius: 6,
          fill: new this.modules.Fill({
            color: "#3D93FD"
          }),
          stroke: new this.modules.Stroke({
            color: '#fff',
            width: 1
          })
        }),
        zIndex: 3
      });
    }else if(type === "marker") {
      style = new this.modules.Style({
        image: new this.modules.Icon({
          anchor: [0.5, 0.9],
          src: defaultMarker,
          scale: 0.52
        }),
        zIndex: 4
      });
    }else if(type === "line") {
      style = new this.modules.Style({
        stroke: new this.modules.Stroke({
          lineJoin: "round",
          color: '#4FC1DE',
          width: 3,
        }),
        zIndex: 2
      });
    }else if(type === "polygon") {
      style = new this.modules.Style({
        fill: new this.modules.Fill({
          color: [148, 219, 230, 0.28],
        }),
        stroke: new this.modules.Stroke({
          color: '#4FC1DE',
          width: 2,
        }),
        zIndex: 1
      });
    }
    return style;
  }
  /**
   * 创建要素数据
   * @param {Object} geometry 图形对象
   * @param {Object} style 样式
   * @param {Object} attributes 属性（可选）
   * @returns Object<Feature> 要素数据
   */
  createFeature(geometry, style, attributes) {
    let feature = new this.modules.Feature({ geometry });
    feature.setStyle(style);
    if(attributes) feature.setProperties(attributes);
    return feature;
  }
  /**
   * 设置要素样式
   * @param {Object} feature 图形要素
   * @param {Object} style 样式
   */
  setFeatureStyle(feature, style) {
    feature.setStyle(style);
  }
  /**
   * 设置要素图形信息
   * @param {Object} feature 图形要素
   * @param {Object} geometry 图形信息
   */
  setFeatureGeometry(feature, geometry) {
    feature.setGeometry(geometry);
  }
  /**
   * 设置要素属性信息
   * @param {Object} feature 图形要素
   * @param {Object} attributes 属性信息
   */
  setFeatureAttributes(feature, attributes) {
    feature.setProperties(attributes);
  }
  // 获取要素的图形对象
  getGeometryByFeature(feature) {
    if(Array.isArray(feature)) {
      return feature.map(item => item.getGeometry());
    }else {
      return feature.getGeometry();
    }
  }
  /**
   * 获取要素的图形对象
   * @param {Object|Array<Feature>} feature 单个/多个要素数据
   * @returns 图形对象数据
   */
  getAttributeByFeature(feature) {
    if(Array.isArray(feature)) {
      return feature.map(item => item.getProperties());
    }else {
      return feature.getProperties();
    }
  }
  /**
   * 添加高亮要素数据
   * @param {Object|Array<Feature>} feature 单个/多个要素数据
   */
  addHighLightFeature(feature) {
    if(Array.isArray(feature)) {
      this.highLightLayerSource.addFeatures(feature);
    }else {
      this.highLightLayerSource.addFeature(feature);
    }
  }
  // 清除高亮图层
  clearHighLightLayer() {
    this.highLightLayerSource.clear();
  }
  /**
   * 创建图形图层
   * @param {String} id 图层id 
   * @returns 图层对象
   */
  createGraphicsLayer(id) {
    let source = new this.modules.VectorSource({
      wrapX: false
    });
    let layer = new this.modules.VectorLayer({ id, source });
    this.map.addLayer(layer);
    return layer;
  }
  /**
   * 创建热力图层
   * @param {String} id 图层id 
   * @param {Number} blur 热力模糊度 
   * @param {Number} radius 热力半径 
   * @param {Array<String>} colors 颜色值
   * @returns 图层对象
   */
  createHeatmapLayer(id, blur, radius, colors) {
    let source = new this.modules.VectorSource({
      wrapX: false
    });
    let layer = new this.modules.HeatmapLayer({ 
      id, source,
      blur,
      radius,
      gradient: colors
    });
    this.map.addLayer(layer);
    return layer;
  }
  /**
   * 删除图层
   * @param {Object|String} layer|layerId 图形图层对象或id
   */
  removeLayer(layer) {
    let item = typeof(layer) === 'string' ? this.getLayerById(layer) : layer;
    this.map.removeLayer(item);
  }
  /**
   * 获取图层
   * @param {String} id 图层id 
   * @returns Object 图层对象
   */
  getLayerById(id) {
    return this.map.getLayers().getArray().find(item => id === item.getProperties().id);
  }
  /**
   * 添加要素到图层
   * @param {Object|String} layer|layerId 图形图层对象或id
   * @param {Object|Array<Feature>} feature 单个/多个要素数据
   */
  addFeatureToLayer(layer, feature) {
    if(Array.isArray(feature)) {
      typeof(layer) === 'string' ? this.getLayerById(layer).getSource().addFeatures(feature) : layer.getSource().addFeatures(feature);
    }else {
      typeof(layer) === 'string' ? this.getLayerById(layer).getSource().addFeature(feature) : layer.getSource().addFeature(feature);
    }
  }
  /**
   * 清除图形图层
   * @param {Object|String} layer|layerId 图形图层对象或id
   */
  clearGraphicsLayer(layer) {
    typeof(layer) === 'string' ? this.getLayerById(layer).getSource().clear() : layer.getSource().clear();
  }
  // 监听地图级别变化
  viewScaleListener(callback) {
    this.viewScaleEvent = this.map.getView().on("change:resolution", (e) => {
      if(callback) callback(e);
    });
    return this.viewScaleEvent;
  }
  // 监听地图范围变化
  viewExtentListener(callback) {
    this.viewExtentEvent = this.map.getView().on("change:center", () => {
      let centerCoords = this.map.getView().getCenter();
      let centerPoint = new this.modules.Point(centerCoords);
      let centerScreen = this.map.getPixelFromCoordinate(centerCoords);
      callback && callback({
        centerCoords,
        centerScreen: {
          x: centerScreen[0],
          y: centerScreen[1]
        },
        centerPoint
      });
    });
    this.viewSizeEvent = this.map.on("change:size", () => {
      let coordinate = this.map.getView().getCenter();
      let mapPoint = this.createPoint(coordinate[0], coordinate[1]);
      let screenPoint = this.map.getPixelFromCoordinate(coordinate);
      callback && callback({
        coordinate,
        screenPoint: {
          x: screenPoint[0],
          y: screenPoint[1]
        },
        mapPoint
      });
    });
    return [this.viewExtentEvent, this.viewSizeEvent];
  }
  // 监听鼠标移动
  pointerMoveListener(callback) {
    this.pointerMoveEvent = this.map.on("pointermove", evt => {
      callback && callback({
        coordinate: evt.coordinate,
        screenPoint: {
          x: evt.pixel[0],
          y: evt.pixel[1]
        },
        mapPoint: new this.modules.Point(evt.coordinate)
      });
    });
    return this.pointerMoveEvent;
  }
  // 地图点击事件
  mapOnClick(callback, isAgain) {
    if(this.mapClickEvent && isAgain) this.modules.unByKey(this.mapClickEvent);
    this.mapClickEvent = this.map.on("click", evt => {
      callback && callback({
        coordinate: evt.coordinate,
        screenPoint: {
          x: evt.pixel[0],
          y: evt.pixel[1]
        },
        mapPoint: new this.modules.Point(evt.coordinate)
      });
      if(!isAgain) this.modules.unByKey(this.mapClickEvent);
    });
    return this.mapClickEvent;
  }
  // 选中要素数据
  featureOnSelect(callback, isAgain = true) {
    if(this.featureClickEvent && isAgain) this.modules.unByKey(this.featureClickEvent);
    this.featureClickEvent = this.map.on("click", evt => {
      this.map.forEachFeatureAtPixel(evt.pixel, feature => {
        callback && callback(feature);
      });
      if(!isAgain) this.modules.unByKey(this.featureClickEvent);
    });
    return this.featureClickEvent;
  }
  // 选中要素数据
  featureOnSelectAll(callback, isAgain = true) {
    if(this.featureSelectEvent && isAgain) this.modules.unByKey(this.featureSelectEvent);
    this.featureSelectEvent = this.map.on("click", evt => {
      let features = this.map.getFeaturesAtPixel(evt.pixel);
      callback && callback(features);
      if(!isAgain) this.modules.unByKey(this.featureSelectEvent);
    });
    return this.featureSelectEvent;
  }
  /**
   * 移除地图事件
   * @param {Object||Array<Object>} event 单个或多个事件对象
   */
  removeMapEvent(event) {
    if(Array.isArray(event)) {
      event.forEach(item => {
        // 地图范围变化事件为数组，event可能是二维数组
        if(Array.isArray(item)) {
          item.forEach(subItem => {
            if(subItem) this.modules.unByKey(subItem);
          });
        }
        if(item) this.modules.unByKey(item);
      });
    }else {
      if(event) this.modules.unByKey(event);
    }
  }
  /**
   * 显示弹窗
   * @param {String|HTMLElement} content 弹窗内容
   * @param {Object<Geometry>} location 弹窗显示位置
   * @param {Function} callback 弹窗关闭后执行回调
   */
  showPopup(content, geometry, callback) {
    let point;
    if(geometry.getType() === "Point") {
      point = geometry.getCoordinates();
    }else {
      point = this.modules.getExtentCenter(geometry.getExtent());
    }
    let element = document.createElement("div");
    element.innerHTML = `<div id="popup" class="ol-popup">
      <span id="popup-closer" class="ol-popup-closer"></span>
      <div class="popup-content"></div>
    </div>`;
    this.overlay.setElement(element);
    this.overlay.setPosition(point);
    let outContent = document.querySelector(".popup-content");
    if(typeof content === "string") {
      outContent.innerHTML = content;
    }else {
      outContent.appendChild(content);
    }
    document.getElementById("popup-closer").onclick = () => {
      this.overlay.setPosition(undefined);
      if(callback) callback();
    }
  }
  // 关闭弹窗
  closePopup() {
    this.overlay.setPosition(undefined);
  }
  /**
   * 获取图形之间的距离
   * @param {Object<Geometry>} geometry1 图形
   * @param {Object<Geometry>} geometry2 图形
   * @returns {Boolean} 距离
   */
   getGeometryDistance(geometry1, geometry2) {
    return this.jstsParser.read(geometry1).distance(this.jstsParser.read(geometry2));
  }
  /**
   * 合并图形
   * @param {Array<Geometry>} geometries 图形集合
   * @returns {Object<Geometry>} 合并后的图形
   */
  getUnionGeometry(geometries) {
    return geometries.reduce((pre, cur) => this.jstsParser.write(this.jstsParser.read(pre).union(this.jstsParser.read(cur))));
  }
  /**
   * 相交图形
   * @param {Object<Geometry>} geometry1 图形
   * @param {Object<Geometry>} geometry2 图形
   * @returns {Object<Geometry>} 相交图形
   */
  getIntersectGeometry(geometry1, geometry2) {
    return this.jstsParser.write(this.jstsParser.read(geometry1).intersection(this.jstsParser.read(geometry2)));
  }
  /**
   * 判断相交
   * @param {Object<Geometry>} geometry1 图形
   * @param {Object<Geometry>} geometry2 图形
   * @returns {Boolean} 是否相交
   */
  isIntersect(geometry1, geometry2) {
    return this.jstsParser.read(geometry1).intersects(this.jstsParser.read(geometry2));
  }
  /**
   * 判断包含
   * @param {Object<Geometry>} outGeometry 图形（外）
   * @param {Object<Geometry>} inGeometry 图形（内）
   * @returns {Boolean} 是否包含
   */
  isContains(outGeometry, inGeometry) {
    return this.jstsParser.read(outGeometry).contains(this.jstsParser.read(inGeometry));
  }
  // 地图销毁释放地图资源
  destroyMap() {
    this.map.setTarget(undefined);
  }
}

export default MapClass;