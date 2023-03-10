// github api url
const API_URL = 'https://api.github.com';

async function fetchWithCache(url){
    const data = getLocalStorageWithExpiration(url);

    if (rating === null) {
        const response = await fetch(url);
        const data = await response.json();
        setLocalStorageWithExpiration(url, { 'data': data }, 3600);

        return data
    }

    return data.data
}

export async function getRepoData(repoOwner, repoName) {
    const repoUrl = `${API_URL}/repos/${repoOwner}/${repoName}`;

    try {
        return await fetchWithCache(repoUrl);
    } catch (error) {
        console.error(error);
    }
}

export async function rateRepo(repoOwner, repoName) {
    const repoData = await getRepoData(repoOwner, repoName);

    const isArchived = !repoData.archived ? 0.1 : -0.2;
    const stars = repoData.stargazers_count ?? 0;
    const commits = await countCommits(repoOwner, repoName) ?? 0;
    const createdAt = new Date(repoData.created_at);
    const currentDate = new Date();
    const daysSinceCreation = (currentDate - createdAt) / (1000 * 60 * 60 * 24);
    const commitFrequency = commits / daysSinceCreation;
    const contributors = await countContributors(repoOwner, repoName) ?? 0;
    const forks = repoData.forks_count;
    const releases = await countReleases(repoOwner, repoName) ?? 0;
    const openIssues = repoData.open_issues_count ?? 0;
    const closedIssues = repoData.closed_issues_count ?? 0;
    const issueFrequency = (openIssues + closedIssues) / daysSinceCreation;
    const watchers = repoData.subscribers_count;
    const branches = await countBranches(repoOwner, repoName);

    const rating = (
        (stars / 5) + (commits / 7) + (commitFrequency / 5) +
        (contributors / 4) + (forks / 5) + (releases / 3) +
        (issueFrequency / 7) + (watchers / 10) + isArchived + (branches / 3)
    ) / (stars + commits + commitFrequency + contributors + forks + releases +
        issueFrequency + watchers + isArchived + branches)

    return rating.toFixed(4);
}

async function countStats(owner, repo, stat) {
    const data = await fetchWithCache(`${API_URL}/repos/${owner}/${repo}/${stat}`)
    return data.length;
}

async function getHashtags(owner, repo) {
  try {
    const data = await fetchWithCache(`${API_URL}/repos/${owner}/${repo}`)
    return data.topics;
  } catch (error) {
    console.error(error);
  }
}

async function getDescription(owner, repo) {
  try {
    const data = await fetchWithCache(`${API_URL}/repos/${owner}/${repo}`)
    return data.description;
  } catch (error) {
    console.error(error);
  }
}

function extractUniqueKeywords(text){
    const commonWords = [
        'i','a','about','an','and','are','as','at','be',
        'by','com','de','en','for','from','how','in','is',
        'it','la','of','on','or','that','the','this','to',
        'was','what','when','where','who','will','with','und',
        'the','www'
    ];
    text = text.toLowerCase();
    text = text.replace(/[^\w\d ]/g, '');
    let result = text.split(' ');
    result = result.filter(function (word) {
        return commonWords.indexOf(word) === -1;
    });
    return result.unique();
}

async function searchAlternateRepositories(owner, repo) {
  const query= extractUniqueKeywords(getDescription(owner, repo));
  const hashtags = getHashtags(owner, repo);
  try {
    let searchQuery = `${query}`;
    if (hashtags && hashtags.length > 0) {
      searchQuery += `+topic:${hashtags.join('+topic:')}`;
    }
    const data = await fetchWithCache(`${API_URL}/search/repositories?q=${searchQuery}`)
    return data.items;
  } catch (error) {
    console.error(error);
  }
}

async function countCommits(owner, repo) {
    return await countStats(owner, repo, 'commits');
}

async function countContributors(owner, repo) {
    return await countStats(owner, repo, 'contributors');
}

async function countReleases(owner, repo) {
    return await countStats(owner, repo, 'releases');
}

async function countBranches(owner, repo) {
    return await countStats(owner, repo, 'branches');
}

export async function countDiscussions(repoOwner, repoName) {
    const discussionsUrl = `${API_URL}/repos/${repoOwner}/${repoName}/issues?state=closed`;
    let discussions = [];
    let page = 1;
    const MAX_LOOP = 10;

    for (let index = 0; index < MAX_LOOP; index++) {
        const pageDiscussions = await fetchWithCache(`${discussionsUrl}&page=${page}`);

        if (pageDiscussions.length === 0) {
            break;
        } else {
            discussions = discussions.concat(pageDiscussions);
            page++;
        }
    }

    return discussions.filter(discussion => discussion.pull_request).length;
}

export function parseRepoUrl(url) {
    const urlString = url.toString();
    const match = urlString.match(/^https:\/\/github.com\/([^\/]+)\/([^\/]+)/);

    if (match) {
        return {
            repoOwner: match[1].toLowerCase(),
            repoName: match[2].toLowerCase()
        };
    } else {
        console.error('Invalid repository URL');
    }
}

function dropHtml(rating) {
    deleteElementById('rate-div-id');
    return `
        <div id='rate-div-id'>
            <hr/>
                <h2 class="mb-3 h4"><a href='https://github.com/Sanix-Darker/raterepo'>repo-score</a>:</h2>
                <h1>???${rating}???</h1>
            <hr/>
        </div>
    `;
}

function setDivHtml(rating) {
    const sidebar = document.querySelector(".Layout-sidebar");
    const afterDescription = sidebar.querySelectorAll(".BorderGrid-cell")[0].querySelectorAll("p")[0]
    const rateDiv = document.createElement("div");
    rateDiv.innerHTML = dropHtml(rating);

    afterDescription.parentNode.insertBefore(rateDiv, afterDescription.nextSibling);
}

function setLocalStorageWithExpiration(key, value, ttl) {
    value.expiration = Date.now() + ttl;
    localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorageWithExpiration(key) {
    const value = JSON.parse(localStorage.getItem(key));
    if (!value || (value.expiration && Date.now() > value.expiration)) {
        return null;
    }
    return value;
}

function deleteElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

setInterval(() => {
    // The rendering here !
    if (typeof document != 'undefined') {
        const repoUrl = window.location.href;
        const {
            repoOwner,
            repoName
        } = parseRepoUrl(repoUrl);

        // Retrieve the value from localStorage
        const rating = getLocalStorageWithExpiration(`${repoOwner}---${repoName}`);

        // The value will be null if the TTL has expired
        if (rating === null) {
            // gonna make tones of await http calls here
            rateRepo(repoOwner, repoName).then(rating => {
                // We catch
                setLocalStorageWithExpiration(`${repoOwner}---${repoName}`, {
                    'rating': rating
                }, 360);
                // we set the rating value
                setDivHtml(rating);
            });
        } else {
            // since we're accessing now the rating object
            setDivHtml(rating.rating);
        }
    }
}, 5000);
