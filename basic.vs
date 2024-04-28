

// Varying variable to pass texture coordinates to the fragment shader
varying vec2 texCoord;

// Simple orthogonal projection vertex shader
void main()
{
    // Pass the texture coordinates to the fragment shader
    texCoord = uv;
    
    // Calculate the position of the vertex in clip space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
