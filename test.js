import { getRepoData, rateRepo, parseRepoUrl, getResolvedDiscussions } from './raterepo/index.js';
import assert from 'assert';

async function testGetRepoData() {
  const repoData = await getRepoData('sanix-darker', 'split');
  assert.strictEqual(repoData.full_name.toLowerCase(), 'sanix-darker/split');
  assert.strictEqual(typeof repoData.stargazers_count, 'number');
  assert.strictEqual(typeof repoData.created_at, 'string');
  assert.strictEqual(typeof repoData.open_issues_count, 'number');
  assert.strictEqual(typeof repoData.subscribers_count, 'number');
  console.log('testGetRepoData passed');
}

async function testRateRepo() {
  const rating = await rateRepo('sanix-darker', 'split');
  assert.strictEqual(typeof rating, 'number');
  console.log('testRateRepo passed');
}

async function testParseRepoUrl() {
  const url = 'https://github.com/sanix-darker/split';
  const repoData = parseRepoUrl(url);
  assert.strictEqual(repoData.repoOwner, 'sanix-darker');
  assert.strictEqual(repoData.repoName, 'split');
  console.log('testParseRepoUrl passed');
}

async function testGetResolvedDiscussions() {
  const discussions = await getResolvedDiscussions('sanix-darker', 'split');
  assert.strictEqual(typeof discussions, 'number');
  console.log('testGetResolvedDiscussions passed');
}

testGetRepoData();
testRateRepo();
testParseRepoUrl();
testGetResolvedDiscussions();
