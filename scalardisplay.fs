// Uniform declaration for the texture sampler to read from
uniform sampler2D read;

// Uniform declarations for bias and scale factors
uniform vec3 bias;  // Bias factor added to the sampled color
uniform vec3 scale; // Scale factor applied to the sampled color

// Interpolated texture coordinate from the vertex shader
varying vec2 texCoord;

void main()
{
    // Sample the color from the texture using the interpolated texture coordinate
    vec4 sampledColor = texture2D(read, texCoord);
    
    // Apply bias and scale factors to the sampled color
    // The bias factor is added, and the scale factor is multiplied
    // to each component (R, G, B) of the sampled color
    vec3 adjustedColor = bias + scale * sampledColor.xyz;

    // Output the adjusted color as the fragment color
    // Alpha value is set to 1.0 (fully opaque)
    gl_FragColor = vec4(adjustedColor, 1.0);
}
