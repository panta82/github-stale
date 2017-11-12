function leftPad(str, length, char = ' ') {
	const targetLen = length - str.length;
	if (targetLen <= 0) {
		return str;
	}
	return Array(targetLen).join(char) + str;
}

module.exports = {
	leftPad
};