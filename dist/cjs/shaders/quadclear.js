"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quadclearf = exports.quadclearv = void 0;
const quadclearv = `void main() { gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0); }`;
exports.quadclearv = quadclearv;
const quadclearf = `void main() { gl_FragColor = vec4(vec3(0.0), 0.15); }`;
exports.quadclearf = quadclearf;
//# sourceMappingURL=quadclear.js.map