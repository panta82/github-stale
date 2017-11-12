module.exports = {
	github_token: null
};

try {
	const localSettings = require('./settings.local');
	Object.assign(module.exports, localSettings);
}
catch (err) {
	console.warn(`Local settings not found at ./settings.local.js`);
}