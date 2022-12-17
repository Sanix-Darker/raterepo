// github api url
const API_URL = 'https://api.github.com';

export async function getRepoData(repoOwner, repoName) {
  const repoUrl = `${API_URL}/repos/${repoOwner}/${repoName}`;

  try {
    const response = await fetch(repoUrl);
    const repoData = await response.json();

    return repoData;
  } catch (error) {
    console.error(error);
  }
}

export async function rateRepo(repoOwner, repoName) {
  const repoData = await getRepoData(repoOwner, repoName);

  const stars = repoData.stargazers_count;
  const commits = repoData.total_commits;
  const createdAt = new Date(repoData.created_at);
  const currentDate = new Date();
  const daysSinceCreation = (currentDate - createdAt) / (1000 * 60 * 60 * 24);
  const commitFrequency = commits / daysSinceCreation;
  const contributors = repoData.contributors ? repoData.contributors.length : 0;
  const forks = repoData.forks_count;
    const releases = repoData.releases ? repoData.releases.length : 0;
  const openIssues = repoData.open_issues_count;
  const closedIssues = repoData.closed_issues_count;
  const issueFrequency = (openIssues + closedIssues) / daysSinceCreation;
  const watchers = repoData.subscribers_count;

  return (stars / 10) + (commits / 10) + (commitFrequency / 2) + (contributors / 5) + (forks / 5) + (releases / 2) + (issueFrequency / 5) + (watchers / 10);
}

export async function getResolvedDiscussions(repoOwner, repoName) {
  const discussionsUrl = `${API_URL}/repos/${repoOwner}/${repoName}/issues?state=closed`;
  let discussions = [];
  let page = 1;

  while (true) {
    const response = await fetch(`${discussionsUrl}&page=${page}`);
    const pageDiscussions = await response.json();

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


async function main() {
    // the rendering here !
    if (document){
        const sidebar = document.querySelector(".Layout-sidebar");
        const afterDescription = sidebar.querySelectorAll(".BorderGrid-cell")[0].querySelectorAll("p")[0]
        const rateDiv = document.createElement("div");

        const repoUrl = window.location.href;
        const { repoOwner, repoName } = parseRepoUrl(repoUrl);
        const rating = await rateRepo(repoOwner, repoName);

        rateDiv.setAttribute("class", "rate-div")
        rateDiv.innerHTML = `
            <hr/>
                <h2 class="mb-3 h4">rate</h2>
                <h1>${rating}</h1>
            <hr/>
        `;

        afterDescription.parentNode.insertBefore(rateDiv, afterDescription.nextSibling);
    }
}

main()
