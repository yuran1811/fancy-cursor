import {
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Clock,
  DoubleSide,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import { linef, linev } from './shaders/line';
import { sparklef, sparklev } from './shaders/sparkle';

class FancyCursor {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;

  currMousePos: Vector3;
  lastMousePos: Vector3;
  textureDisp: Vector2;
  lastTextureDisp: Vector2;

  lightShafts: {
    dir: Vector3;
    n: Vector3;
    v: Vector3;
    opacity: number;
    lenMult: number;
    mouseMixer: number;
  }[] = [];
  linePoints: {
    v: Vector3;
    opacity: number;
    velocityOpacity: number;
    uvy?: number;
    mouseMixer?: number;
  }[] = [];
  sparkles: {
    v: Vector3;
    opacity: number;
    mouseMixer: number;
    vel: Vector3;
    size: number;
  }[] = [];

  // @ts-ignore
  lineMaterial: ShaderMaterial;
  // @ts-ignore
  lightShaftMaterial: ShaderMaterial;
  // @ts-ignore
  sparkleMaterial: ShaderMaterial;
  // @ts-ignore
  quadClearMaterial: ShaderMaterial;

  clock = new Clock();

  mouseDown = false;

  aspectRatio = innerWidth / innerHeight;
  cumulativeUvy = 0;
  followCumulative = 0;
  lineExpFactor: number;
  lineSize: number;
  maxOpacity: number;
  mouseMixer = 0;
  opacityDecrement: number;
  sparklesCount: number;
  speedExpFactor: number;
  velocityExp = 0;

  defaultConfig = {
    lineSize: 0.15,
    lineExpFactor: 0.6,
    speedExpFactor: 0.8,
    opacityDecrement: 0.55,
    sparklesCount: 65,
    maxOpacity: 1,
    texture1: 'https://domenicobrz.github.io/assets/legendary-cursor/t3.jpg',
    texture2: 'https://domenicobrz.github.io/assets/legendary-cursor/t6_1.jpg',
    texture3: 'https://domenicobrz.github.io/assets/legendary-cursor/ts.png',
  };

  constructor(userConfig: {
    lineSize?: number;
    lineExpFactor?: number;
    speedExpFactor?: number;
    opacityDecrement?: number;
    sparklesCount?: number;
    maxOpacity?: number;
    texture1?: string;
    texture2?: string;
    texture3?: string;
  }) {
    const args = { ...this.defaultConfig, ...userConfig };

    this.lineSize = args.lineSize;
    this.lineExpFactor = args.lineExpFactor;
    this.speedExpFactor = args.speedExpFactor;
    this.opacityDecrement = args.opacityDecrement;
    this.sparklesCount = args.sparklesCount;
    this.maxOpacity = args.maxOpacity;

    this.currMousePos = this.vec3(0, 0, 0);
    this.lastMousePos = this.vec3(0, 0, 0);
    this.textureDisp = new Vector2(0, 0);
    this.lastTextureDisp = new Vector2(0, 0);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, this.aspectRatio, 1, 1000);
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
    });

    this.camera.position.set(0, 0, 60);
    Object.assign(this.renderer.domElement.style, {
      left: '0',
      pointerEvents: 'none',
      position: 'fixed',
      top: '0',
      zIndex: '99999',
    });
    this.renderer.autoClear = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    let t1: Texture;
    let t2: Texture;
    let t4: Texture;

    const onTextureLoaded = () => {
      if (!t1 || !t2 || !t4) return;

      const linef2 = linef.replace(
        'float t = 2.5 - pow(vFx.x, 0.5) * 2.7;',
        'float t = 2.5 - pow(vFx.x, 0.5) * ' +
          (2.7 * this.maxOpacity).toFixed(2) +
          ';'
      );

      this.lineMaterial = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vector2(innerWidth, innerHeight) },
          uUVYheadStart: { value: 0 },
          uUVYheadLength: { value: 0 },
          uCumulativeY: { value: 0 },
          uTexture1: { type: 't', value: t1 } as any,
          uTexture2: { type: 't', value: t2 } as any,
          uPass: { value: 0 },
          uMouseTextureDisp: { value: new Vector2(0, 0) },
        },

        side: DoubleSide,
        transparent: true,

        depthTest: false,

        vertexShader: linev,
        fragmentShader: linef2,
      });

      this.sparkleMaterial = new ShaderMaterial({
        uniforms: {
          uResolution: { value: new Vector2(innerWidth, innerHeight) },
          uTexture1: { type: 't', value: t1 } as any,
          uTexture2: { type: 't', value: t2 } as any,
          uTexture3: { type: 't', value: t4 } as any,
        },

        side: DoubleSide,
        transparent: true,

        depthTest: false,

        vertexShader: sparklev,
        fragmentShader: sparklef,
      });

      /* this.lightShaftMaterial = new ShaderMaterial({
        uniforms: {
          uResolution: { value: new Vector2(innerWidth, innerHeight) },
          uTexture1: { type: 't', value: t3 } as any,
          uTexture2: { type: 't', value: t2 } as any,
        },

        side: DoubleSide,
        transparent: false,

        depthTest: false,

        vertexShader: lightshaftv,
        fragmentShader: lightshaftf,
      });

      this.quadClearMaterial = new ShaderMaterial({
        side: DoubleSide,
        transparent: true,

        blending: CustomBlending,
        blendDst: OneMinusSrcAlphaFactor,
        blendDstAlpha: ZeroFactor,
        blendSrc: ZeroFactor,
        blendSrcAlpha: ZeroFactor,

        vertexShader: quadclearv,
        fragmentShader: quadclearf,
      }); */

      window.addEventListener('mousemove', this.onMouseMove);

      this.clock.start();
      this.animate();
    };

    new TextureLoader().load(args.texture1, (texture) => {
      // setting these values will prevent the texture from being downscaled internally by js
      texture.generateMipmaps = false;
      texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
      texture.minFilter = LinearFilter;
      t1 = texture;
      onTextureLoaded();
    });

    new TextureLoader().load(args.texture2, (texture) => {
      texture.generateMipmaps = false;
      texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
      texture.minFilter = LinearFilter;
      t2 = texture;
      onTextureLoaded();
    });

    new TextureLoader().load(args.texture3, (texture) => {
      t4 = texture;
      onTextureLoaded();
    });

    window.addEventListener('mousedown', () => (this.mouseDown = true));
    window.addEventListener('mouseup', () => (this.mouseDown = false));
    window.addEventListener('resize', () => {
      const newRatio = window.innerWidth / window.innerHeight;
      const newVector2 = new Vector2(innerWidth, innerHeight);

      this.aspectRatio = this.camera.aspect = newRatio;
      this.lineMaterial.uniforms.uResolution.value =
        this.sparkleMaterial.uniforms.uResolution.value = newVector2;

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    // DON'T MOVE THE ORDER OF THESE TWO CALLS
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.followCumulative = Math.min(
      this.followCumulative * 0.92 + this.cumulativeUvy * 0.08,
      this.cumulativeUvy - 0.1
    );

    this.lineMaterial.uniforms.uTime.value = time;
    this.lineMaterial.uniforms.uUVYheadStart.value = this.followCumulative; // cumulativeUvy - 0.1;
    this.lineMaterial.uniforms.uUVYheadLength.value =
      this.cumulativeUvy - this.followCumulative; // 0.1;
    this.lineMaterial.uniforms.uCumulativeY.value = this.cumulativeUvy; // 0.1;

    if (this.mouseDown) {
      this.mouseMixer += delta * 10;
      this.mouseMixer = Math.min(this.mouseMixer, 1);
    } else {
      this.mouseMixer -= delta * 10;
      this.mouseMixer = Math.max(this.mouseMixer, 0);
    }

    const atd = 0.01;
    this.textureDisp = this.textureDisp
      .clone()
      .multiplyScalar(1 - atd)
      .add(this.lastTextureDisp.clone().multiplyScalar(atd));
    this.lineMaterial.uniforms.uMouseTextureDisp.value = this.textureDisp;

    const a = this.lineExpFactor;
    // because of the exponential averaging of lastMousePos,  minDistBeforeActivation is probably broken
    // and wont behave the way I've intended to
    const minDistBeforeActivation = 0.0; // 0.0075;

    let newPos = this.vec3(
      this.currMousePos.x * a + this.lastMousePos.x * (1 - a),
      this.currMousePos.y * a + this.lastMousePos.y * (1 - a),
      this.currMousePos.z * a + this.lastMousePos.z * (1 - a)
    );

    const dist = this.lastMousePos.distanceTo(newPos);

    this.velocityExp =
      this.velocityExp * this.speedExpFactor + dist * (1 - this.speedExpFactor);

    if (dist > minDistBeforeActivation) {
      this.cumulativeUvy += dist; // * ( 7 + Math.sin(this.cumulativeUvy * 5 + time * 3) * 3 );

      // prevents the first point from being interpolated with vec3(0,0,0)
      if (!this.linePoints.length) {
        newPos = this.currMousePos;
        this.velocityExp = 0;
      }

      const velocityOpacity = Math.min(this.velocityExp * 40, 1);
      this.linePoints.push({
        v: newPos,
        opacity: 1,
        velocityOpacity,
        uvy: this.cumulativeUvy,
        mouseMixer: this.mouseMixer,
      });

      const rs = 5;
      const num = Math.floor((dist + 0.01) * this.sparklesCount);
      const sparkleBackDir = this.lastMousePos
        .clone()
        .sub(newPos)
        .normalize()
        .multiplyScalar(0.1);
      for (let i = 0; i < num; i++)
        this.sparkles.push({
          v: newPos
            .clone()
            .add(
              this.vec3(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0)
            )
            .add(sparkleBackDir),
          opacity: 0.8 * velocityOpacity,
          mouseMixer: this.mouseMixer,
          vel: this.lastMousePos
            .clone()
            .add(newPos)
            .normalize()
            .add(
              this.vec3(
                Math.random() * -rs + rs * 0.5,
                Math.random() * -rs + rs * 0.5,
                Math.random() * -rs + rs * 0.5
              )
            )
            .multiplyScalar(0.0025),
          size: 0.0025 + Math.random() * 0.01,
        });

      // let minimumSpeedToShowShafts = 0.01;
      // if(dist > minimumSpeedToShowShafts) {
      //     let shaftdir = this.lastMousePos.clone().sub(newPos).normalize();
      //     shaftdir = vec3(-shaftdir.y, shaftdir.x);
      //     if(Math.random() > 0.5) {
      //         shaftdir.negate();
      //     }
      //     let shaftorigin = this.lastMousePos.clone().sub(shaftdir.clone().multiplyScalar(0 + 0.1 * Math.random()));
      //     let normal = this.lastMousePos.clone().sub(newPos).normalize();
      //     for(let i = 0; i < 20; i++)
      //     lightShafts.push({
      //         v:   shaftorigin.clone().add(normal.clone().multiplyScalar(Math.random() * 0.2)),
      //         dir: shaftdir,
      //         opacity: 1,
      //         n:   normal,
      //         lenMult: Math.random(),
      //         mouseMixer: mouseMixer,
      //     });
      // }

      this.lastMousePos = newPos;
    }

    this.updateOpacity(delta);
    // constructLightShaftGeometry();
    this.constructSparkleGeometry();
    this.constructGeometry();

    // lightShaftMaterial.transparent = true;
    // lightShaftMaterial.blending = CustomBlending;
    // lightShaftMaterial.blendSrc = OneFactor;
    // lightShaftMaterial.blendDst = OneFactor;
    // lightShaftMaterial.blendSrcAlpha = OneFactor;
    // lightShaftMaterial.blendDstAlpha = OneFactor;
    // // renderer.render(scene, camera);

    // if(scene.getObjectByName("line"))
    //     scene.getObjectByName("line").material.visible = false;
    // if(scene.getObjectByName("sparkles"))
    //     scene.getObjectByName("sparkles").material.visible = false;
    // if(scene.getObjectByName("lightShafts"))
    //     scene.getObjectByName("lightShafts").material.visible = true;
    // renderer.render(scene, camera);

    // scene.background = undefined;
    // if(scene.getObjectByName("line"))
    //     scene.getObjectByName("line").material.visible = true;
    // if(scene.getObjectByName("sparkles"))
    //     scene.getObjectByName("sparkles").material.visible = true;
    // if(scene.getObjectByName("lightShafts"))
    //     scene.getObjectByName("lightShafts").material.visible = false;
    this.renderer.render(this.scene, this.camera);
  };

  updateOpacity = (delta: number) => {
    for (let linePoint of this.linePoints) {
      linePoint.opacity -= delta * this.opacityDecrement;
    }
    // this filter routine might need a modification to solve TODO .1
    this.linePoints = this.linePoints.filter((e, i) => {
      // if(e.opacity < -0.2 && omncesaf === 0) {
      //     console.log(this.linePoints[0] === e);
      //     console.log(e);
      //     omncesaf = 1;
      // }

      // we can't delete an element if the successor still has some opacity left, this can cause little artifacts
      // if we move lines really fast
      if (this.linePoints.length > i + 1) {
        return e.opacity > -0.2 || this.linePoints[i + 1].opacity > -0.2;
      }

      return e.opacity > -0.2;
    });

    for (let sparkle of this.sparkles) {
      sparkle.opacity -= delta * this.opacityDecrement * 1.54;
    }
    // this filter routine might need a modification to solve TODO .1
    this.sparkles = this.sparkles.filter((e) => e.opacity > 0);

    for (let lightShaft of this.lightShafts) {
      lightShaft.opacity -= delta * 1.385;
    }
    // this filter routine might need a modification to solve TODO .1
    this.lightShafts = this.lightShafts.filter((e) => e.opacity > 0);
  };

  constructGeometry = () => {
    // this has to run at the beginning of the function otherwise we run the risk of never deleting stale lines
    const prevMesh = this.scene.getObjectByName('line');
    prevMesh && this.scene.remove(prevMesh);

    // this if-statement might need a modification to solve TODO .1
    if (this.linePoints.length < 3) return;

    const newPoints: any[] = [];
    const CubicInterpolate = (
      y0: number,
      y1: number,
      y2: number,
      y3: number,
      mu: number
    ) => {
      let a0, a1, a2, a3, mu2;

      mu2 = mu * mu;

      a0 = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
      a1 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
      a2 = -0.5 * y0 + 0.5 * y2;
      a3 = y1;

      return a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3;
    };

    // create fake first element if necessary
    this.linePoints.splice(0, 0, {
      v: this.linePoints[0].v
        .clone()
        .add(
          this.linePoints[1].v
            .clone()
            .sub(this.linePoints[0].v)
            .normalize()
            .multiplyScalar(-0.02)
        ),
      opacity: this.linePoints[0].opacity,
      velocityOpacity: this.linePoints[0].velocityOpacity,
    });

    // cube spline new points
    for (let i = 1; i < this.linePoints.length - 2; i++) {
      let p0 = this.linePoints[i - 1].v;
      let p1 = this.linePoints[i].v;
      let p2 = this.linePoints[i + 1].v;
      let p3 = this.linePoints[i + 2].v;

      let n0 = p0.clone().sub(p1).normalize();
      let n1 = p1.clone().sub(p2).normalize();
      let n2 = p2.clone().sub(p3).normalize();

      let uvy1 = this.linePoints[i].uvy;
      let uvy2 = this.linePoints[i + 1].uvy;

      let vo1 = this.linePoints[i].velocityOpacity;
      let vo2 = this.linePoints[i + 1].velocityOpacity;

      let mm1 = this.linePoints[i].mouseMixer;
      let mm2 = this.linePoints[i + 1].mouseMixer;

      let dot1 = n0.dot(n1);
      let dot2 = n0.dot(n2);
      let biggestProblematicDot = dot1 < dot2 ? dot1 : dot2;

      let dotT = (biggestProblematicDot * -1 + 1) / 2;

      let o0 = this.linePoints[i].opacity;
      let o1 = this.linePoints[i + 1].opacity;

      let segments = Math.max(30 * dotT, 1);

      // these two lines below seems to solve a very obscure bug that drove me crazy for 2 hours
      let js = 1;
      if (i === 1) js = 0;

      for (let j = js; j <= segments; j++) {
        let mu = j / segments;

        let x = CubicInterpolate(p0.x, p1.x, p2.x, p3.x, mu);
        let y = CubicInterpolate(p0.y, p1.y, p2.y, p3.y, mu);

        let o = o0 * (1 - mu) + o1 * mu;

        newPoints.push({
          v: this.vec3(x, y, 0),
          opacity: o,
          velocityOpacity: vo1 * (1 - mu) + vo2 * mu,
          uvy: (uvy1 || 0) * (1 - mu) + (uvy2 || 0) * mu,
          mouseMixer: (mm1 || 0) * (1 - mu) + (mm2 || 0) * mu,
        });
      }
    }

    // delete fake first element
    this.linePoints.shift();

    // compute initially intermediary normals, the normals at the begin and the end of the trail will be handled separately
    for (let i = 1; i < newPoints.length - 1; i++) {
      let p0 = newPoints[i - 1].v;
      //   let p1 = newPoints[i].v;
      let p2 = newPoints[i + 1].v;

      let pn = p0.clone().sub(p2).normalize();
      let n = this.vec3(-pn.y, pn.x, 0);
      newPoints[i].n = n;
    }

    // tail normal
    {
      let p0 = newPoints[0].v;
      let p1 = newPoints[1].v;

      let pn = p0.clone().sub(p1).normalize();
      let n = this.vec3(-pn.y, pn.x, 0);
      newPoints[0].n = n;
    }

    // head normal
    {
      let p0 = newPoints[newPoints.length - 2].v;
      let p1 = newPoints[newPoints.length - 1].v;

      let pn = p0.clone().sub(p1).normalize();
      let n = this.vec3(-pn.y, pn.x, 0);
      newPoints[newPoints.length - 1].n = n;
    }

    // construct geometry
    let vertices = [];
    let uvs = [];
    let fxs = [];
    for (let i = 0; i < newPoints.length - 1; i++) {
      let p1 = newPoints[i].v;
      let p2 = newPoints[i + 1].v;

      let mm1 = newPoints[i].mouseMixer;
      let mm2 = newPoints[i + 1].mouseMixer;

      let uvy1 = newPoints[i].uvy;
      let uvy2 = newPoints[i + 1].uvy;

      let n1 = newPoints[i].n;
      let n2 = newPoints[i + 1].n;

      let v1 = this.vec3(0, 0, 0);
      let v2 = this.vec3(0, 0, 0);
      let v3 = this.vec3(0, 0, 0);
      let v4 = this.vec3(0, 0, 0);

      v1.copy(p1.clone().sub(n1.clone().multiplyScalar(this.lineSize)));
      v2.copy(p1.clone().add(n1.clone().multiplyScalar(this.lineSize)));

      v3.copy(p2.clone().sub(n2.clone().multiplyScalar(this.lineSize)));
      v4.copy(p2.clone().add(n2.clone().multiplyScalar(this.lineSize)));

      let lineDirv1 = v3.clone().sub(v1);
      let lineDirv2 = v4.clone().sub(v2);
      let lineDirv3 = v3.clone().sub(v1);
      let lineDirv4 = v4.clone().sub(v2);
      if (i < newPoints.length - 2) {
        let v5 = this.vec3(0, 0, 0);
        let v6 = this.vec3(0, 0, 0);
        v5.copy(
          newPoints[i + 2].v
            .clone()
            .sub(newPoints[i + 2].n.clone().multiplyScalar(this.lineSize))
        );
        v6.copy(
          newPoints[i + 2].v
            .clone()
            .add(newPoints[i + 2].n.clone().multiplyScalar(this.lineSize))
        );

        lineDirv3 = v5.clone().sub(v3);
        lineDirv4 = v6.clone().sub(v4);
      }

      vertices.push(v1.x, v1.y, v1.z);
      vertices.push(v2.x, v2.y, v2.z);
      vertices.push(v3.x, v3.y, v3.z);

      vertices.push(v2.x, v2.y, v2.z);
      vertices.push(v3.x, v3.y, v3.z);
      vertices.push(v4.x, v4.y, v4.z);

      uvs.push(1, uvy1);
      uvs.push(0, uvy1);
      uvs.push(1, uvy2);

      uvs.push(0, uvy1);
      uvs.push(1, uvy2);
      uvs.push(0, uvy2);

      fxs.push(
        newPoints[i].opacity * newPoints[i].velocityOpacity,
        mm1,
        lineDirv1.x,
        lineDirv1.y
      );
      fxs.push(
        newPoints[i].opacity * newPoints[i].velocityOpacity,
        mm1,
        lineDirv2.x,
        lineDirv2.y
      );
      fxs.push(
        newPoints[i + 1].opacity * newPoints[i + 1].velocityOpacity,
        mm2,
        lineDirv3.x,
        lineDirv3.y
      );

      fxs.push(
        newPoints[i].opacity * newPoints[i].velocityOpacity,
        mm1,
        lineDirv2.x,
        lineDirv2.y
      );
      fxs.push(
        newPoints[i + 1].opacity * newPoints[i + 1].velocityOpacity,
        mm2,
        lineDirv3.x,
        lineDirv3.y
      );
      fxs.push(
        newPoints[i + 1].opacity * newPoints[i + 1].velocityOpacity,
        mm2,
        lineDirv4.x,
        lineDirv4.y
      );
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute('fx', new BufferAttribute(new Float32Array(fxs), 4));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    const mesh = new Mesh(geometry, this.lineMaterial);
    mesh.name = 'line';

    this.scene.add(mesh);

    // if(window.maxv === undefined) window.maxv = 0;
    // if(window.maxv < (vertices.length / 3)) {
    //     window.maxv = vertices.length / 3;
    //     console.log(window.maxv);
    // }
  };

  constructSparkleGeometry = () => {
    for (let i = 0; i < this.sparkles.length - 1; i++) {
      let sparkle = this.sparkles[i];
      sparkle.vel.x *= 0.97;
      sparkle.vel.y *= 0.97;

      sparkle.v.add(sparkle.vel);
    }

    const vertices = [];
    const fxs = [];
    for (let i = 0; i < this.sparkles.length - 1; i++) {
      let sparkle = this.sparkles[i];
      let v = sparkle.v;
      let mm = sparkle.mouseMixer;
      let size = sparkle.size;

      let opacity = sparkle.opacity;
      if (opacity > 0.7) {
        opacity = 1 - (opacity - 0.7) / 0.3;
      } else {
        opacity = opacity / 0.7;
      }

      opacity *= 0.7;

      vertices.push(v.x, v.y, v.z);
      fxs.push(opacity, mm, size, 0);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute('fx', new BufferAttribute(new Float32Array(fxs), 4));

    const mesh = new Points(geometry, this.sparkleMaterial);
    mesh.name = 'sparkles';

    const prevMesh = this.scene.getObjectByName('sparkles');
    prevMesh && this.scene.remove(prevMesh);

    this.scene.add(mesh);
  };

  constructLightShaftGeometry = () => {
    const vertices = [];
    const uvs = [];
    const fxs = [];

    for (let i = 0; i < this.lightShafts.length; i++) {
      const {
        dir,
        mouseMixer: mm,
        n,
        v,
        lenMult,
        opacity,
      } = this.lightShafts[i];
      const shaftLength = 0.1 + lenMult * 0.2;
      const shaftSide = 0.05;

      const v1 = v.clone().add(n.clone().multiplyScalar(shaftSide));
      const v2 = v.clone().sub(n.clone().multiplyScalar(shaftSide));
      const v3 = v
        .clone()
        .add(dir.clone().multiplyScalar(shaftLength))
        .add(n.clone().multiplyScalar(shaftSide));
      const v4 = v
        .clone()
        .add(dir.clone().multiplyScalar(shaftLength))
        .sub(n.clone().multiplyScalar(shaftSide));

      vertices.push(v1.x, v1.y, v1.z);
      vertices.push(v2.x, v2.y, v2.z);
      vertices.push(v3.x, v3.y, v3.z);

      vertices.push(v2.x, v2.y, v2.z);
      vertices.push(v3.x, v3.y, v3.z);
      vertices.push(v4.x, v4.y, v4.z);

      uvs.push(0, 0);
      uvs.push(1, 0);
      uvs.push(0, 1);

      uvs.push(1, 0);
      uvs.push(0, 1);
      uvs.push(1, 1);

      fxs.push(opacity, mm, n.x, n.y);
      fxs.push(opacity, mm, n.x, n.y);
      fxs.push(opacity, mm, n.x, n.y);

      fxs.push(opacity, mm, n.x, n.y);
      fxs.push(opacity, mm, n.x, n.y);
      fxs.push(opacity, mm, n.x, n.y);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.setAttribute('fx', new BufferAttribute(new Float32Array(fxs), 4));

    const mesh = new Mesh(geometry, this.lightShaftMaterial);
    mesh.name = 'lightShafts';

    const clearMesh = new Mesh(new PlaneGeometry(2, 2), this.quadClearMaterial);
    clearMesh.name = 'quadClear';

    const prevMesh = this.scene.getObjectByName('lightShafts');
    const prevMesh2 = this.scene.getObjectByName('quadClear');

    prevMesh && this.scene.remove(prevMesh);
    prevMesh2 && this.scene.remove(prevMesh2);

    this.scene.add(mesh, clearMesh);
  };

  onMouseMove = (e: any) => {
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = ((innerHeight - e.clientY) / innerHeight) * 2 - 1;
    const v = this.vec3(x * this.aspectRatio, y, 0);

    this.currMousePos = v;
    this.lastTextureDisp = new Vector2(x, y);
  };

  vec3 = (x: number, y: number, z: number) => new Vector3(x, y, z);
}

export default FancyCursor;
