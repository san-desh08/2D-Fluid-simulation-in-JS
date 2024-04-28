// Uniform declaration for the texture sampler to read from
uniform sampler2D read;

// Uniform declarations for bias and scale factors (unused in this shader)
uniform vec3 bias;  // Bias factor (not used in this shader)
uniform vec3 scale; // Scale factor (not used in this shader)

// Interpolated texture coordinate from the vertex shader
varying vec2 texCoord;

// Constants
const float PI = 3.1415926535897932384626433832795;

// Function to convert HSV color to RGB color
vec3 hsv2rgb(vec3 c) 
{
    // Pre-defined vector K
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    
    // Calculate intermediate values
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    
    // Mix the components based on hue, saturation, and value
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Custom atan2 function to handle special cases
float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

// Function to convert Cartesian coordinates to polar coordinates
vec2 rec2pol(vec2 vec)
{
    // Calculate magnitude (distance from the origin)
    float mag = sqrt(vec.x * vec.x + vec.y * vec.y);
    
    // Calculate direction (angle)
    // Map the angle range from [-PI, PI] to [0, 1] for HSV representation
    float dir = (atan2(-vec.y, -vec.x) / PI) * 0.5 + 0.5;
    
    // Return polar coordinates as a vector (angle, magnitude)
    return vec2(dir, mag);
}

void main()
{
    // Sample the texture and convert Cartesian coordinates to polar coordinates
    vec2 pol = rec2pol(texture2D(read, texCoord).xy);
    
    // Convert polar coordinates (angle, magnitude) to RGB color using HSV representation
    // Set saturation to 1.0 (fully saturated color)
    vec3 rgbColor = hsv2rgb(vec3(pol.x, 1.0, pol.y));
    
    // Output the resulting RGB color as the fragment color
    gl_FragColor = vec4(rgbColor, 1.0);
}
