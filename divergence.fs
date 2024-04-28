//About: Divergence shader for fluid simulation

// Uniform declaration for the velocity field
uniform sampler2D velocity;

// Uniform declaration for the size of the grid and the scale factor
uniform vec2 gridSize;
uniform float gridScale;

// Fragment shader to calculate the divergence of the velocity field
void main()
{
    // Calculate UV coordinates of the current fragment
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    // Calculate offsets for neighboring texels in x and y directions
    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // Fetch velocity values from neighboring texels
    float vl = texture2D(velocity, uv - xOffset).x;
    float vr = texture2D(velocity, uv + xOffset).x;
    float vb = texture2D(velocity, uv - yOffset).y;
    float vt = texture2D(velocity, uv + yOffset).y;

    // Calculate the scale factor for the finite difference scheme
    float scale = 0.5 / gridScale;

    // Calculate the divergence using finite difference scheme
    float divergence = scale * (vr - vl + vt - vb);

    // Output the divergence value as the red channel of the output color
    gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
