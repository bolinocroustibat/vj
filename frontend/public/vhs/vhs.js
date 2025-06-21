uniform sampler2D noise;
uniform sampler2D white;
uniform vec2 white_resolution;

float ramp(float y, float start, float end) {
	float inside = step(start, y) - step(end, y);
	float fact = (y - start) / (end - start) * inside;
	return (1.0 - fact) * inside;
}

vec2 coverScreen(vec2 fragCoord, vec2 resolution, float aspect) {
	vec2 uv = 0.5 * (2.0 * fragCoord - resolution);
	if (resolution.x / resolution.y > aspect) {
		uv = 0.5 - uv / vec2(resolution.x, -resolution.x / aspect);
	} else {
		uv = 0.5 - uv / vec2(resolution.y * aspect, -resolution.y);
	}
	return uv;
}

float vignette(vec2 uv, float t) {
	float vigAmt = 3.0 + 0.3 * sin(t + 5.0 * cos(t * 5.0));
	return (1.0 - vigAmt * (uv.y - 0.5) * (uv.y - 0.5)) * (1.0 - vigAmt * (uv.x - 0.5) * (uv.x - 0.5));
}

float crtLines(vec2 uv, float t) {
	return ((12.0 + mod(uv.y * 30.0 + t, 1.0)) / 13.0);
}

float getNoise(vec2 p, float t) {
	float s = texture2D(noise, vec2(1.0, 2.0 * cos(t)) * t * 8.0 + p * 1.0).x;
	s *= s;
	return s;
}

float getStripes(vec2 uv, float t) {
	float noi = getNoise(uv * vec2(0.5, 1.0) + vec2(1.0, 3.0), t);
	return ramp(mod(uv.y * 4.0 + t / 2.0 + sin(t + sin(t * 0.63)), 1.0), 0.5, 0.6) * noi;
}

void main() {
	float aspect = white_resolution.x / white_resolution.y;
	vec2 uv = coverScreen(gl_FragCoord.xy, u_resolution, aspect);
	vec4 vid_out = texture2D(white, uv);

	vid_out.rgb += getStripes(uv, u_time);
	vid_out.rgb += getNoise(uv * 3.0, u_time) / 3.0;
	vid_out.rgb *= vignette(uv, u_time);
	vid_out.rgb *= crtLines(uv, u_time);

	gl_FragColor = vid_out;
}
