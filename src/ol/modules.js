// 引入css样式
import 'ol/ol.css';
// 引入api模块
import Map from 'ol/Map';
import View from 'ol/View';
import {
  Tile as TileLayer,
  Vector as VectorLayer,
  Heatmap as HeatmapLayer,
} from 'ol/layer';
import {
  XYZ as XYZSource,
  WMTS as WMTSSource,
  Vector as VectorSource,
  TileWMS,
  TileArcGISRest
} from 'ol/source'; 
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from 'ol/tilegrid/TileGrid';
import { getTopLeft as getExtentTopLeft, getWidth as getExtentWidth, getCenter as getExtentCenter } from 'ol/extent';
import { register } from 'ol/proj/proj4';
import { Projection, get as getProjection } from 'ol/proj';
import { ScaleLine, defaults as defaultControls } from 'ol/control';
import {
  defaults as defaultInteractions,
  Draw,
  Modify,
  Select,
  Snap
} from 'ol/interaction';
import { createRegularPolygon, createBox } from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Icon,
  Text
} from 'ol/style';
import {
  Point,
  LineString,
  LinearRing,
  Polygon,
  Circle,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
  GeometryCollection
} from 'ol/geom';
import Feature from 'ol/Feature';
import { fromExtent } from 'ol/geom/Polygon';
import { getArea, getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';
import { GeoJSON as formatGeoJSON } from 'ol/format';
import { getRenderPixel } from 'ol/render';

export default {
  Map, View, 
  TileLayer, VectorLayer, HeatmapLayer,
  XYZSource, WMTSSource, VectorSource, TileWMS, TileArcGISRest, 
  WMTSTileGrid, TileGrid,
  getExtentTopLeft, getExtentWidth, getExtentCenter,
  Projection, getProjection,
  register, 
  ScaleLine, defaultControls,
  defaultInteractions, Draw, Modify, Select, Snap,
  createRegularPolygon, createBox,
  Overlay,
  CircleStyle, Fill, Stroke, Style, Icon, Text,
  Point, LineString, LinearRing, Polygon, Circle, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection,
  Feature,
  fromExtent,
  getArea, getLength,
  unByKey,
  formatGeoJSON,
  getRenderPixel
}