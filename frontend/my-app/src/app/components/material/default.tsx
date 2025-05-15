import * as THREE from 'three';

const Gradient = new THREE.ShaderMaterial({
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
      vec3 color1 = vec3(0.0, 0.0, 0.0);
      vec3 color2 = vec3(0.0, 0.0, 0.4);
      vec3 color3 = vec3(0.4, 0.0, 0.5) + sin(time) * 0.5;
      vec3 color4 = vec3(0.9, 0.0, 0.0) + sin(time + uv.x) * 0.5;
      vec3 black = vec3(0.0, 0.0, 0.0);

      // Mix the two colors
      vec3 color = mix(color1, color2, uv.x);
      color = mix(color, color3, uv.y);
      color = mix(color, color4, uv.x * uv.y);
      color = mix(color, black, uv.x * uv.y);

      // Add some noise
      float noise = 0.2;
      float x = uv.x + sin(time) * noise;
      float y = uv.y + cos(time) * noise;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

export default Gradient;
