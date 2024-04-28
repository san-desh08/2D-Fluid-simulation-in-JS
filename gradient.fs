//About: Gradient shader for fluid simulation

// Uniform declaration for the pressure field (p) and the weight field (w)
uniform sampler2D p;
uniform sampler2D w;

// Uniform declaration for the size of the grid and the scale factor
uniform vec2 gridSize;
uniform float gridScale;

// Fragment shader to calculate the gradient of the pressure field
void main()
{
    // Calculate UV coordinates of the current fragment
    vec2 uv = gl_FragCoord.xy / gridSize.xy;
    
    // Calculate offsets for neighboring texels in x and y directions
    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // Fetch pressure values from neighboring texels
    float pl = texture2D(p, uv - xOffset).x;
    float pr = texture2D(p, uv + xOffset).x;
    float pb = texture2D(p, uv - yOffset).x;
    float pt = texture2D(p, uv + yOffset).x;

    // Calculate the scale factor for the finite difference scheme
    float scale = 0.5 / gridScale;

    // Calculate the gradient of the pressure field
    vec2 gradient = scale * vec2(pr - pl, pt - pb);

    // Fetch the weight value from the weight texture
    vec2 wc = texture2D(w, uv).xy;

    // Calculate the corrected weight value by subtracting the gradient
    // This is used in pressure correction step of the simulation
    gl_FragColor = vec4(wc - gradient, 0.0, 1.0);
}
