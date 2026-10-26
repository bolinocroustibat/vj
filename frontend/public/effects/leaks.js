float blob(vec2 uv, vec2 center, float radius) {
	float d = length(uv - center);
	return smoothstep(radius, radius * 0.1, d);
}

void main() {
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	float t = u_time;

	vec2 c1 = vec2(0.2 + 0.2 * sin(t * 0.21), 0.75 + 0.15 * cos(t * 0.17));
	vec2 c2 = vec2(0.82 + 0.14 * cos(t * 0.13), 0.25 + 0.18 * sin(t * 0.19));
	vec2 c3 = vec2(0.5 + 0.25 * sin(t * 0.09 + 1.5), 0.48 + 0.16 * cos(t * 0.11));

	float a1 = blob(uv, c1, 0.55) * 0.65;
	float a2 = blob(uv, c2, 0.42) * 0.55;
	float a3 = blob(uv, c3, 0.7) * 0.4;

	vec3 color = vec3(1.0, 0.4, 0.08) * a1
		+ vec3(1.0, 0.15, 0.35) * a2
		+ vec3(1.0, 0.75, 0.25) * a3;
	float alpha = min(a1 + a2 + a3, 0.85);
	// Straight alpha for SRC_ALPHA blend
	color = alpha > 0.001 ? color / alpha : vec3(0.0);

	gl_FragColor = vec4(color, alpha);
}
