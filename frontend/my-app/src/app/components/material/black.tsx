import * as THREE from 'three';

const Black = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() },
  },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec3 color = vec3(0.0);
      color.r = 0.5 + 0.5 * sin(time + uv.x * 40.0);
      color.g = 0.5 + 0.5 * sin(time + uv.y * 40.0);
      color.b = 0.5 + 0.5 * sin(time + uv.x * 40.0);

      color *= random(0.0, 1.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

export default Black;