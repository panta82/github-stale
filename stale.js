const request = require('request');
const yaal = require('yaal');

const githubApi = require('./github_api');

// TODO: Url through args?
const URL = 'https://github.com/markerikson/redux-ecosystem-links/blob/master/entity-collection-management.md';

const PARALLELISM = 5;

main(URL);

// ************************************************************************

function GithubRepo(owner, name) {
	this.owner = owner;
	this.name = name;
}

function GithubRepoInfo(repo, commits) {
	/**@type GithubRepo */
	this.repo = repo;
	
	/**@type GithubCommit[] */
	this.commits = commits;
}

function fatal(err) {
	console.error(err);
	process.exit(1);
}

function main(url) {
	request.get(URL, (err, res, txt) => {
		if (err) {
			return fatal(err);
		}

		const repos = extractGithubRepos(txt);
		
		yaal(fetchRepoInfo, repos, PARALLELISM, yaal.FATAL, (err, infos) => {
			if (err) {
				return fatal(err);
			}

			console.log(infos);
		});
	});
}

function extractGithubRepos(txt) {
	const regex = /https?:\/\/github.com\/([a-zA-Z0-9\-\_]+)\/([a-zA-Z0-9\-\_]+)/ig;
	let match;
	const results = {};
	while (match = regex.exec(txt)) {
		results[match[0]] = new GithubRepo(match[1], match[2]);
	}
	
	return Object.keys(results);
}

/**
 * @param {GithubRepo} repo 
 * @param {*} callback
 */
function fetchRepoInfo(repo, callback) {
	console.log(`Processing ${repo.owner}/${repo.name}...`);

	githubApi.listCommits(repo.owner, repo.name, (err, commits) => {
		if (err) {
			return callback(err);
		}

		const info = new GithubRepoInfo(repo, commits);
		return callback(null, info);
	});
}
