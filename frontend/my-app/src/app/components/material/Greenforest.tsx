import * as THREE from 'three';

const GreenForest = new THREE.ShaderMaterial({
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
      vec3 color1 = vec3(0.0, 0.2, 0.0);
      vec3 color2 = vec3(0.0, 0.5, 0.0);
      vec3 color3 = vec3(0.0, 0.8, 0.0) + sin(time) * 0.5;
      vec3 color4 = vec3(0.0, 1.0, 0.0) + sin(time + uv.x) * 0.5;

      vec3 color = mix(color1, color2, uv.x);
      color = mix(color, color3, uv.y);
      color = mix(color, color4, uv.x * uv.y);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

export default GreenForest;
