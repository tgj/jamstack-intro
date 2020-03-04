const listRepos = async username => {
    const repos = await fetch(
        `https://api.github.com/users/${username}/repos?type=owner&sort=updated`
    )
        .then(response => response.json())
        .catch(error => console.error(error));

    const markup = repos
        .map(repo => `
            <li>
                <a href="${repo.html_url}">${repo.name}</a>
                (🔥 ${repo.stargazers_count})
            </li>
        `)
        .join('');

    const content = document.getElementById('content');
    content.innerHTML = `<ul>${markup}</ul>`;
}

listRepos('tgj');