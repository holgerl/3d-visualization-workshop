varying vec3 normalVec;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.x, position.y, position.z, 1.0);
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
