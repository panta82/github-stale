const request = require('request');

const BASE_URL = 'https://api.github.com';

function makeRequest(endpoint, callback) {
	const opts = {
		method: 'GET',
		uri: `${BASE_URL}${endpoint}`,
		json: true,
		headers: {
			'Accept': 'application/vnd.github.v3+json'
		}
	};

	return request(opts, (err, res, body) => {
		if (err) {
			return callback(err);
		}

		return callback(null, body);
	});
}

//***********************************************************************

function GithubCommit() {
	this.author = null;
	this.committer = null;
	this.date = null;
	this.message = null;
}

function listCommits(owner, repo, callback) {
	const endpoint = `/repos/${owner}/${repo}/commits`;
	return makeRequest(endpoint, (err, rawData) => {
		if (err) {
			return callback(err);
		}

		const commits = rawData.map(raw => {
			const commit = new GithubCommit();
			commit.author = raw.commit.author.name;
			commit.committer = raw.commit.committer.name;
			commit.date = new Date(
				Math.max(
					new Date(raw.commit.author.date),
					new Date(raw.commit.committer.date)
				)
			);
			commit.message = raw.commit.message;
			return commit;
		});

		return callback(null, commits);
	});
}

module.exports = {
	GithubCommit,

	listCommits
};