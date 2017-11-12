const request = require('request');
const yaal = require('yaal');
const moment = require('moment');

const githubApi = require('./github_api');
const tools = require('./tools');

// TODO: Url through args?
const URL = 'https://github.com/markerikson/redux-ecosystem-links/blob/master/entity-collection-management.md';

const PARALLELISM = 5;

const RESERVED_GITHUB_OWNERS = {
	site: 'site',
	security: 'security',
	blog: 'blog',
	about: 'about',
};

main(URL);

// ************************************************************************

function GithubRepo(owner, name) {
	this.owner = owner;
	this.name = name;
}

function GithubRepoInfo(repo, commits) {
	/**@type GithubRepo */
	this.repo = repo;
	
	/**@type GithubCommit */
	this.last_commit = commits[0] || null;
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

		console.log(`Found ${repos.length} repos.`);
		process.stdout.write('Processing...');
		
		yaal(fetchRepoInfo, repos, PARALLELISM, (errs, infos) => {
			console.log();

			if (errs) {
				errs.forEach(err => console.error(err));
			}

			infos.sort((a, b) => {
				return b.last_commit.date - a.last_commit.date;
			});

			infos.forEach(printGithubInfo);
		});
	});
}

/**
 * @param {GithubRepoInfo} info
 */
function printGithubInfo(info) {
	const repoName = tools.leftPad(`https://github.com/${info.repo.owner}/${info.repo.name}`, 70);
	const lastCommit = info.last_commit
		? moment(info.last_commit.date).fromNow()
		: '';
	console.log(repoName + '  ' + lastCommit);
}

function extractGithubRepos(txt) {
	const regex = /https?:\/\/github.com\/([a-zA-Z0-9\-\_]+)\/([a-zA-Z0-9\-\_]+)/ig;
	let match;
	const results = {};
	while (match = regex.exec(txt)) {
		const owner = match[1];
		if (!RESERVED_GITHUB_OWNERS[owner]) {
			results[match[0]] = new GithubRepo(owner, match[2]);
		}
	}
	
	return Object.keys(results).map(key => results[key]);
}

/**
 * @param {GithubRepo} repo 
 * @param {*} callback
 */
function fetchRepoInfo(repo, callback) {
	process.stdout.write('.');

	githubApi.listCommits(repo.owner, repo.name, (err, commits) => {
		if (err) {
			return callback(err);
		}

		const info = new GithubRepoInfo(repo, commits);
		return callback(null, info);
	});
}
