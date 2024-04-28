//About: Advection shader for fluid simulation

// Uniform declarations
uniform sampler2D velocity;    // Input velocity field
uniform sampler2D advected;    // Input advected field

uniform vec2 gridSize;         // Size of the grid
uniform float gridScale;       // Grid scale factor

uniform float timestep;        // Time step for advection
uniform float dissipation;     // Dissipation factor

// Function to perform bilinear interpolation on a texture
vec2 bilerp(sampler2D d, vec2 p)
{
    // Determine the four nearest texels
    vec4 ij; // i0, j0, i1, j1
    ij.xy = floor(p - 0.5) + 0.5;
    ij.zw = ij.xy + 1.0;

    // Calculate UV coordinates and fetch texel values
    vec4 uv = ij / gridSize.xyxy;
    vec2 d11 = texture2D(d, uv.xy).xy;
    vec2 d21 = texture2D(d, uv.zy).xy;
    vec2 d12 = texture2D(d, uv.xw).xy;
    vec2 d22 = texture2D(d, uv.zw).xy;

    // Calculate interpolation factors
    vec2 a = p - ij.xy;

    // Perform bilinear interpolation
    return mix(mix(d11, d21, a.x), mix(d12, d22, a.x), a.y);
}

void main()
{
    // Calculate UV coordinates
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    // Calculate scale factor for time step
    float scale = 1.0 / gridScale;

    // Trace point back in time using advection equation
    vec2 p = gl_FragCoord.xy - timestep * scale * texture2D(velocity, uv).xy;

    // Apply exponential dissipation and perform bilinear interpolation
    gl_FragColor = vec4(dissipation * bilerp(advected, p), 0.0, 1.0);
}
