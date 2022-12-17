import { getRepoData, parseRepoUrl, countDiscussions } from './raterepo/index.js';
import assert from 'assert';

async function testGetRepoData() {
  const repoData = await getRepoData('torvalds', 'linux');
  assert.strictEqual(typeof repoData.stargazers_count, 'number');
  assert.strictEqual(typeof repoData.created_at, 'string');
  assert.strictEqual(typeof repoData.open_issues_count, 'number');
  assert.strictEqual(typeof repoData.subscribers_count, 'number');
  console.log('testGetRepoData passed');
}

async function testParseRepoUrl() {
  const url = 'https://github.com/torvalds/linux';
  const repoData = parseRepoUrl(url);
  assert.strictEqual(repoData.repoOwner, 'torvalds');
  assert.strictEqual(repoData.repoName, 'linux');
  console.log('testParseRepoUrl passed');
}

async function testGetResolvedDiscussions() {
  const discussions = await countDiscussions('torvalds', 'linux');
  assert.strictEqual(typeof discussions, 'number');
  console.log('testGetResolvedDiscussions passed');
}

testGetRepoData();
testParseRepoUrl();
testGetResolvedDiscussions();
