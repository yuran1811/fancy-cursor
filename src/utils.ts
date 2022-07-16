import * as THREE from 'three';

class Utils {
  onceMemory: {
    [key: string]: any;
  } = {};

  smoothstep = (t: number) => t * t * (3 - 2 * t);

  once = (tag: string) => {
    if (!this.onceMemory[tag]) {
      this.onceMemory[tag] = true;
      return true;
    }

    return false;
  };

  parseIncludes = (pattern: string): string => {
    const includePattern = /#include <(.*)>/gm;

    const replacer = (pattern: string) => this.parseIncludes(THREE.ShaderChunk[pattern]);

    return pattern.replace(includePattern, replacer);
  };

  last = (arr: any[]) => arr[arr.length - 1];
}

export default Utils;
