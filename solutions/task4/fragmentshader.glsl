uniform float time;
varying vec3 normalVec;

float normalize(float min, float max, float value) {
  return (value - min) / (max - min);
}

void main() {
  vec3 color = 0.5 * normalVec + 0.5;
  float alpha = normalize(-1.0, 1.0, sin(0.1 * time));

  gl_FragColor = vec4(color, alpha);
}
