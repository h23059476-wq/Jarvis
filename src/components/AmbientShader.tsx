import React, { useEffect, useRef } from 'react';

interface AmbientShaderProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  theme?: 'dark' | 'light' | 'neon' | 'cyber';
  audioAmplitude?: number; // 0.0 to 1.0
  speedMultiplier?: number;
}

export const AmbientShader: React.FC<AmbientShaderProps> = ({
  isListening = false,
  isSpeaking = false,
  theme = 'dark',
  audioAmplitude = 0,
  speedMultiplier = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let animationFrameId: number;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_amplitude;
      uniform float u_is_listening;
      uniform float u_is_speaking;
      uniform float u_is_light_mode;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.x *= u_resolution.x / u_resolution.y;

        float boost = 1.0 + u_amplitude * 2.5 + u_is_listening * 0.8 + u_is_speaking * 1.2;
        float t = u_time * 0.25 * boost;

        float n1 = snoise(uv * 2.0 + vec2(t * 0.45, -t * 0.28));
        float n2 = snoise(uv * 3.8 - vec2(t * 0.18, t * 0.35));
        float n = (n1 + n2 * 0.5) * 0.5 + 0.5;

        // Immersive UI Dark vs Light Mode Base Color Palettes
        vec3 baseColor = vec3(0.008, 0.024, 0.09); // Deep #020617 canvas
        vec3 cyanAccent = vec3(0.024, 0.71, 0.83); // Immersive Cyan #06b6d4
        vec3 indigoAccent = vec3(0.39, 0.40, 0.94); // Immersive Indigo #6366f1

        if (u_is_light_mode > 0.5) {
          baseColor = vec3(0.94, 0.96, 0.99); // Slate-100
          cyanAccent = vec3(0.03, 0.55, 0.68);
          indigoAccent = vec3(0.40, 0.42, 0.85);
        }

        vec3 col = baseColor;
        col = mix(col, indigoAccent, smoothstep(0.2, 0.85, n) * (0.45 + u_is_speaking * 0.35));
        col = mix(col, cyanAccent, smoothstep(0.45, 0.98, n1) * (0.48 + u_is_listening * 0.4 + u_amplitude * 0.55));

        // Center vignette
        vec2 center = gl_FragCoord.xy / u_resolution.xy - vec2(0.5);
        float vignette = 1.0 - dot(center, center) * (u_is_light_mode > 0.5 ? 0.9 : 1.4);
        col *= smoothstep(0.0, 1.0, vignette);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const ampLocation = gl.getUniformLocation(program, 'u_amplitude');
    const listenLocation = gl.getUniformLocation(program, 'u_is_listening');
    const speakLocation = gl.getUniformLocation(program, 'u_is_speaking');
    const lightLocation = gl.getUniformLocation(program, 'u_is_light_mode');

    function handleResize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    let startTime = performance.now();

    function render() {
      const elapsed = (performance.now() - startTime) * 0.001 * speedMultiplier;
      gl!.uniform1f(timeLocation, elapsed);
      gl!.uniform2f(resolutionLocation, canvas!.width, canvas!.height);
      gl!.uniform1f(ampLocation, audioAmplitude);
      gl!.uniform1f(listenLocation, isListening ? 1.0 : 0.0);
      gl!.uniform1f(speakLocation, isSpeaking ? 1.0 : 0.0);
      gl!.uniform1f(lightLocation, theme === 'light' ? 1.0 : 0.0);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, theme, audioAmplitude, speedMultiplier]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="bg-canvas"
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      />
      <div className="scanlines fixed inset-0 pointer-events-none z-0 opacity-40" />
    </>
  );
};
