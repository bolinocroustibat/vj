float hash1(float n) {
	return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	float aspect = u_resolution.x / u_resolution.y;
	float frame = floor(u_time * 24.0);
	float alpha = 0.0;

	// Thin vertical film scratches (broken, not solid bars)
	for (int i = 0; i < 5; i++) {
		float fi = float(i);
		float show = step(0.4, hash1(floor(frame / 3.0) + fi * 7.3));
		float x = hash1(floor(frame / 8.0) * 2.7 + fi * 19.0);
		float width = (0.6 + hash1(fi * 5.1) * 1.2) / u_resolution.x;
		float line = smoothstep(width * 2.0, 0.0, abs(uv.x - x));
		float gaps = step(0.2, hash2(vec2(floor(uv.y * 60.0), fi * 3.0 + floor(frame / 2.0))));
		alpha = max(alpha, line * gaps * show * 0.85);
	}

	// Tiny round dust speckles (not grid cells)
	for (int j = 0; j < 12; j++) {
		float fj = float(j);
		float seed = floor(frame / 2.0) + fj * 13.7;
		float show = step(0.55, hash1(seed));
		vec2 center = vec2(hash1(seed * 1.9), hash1(seed * 3.3));
		vec2 d = uv - center;
		d.x *= aspect;
		float radius = (0.8 + hash1(seed * 4.1) * 1.6) / u_resolution.y;
		float speck = smoothstep(radius, radius * 0.2, length(d));
		alpha = max(alpha, speck * show * 0.9);
	}

	// Occasional thin horizontal hair
	float hairShow = step(0.72, hash1(floor(frame / 5.0) * 4.4));
	float hy = hash1(floor(frame / 9.0) * 6.1);
	float hx = hash1(floor(frame / 9.0) * 8.2);
	float hw = 0.12 + hash1(frame * 0.01) * 0.2;
	float hairY = smoothstep(1.5 / u_resolution.y, 0.0, abs(uv.y - hy));
	float hairX = step(abs(uv.x - hx), hw);
	alpha = max(alpha, hairY * hairX * hairShow * 0.7);

	gl_FragColor = vec4(vec3(1.0), alpha);
}
