void main() {
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;

	// Every other row darkened — visible scanlines
	float scan = step(0.5, fract(gl_FragCoord.y * 0.5));
	float lineAlpha = (1.0 - scan) * 0.7;

	// Soft secondary scan band that drifts
	float drift = sin(uv.y * 80.0 + u_time * 6.0) * 0.5 + 0.5;
	float driftAlpha = drift * 0.12;

	vec2 centered = uv - 0.5;
	centered.x *= u_resolution.x / u_resolution.y;
	float vig = smoothstep(0.25, 0.85, length(centered));
	float vigAlpha = vig * 0.85;

	float alpha = max(max(lineAlpha, vigAlpha), driftAlpha);
	gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
}
