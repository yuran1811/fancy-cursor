import {
  Clock,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

interface LightShaft {
  dir: Vector3;
  n: Vector3;
  v: Vector3;
  opacity: number;
  lenMult: number;
  mouseMixer: number;
}

interface LinePoint {
  v: Vector3;
  opacity: number;
  velocityOpacity: number;
  uvy?: number;
  mouseMixer?: number;
}

interface Sparkle {
  v: Vector3;
  opacity: number;
  mouseMixer: number;
  vel: Vector3;
  size: number;
}

interface UserConfig {
  lineSize?: number;
  lineExpFactor?: number;
  speedExpFactor?: number;
  opacityDecrement?: number;
  sparklesCount?: number;
  maxOpacity?: number;
  texture1?: string;
  texture2?: string;
  texture3?: string;
}

declare class FancyCursor {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;

  currMousePos: Vector3;
  lastMousePos: Vector3;
  textureDisp: Vector2;
  lastTextureDisp: Vector2;

  lightShafts: LightShaft[];
  linePoints: LinePoint[];
  sparkles: Sparkle[];

  lineMaterial: ShaderMaterial;
  lightShaftMaterial: ShaderMaterial;
  sparkleMaterial: ShaderMaterial;
  quadClearMaterial: ShaderMaterial;

  clock: Clock;

  mouseDown: boolean;

  aspectRatio: number;
  cumulativeUvy: number;
  followCumulative: number;
  lineExpFactor: number;
  lineSize: number;
  maxOpacity: number;
  mouseMixer: number;
  opacityDecrement: number;
  sparklesCount: number;
  speedExpFactor: number;
  velocityExp: number;

  defaultConfig: UserConfig;

  constructor(userConfig: UserConfig);

  animate: () => void;
  updateOpacity: (delta: number) => void;
  constructGeometry: () => void;
  constructSparkleGeometry: () => void;
  constructLightShaftGeometry: () => void;
  onMouseMove: (e: any) => void;
  vec3: (x: number, y: number, z: number) => Vector3;
}

export default FancyCursor;
