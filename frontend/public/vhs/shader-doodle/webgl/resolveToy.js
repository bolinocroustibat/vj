export default (uniform, toy, prop) => {
	if (!toy) return uniform[prop]

	const toyprop = `toy${prop}`
	if (Object.hasOwn(uniform, toyprop)) {
		return uniform[toyprop]
	}

	return uniform[prop]
}
