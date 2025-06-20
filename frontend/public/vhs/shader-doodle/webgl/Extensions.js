export default function Extensions(gl) {
	const extensions = {}
	const getter = gl.getExtension.bind(gl)

	return {
		get: (name) => {
			if (extensions[name] !== undefined) return extensions[name]

			const extension =
				getter(name) || getter(`MOZ_${name}`) || getter(`WEBKIT_${name}`)
			if (extension === null) {
				console.warn(`<shader-doodle /> ${name} extension not supported.`)
			}
			extensions[name] = extension

			return extension
		},
	}
}
