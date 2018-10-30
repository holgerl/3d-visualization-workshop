uniform float time;
uniform vec3 light;

varying vec3 positionVec;
varying vec3 normalVec;
varying float positionOffset;
varying float lightOffset;

void main() {
    vec3 normal = normalize(normalVec);
    vec3 lightPos = vec3(light.xy, light.z + lightOffset);
    vec3 lightDir = normalize(lightPos - positionVec);
    float diffuse = max(0.0, dot(lightDir, normal));

    vec3 color = mix(vec3(0.0, 0.25, 0.0), vec3(0.0, 1.0, 0.0), positionOffset);
    vec3 finalColor = (clamp(diffuse, .5, 1.0) - .5) * 2.5 * color;

    gl_FragColor = vec4(finalColor, 1.0);
}
