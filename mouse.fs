// Uniform declaration for the texture to read from
uniform sampler2D read;

// Uniform declaration for the size of the grid
uniform vec2 gridSize;

// Uniform declarations for user interaction parameters
uniform vec3 color;   // Color of the splat
uniform vec2 point;   // Center point of the splat
uniform float radius; // Radius of the splat

// Gaussian function to calculate the blending factor based on distance
float gauss(vec2 p, float r)
{
    // Gaussian distribution formula
    return exp(-dot(p, p) / r);
}

void main()
{
    // Calculate UV coordinates of the current fragment
    vec2 uv = gl_FragCoord.xy / gridSize.xy;
    
    // Calculate the vector from the fragment to the center point of the splat
    vec2 coord = point.xy - gl_FragCoord.xy;    
    
    // Calculate the blending factor using the Gaussian function
    // The larger the distance, the smaller the blending factor
    float blendingFactor = gauss(coord, gridSize.x * radius);
    
    // Calculate the color splat by multiplying the user-defined color
    // by the blending factor
    vec3 splat = color * blendingFactor;

    // Read the color from the texture and add the color splat to it
    // to achieve the final color output
    gl_FragColor = vec4(texture2D(read, uv).xyz + splat, 1.0);
}
