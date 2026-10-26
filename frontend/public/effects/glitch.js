float hash1(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main() {
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	float tick = floor(u_time * 14.0);
	// Fire often enough to read as a glitch overlay
	float burst = step(0.45, hash1(tick * 0.37));
	float alpha = 0.0;
	vec3 color = vec3(0.0);

	for (int i = 0; i < 5; i++) {
		float fi = float(i);
		float y = hash1(tick + fi * 19.1);
		float height = 0.008 + hash1(tick * 1.7 + fi) * 0.05;
		float band = step(abs(uv.y - y), height) * burst;
		float pick = hash1(tick + fi * 3.3);
		vec3 bandColor = pick < 0.33
			? vec3(0.4, 1.0, 1.0)
			: (pick < 0.66 ? vec3(1.0, 0.2, 0.75) : vec3(1.0));
		float bandAlpha = band * (0.7 + 0.3 * hash1(tick + fi));
		color += bandColor * bandAlpha;
		alpha = max(alpha, bandAlpha);
	}

	// Occasional full-width flash
	float flash = step(0.92, hash1(tick * 2.1)) * 0.35;
	alpha = max(alpha, flash);
	color += vec3(1.0) * flash;

	alpha = min(alpha, 0.95);
	color = alpha > 0.001 ? min(color / alpha, vec3(1.0)) : vec3(0.0);
	gl_FragColor = vec4(color, alpha);
}
