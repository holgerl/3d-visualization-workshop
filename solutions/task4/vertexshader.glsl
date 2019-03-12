varying vec3 normalVec;
attribute float displacement;

void main() {
  normalVec = normal;

  vec3 displacedPosition = position + normal * displacement;

  vec4 modelSpaceCoordinates = vec4(displacedPosition.xyz, 1.0);
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
