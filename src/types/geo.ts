// GeoJSON类型定义
export interface GeoJSON {
    type: "FeatureCollection"; // 标识GeoJSON是一个FeatureCollection
    features: Feature[];       // 一个Feature数组
  }
  
  export interface Feature {
    type: "Feature";             // Feature 类型
    geometry: Geometry;          // 几何体
    properties: NatureEarthProperties; // 属性，类型为key-value结构
    id?: string | number;        // 可选的Feature ID
  }
  
  export type Geometry =
    | Point
    | LineString
    | Polygon
    | MultiPoint
    | MultiLineString
    | MultiPolygon
    | GeometryCollection;
  
  export interface Point {
    type: "Point";
    coordinates: [number, number];  // 经纬度坐标 [longitude, latitude]
  }
  
  export interface LineString {
    type: "LineString";
    coordinates: [number, number][]; // 由多个经纬度坐标点构成的线
  }
  
  export interface Polygon {
    type: "Polygon";
    coordinates: [number, number][][];  // 多边形由多个坐标数组构成
  }
  
  export interface MultiPoint {
    type: "MultiPoint";
    coordinates: [number, number][];  // 多个点的数组
  }
  
  export interface MultiLineString {
    type: "MultiLineString";
    coordinates: [number, number][][]; // 多个线的数组
  }
  
  export interface MultiPolygon {
    type: "MultiPolygon";
    coordinates: [number, number][][][]; // 多个多边形的数组
  }
  
  export interface GeometryCollection {
    type: "GeometryCollection";
    geometries: Geometry[];  // 由多个几何体构成的集合
  }
  

  export interface NatureEarthProperties {
    featurecla: string;
    scalerank: number;
    LABELRANK: number;
    SOVEREIGNT: string;
    SOV_A3: string;
    ADM0_DIF: number;
    LEVEL: number;
    TYPE: string;
    TLC: string;
    ADMIN: string;
    ADM0_A3: string;
    GEOU_DIF: number;
    GEOUNIT: string;
    GU_A3: string;
    SU_DIF: number;
    SUBUNIT: string;
    SU_A3: string;
    BRK_DIFF: number;
    NAME: string;
    NAME_LONG: string;
    BRK_A3: string;
    BRK_NAME: string;
    BRK_GROUP: string | null;
    ABBREV: string;
    POSTAL: string;
    FORMAL_EN: string;
    FORMAL_FR: string | null;
    NAME_CIAWF: string;
    NOTE_ADM0: string | null;
    NOTE_BRK: string | null;
    NAME_SORT: string;
    NAME_ALT: string | null;
    MAPCOLOR7: number;
    MAPCOLOR8: number;
    MAPCOLOR9: number;
    MAPCOLOR13: number;
    POP_EST: number;
    POP_RANK: number;
    POP_YEAR: number;
    GDP_MD: number;
    GDP_YEAR: number;
    ECONOMY: string;
    INCOME_GRP: string;
    FIPS_10: string;
    ISO_A2: string;
    ISO_A2_EH: string;
    ISO_A3: string;
    ISO_A3_EH: string;
    ISO_N3: string;
    ISO_N3_EH: string;
    UN_A3: string;
    WB_A2: string;
    WB_A3: string;
    WOE_ID: number;
    WOE_ID_EH: number;
    WOE_NOTE: string;
    ADM0_ISO: string;
    ADM0_DIFF: string | null;
    ADM0_TLC: string;
    ADM0_A3_US: string;
    ADM0_A3_FR: string;
    ADM0_A3_RU: string;
    ADM0_A3_ES: string;
    ADM0_A3_CN: string;
    ADM0_A3_TW: string;
    ADM0_A3_IN: string;
    ADM0_A3_NP: string;
    ADM0_A3_PK: string;
    ADM0_A3_DE: string;
    ADM0_A3_GB: string;
    ADM0_A3_BR: string;
    ADM0_A3_IL: string;
    ADM0_A3_PS: string;
    ADM0_A3_SA: string;
    ADM0_A3_EG: string;
    ADM0_A3_MA: string;
    ADM0_A3_PT: string;
    ADM0_A3_AR: string;
    ADM0_A3_JP: string;
    ADM0_A3_KO: string;
    ADM0_A3_VN: string;
    ADM0_A3_TR: string;
    ADM0_A3_ID: string;
    ADM0_A3_PL: string;
    ADM0_A3_GR: string;
    ADM0_A3_IT: string;
    ADM0_A3_NL: string;
    ADM0_A3_SE: string;
    ADM0_A3_BD: string;
    ADM0_A3_UA: string;
    CONTINENT: string;
    REGION_UN: string;
    SUBREGION: string;
    REGION_WB: string;
    NAME_LEN: number;
    LONG_LEN: number;
    ABBREV_LEN: number;
    TINY: number;
    HOMEPART: number;
    MIN_ZOOM: number;
    MIN_LABEL: number;
    MAX_LABEL: number;
    LABEL_X: number;
    LABEL_Y: number;
    NE_ID: number;
    WIKIDATAID: string;
    NAME_AR: string;
    NAME_BN: string;
    NAME_DE: string;
    NAME_EN: string;
    NAME_ES: string;
    NAME_FA: string;
    NAME_FR: string;
    NAME_EL: string;
    NAME_HE: string;
    NAME_HI: string;
    NAME_HU: string;
    NAME_ID: string;
    NAME_IT: string;
    NAME_JA: string;
    NAME_KO: string;
    NAME_NL: string;
    NAME_PL: string;
    NAME_PT: string;
    NAME_RU: string;
    NAME_SV: string;
    NAME_TR: string;
    NAME_UK: string;
    NAME_UR: string;
    NAME_VI: string;
    NAME_ZH: string;
    NAME_ZHT: string;
    FCLASS_ISO: string;
    TLC_DIFF: string | null;
    FCLASS_TLC: string;
    FCLASS_US: string | null;
    FCLASS_FR: string | null;
    FCLASS_RU: string | null;
    FCLASS_ES: string | null;
    FCLASS_CN: string | null;
    FCLASS_TW: string | null;
    FCLASS_IN: string | null;
    FCLASS_NP: string | null;
    FCLASS_PK: string | null;
    FCLASS_DE: string | null;
    FCLASS_GB: string | null;
    FCLASS_BR: string | null;
    FCLASS_IL: string | null;
    FCLASS_PS: string | null;
    FCLASS_SA: string | null;
    FCLASS_EG: string | null;
    FCLASS_MA: string | null;
    FCLASS_PT: string | null;
    FCLASS_AR: string | null;
    FCLASS_JP: string | null;
    FCLASS_KO: string | null;
    FCLASS_VN: string | null;
    FCLASS_TR: string | null;
    FCLASS_ID: string | null;
    FCLASS_PL: string | null;
    FCLASS_GR: string | null;
    FCLASS_IT: string | null;
    FCLASS_NL: string | null;
    FCLASS_SE: string | null;
    FCLASS_BD: string | null;
    FCLASS_UA: string | null;
  }