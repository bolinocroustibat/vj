float rand(vec2 co) {
	return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
	float frame = floor(u_time * 24.0);
	float n = rand(gl_FragCoord.xy * 0.85 + frame * 19.0);
	// Straight alpha: shader-doodle blends with SRC_ALPHA
	float strength = 0.35;
	gl_FragColor = vec4(vec3(n), strength);
}
