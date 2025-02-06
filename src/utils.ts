import { ShaderChunk } from 'three';

const Utils = {
  onceMemory: {} as Record<string, boolean>,

  smoothstep: (t: number) => t * t * (3 - 2 * t),

  once: function (tag: string) {
    if (!this.onceMemory[tag]) {
      this.onceMemory[tag] = true;
      return true;
    }

    return false;
  },

  parseIncludes: function (pattern: string) {
    const includePattern = /#include <(.*)>/gm;

    const replacer = (pattern: string) =>
      this.parseIncludes(ShaderChunk[pattern]);

    return pattern.replace(includePattern, replacer);
  },

  last: (arr: any[]) => arr[arr.length - 1],
};

export default Utils;
