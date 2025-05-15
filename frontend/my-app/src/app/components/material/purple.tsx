import * as THREE from 'three';

const BlackPurple = new THREE.ShaderMaterial({
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
      uv -= 0.5; // Center the UV coordinates
      uv *= 2.0; // Scale UV for more variation

      vec3 color = vec3(0.0);
      vec2 position = uv;

      // Create purple tones using red and blue channels only
    //   float red = 0.5 + 0.5 * sin(position.x * 10.0 + time);
    //   float blue = 0.5 + 0.5 * sin(position.y * 10.0 - time);
    //   color = vec3(red, 0.0, blue);

      // Blend with black for darker areas
      float intensity = 1.0 - length(position); // Darker towards edges
      color *= smoothstep(0.5, 0.0, intensity);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

export default BlackPurple;
