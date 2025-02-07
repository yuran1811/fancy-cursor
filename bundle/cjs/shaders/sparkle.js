"use strict";var i=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var a=Object.getOwnPropertyNames;var n=Object.prototype.hasOwnProperty;var l=(o,e)=>{for(var t in e)i(o,t,{get:e[t],enumerable:!0})},s=(o,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let v of a(e))!n.call(o,v)&&v!==t&&i(o,v,{get:()=>e[v],enumerable:!(r=u(e,v))||r.enumerable});return o};var c=o=>s(i({},"__esModule",{value:!0}),o);var g={};l(g,{sparklef:()=>f,sparklev:()=>x});module.exports=c(g);var x=`
attribute vec4 fx;

uniform vec2 uResolution;

varying vec4 vFx;
varying vec2 vUv;
varying vec2 vResolution;
varying float vSize;

void main() {
    vec3 aspectRatioCorrected = position * vec3(uResolution.y / uResolution.x, 1.0, 1.0);

    vFx = fx;
    vUv = aspectRatioCorrected.xy * 0.5 + 0.5;
    vResolution = uResolution;

    gl_Position = vec4(aspectRatioCorrected, 1.0);

    vSize = vFx.z;
    gl_PointSize = uResolution.y * vSize;
}
`,f=`
varying vec4 vFx;
varying vec2 vUv;
varying vec2 vResolution;
varying float vSize;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;

void main() {
    vec2 uvOffs = gl_PointCoord * vSize * vec2( vResolution.y / vResolution.x, 1.0);

    vec3 col = mix(texture2D(uTexture1, vUv + uvOffs), texture2D(uTexture2, vUv + uvOffs), vFx.y).rgb;
    col *= 1.3;

    float sphereAlpha = 1.0 - smoothstep(0.3, 0.5, length(gl_PointCoord - vec2(0.5)));
    float a = vFx.x * sphereAlpha;

    // star texture mix
    a *= texture2D(uTexture3, gl_PointCoord).a;

    gl_FragColor = vec4(col * 1.3, a);
}
`;
