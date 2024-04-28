// Uniform declaration for the input vector x and the input vector b
uniform sampler2D x;
uniform sampler2D b;

// Uniform declaration for the size of the grid
uniform vec2 gridSize;

// Parameters for the Jacobi iteration
uniform float alpha; // Scalar multiplier for the input vector b
uniform float beta;  // Scalar divisor for the result of the iteration

void main()
{
    // Calculate UV coordinates of the current fragment
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    // Calculate offsets for neighboring texels in x and y directions
    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // Fetch values from neighboring texels of vector x
    vec2 xl = texture2D(x, uv - xOffset).xy;
    vec2 xr = texture2D(x, uv + xOffset).xy;
    vec2 xb = texture2D(x, uv - yOffset).xy;
    vec2 xt = texture2D(x, uv + yOffset).xy;

    // Fetch value from the corresponding texel of vector b
    vec2 bc = texture2D(b, uv).xy;

    // Perform Jacobi iteration: calculate the new value for the current texel of x
    // using values from neighboring texels of x and the corresponding texel of b
    vec2 newValue = (xl + xr + xb + xt + alpha * bc) / beta;

    // Output the new value as the red and green channels of the output color
    gl_FragColor = vec4(newValue, 0.0, 1.0);
}
