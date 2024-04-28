// Uniform declaration for the input vector x and the input vector b
uniform sampler2D x;
uniform sampler2D b;

// Uniform declaration for the size of the grid
uniform vec2 gridSize;

// Parameters for the Jacobi iteration
uniform float alpha;
uniform float beta;

// Fragment shader to perform Jacobi iteration for solving linear equations
void main()
{
    // Calculate UV coordinates of the current fragment
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    // Calculate offsets for neighboring texels in x and y directions
    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // Fetch values from neighboring texels of vector x
    float xl = texture2D(x, uv - xOffset).x;
    float xr = texture2D(x, uv + xOffset).x;
    float xb = texture2D(x, uv - yOffset).x;
    float xt = texture2D(x, uv + yOffset).x;

    // Fetch value from the corresponding texel of vector b
    float bc = texture2D(b, uv).x;

    // Perform Jacobi iteration: calculate the new value for the current texel of x
    // using values from neighboring texels of x and the corresponding texel of b
    float newValue = (xl + xr + xb + xt + alpha * bc) / beta;

    // Output the new value as the red channel of the output color
    gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);
}
