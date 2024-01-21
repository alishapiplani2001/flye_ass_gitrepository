const apiUrl = 'https://api.github.com/users/';
let repositoriesData = {};
let userSocialLinks = {};
let currentPage = 1;
const reposPerPage = 10;

function fetchUser() {
    const username = document.getElementById('username').value;

    if (!username) {
        alert('Please enter a Github username.');
        return;
    }

    const userUrl = `${apiUrl}${username}`;

    // Display "Fetching Repositories..." text
    const userInfoContainer = document.getElementById('user-info');
    userInfoContainer.innerHTML = '<p>Fetching Repositories...</p>';

    // Make API call to fetch user information and profile photo
    $.ajax({
        url: userUrl,
        method: 'GET',
        success: function (userData) {
            const userId = userData.id;
            const avatarUrl = userData.avatar_url;

            // Fetch social links
            fetchSocialLinks(username, userId, avatarUrl);
        },
        error: function (error) {
            console.error('Error fetching user information:', error);
        }
    });
}

function fetchSocialLinks(username, userId, avatarUrl) {
    const socialUrl = `${apiUrl}${username}`;

    // Make API call to fetch user's social links
    $.ajax({
        url: socialUrl,
        method: 'GET',
        success: function (userData) {
            userSocialLinks = {
                githubId: userId,
                avatarUrl: avatarUrl,
                username: userData.login,
                location: userData.location,
                bio: userData.bio,
                twitter: userData.twitter_username,
                website: userData.blog
            };

            // Display user information and fetch repositories
            displayUserInfo(userSocialLinks);
            fetchRepositories();
        },
        error: function (error) {
            console.error('Error fetching social links:', error);
        }
    });
}

function displayUserInfo(userSocialLinks) {
    const userInfoContainer = document.getElementById('user-info');
    userInfoContainer.innerHTML = '';

    const userInfo = document.createElement('div');
    userInfo.innerHTML = `
        <div class="row">
            <div class="col-md-2">
                <img src="${userSocialLinks.avatarUrl}" alt="Profile Photo" class="img-fluid rounded-circle">
            </div>
            <div class="col-md-10">
                <h3>User Information:</h3>
                <p><strong>Username:</strong> ${userSocialLinks.username}</p>
                <p><strong>GitHub ID:</strong> ${userSocialLinks.githubId}</p>
                <p><strong>Location:</strong> ${userSocialLinks.location || 'Not available'}</p>
                <p><strong>Bio:</strong> ${userSocialLinks.bio || 'Not available'}</p>
                <p><strong>Twitter:</strong> ${userSocialLinks.twitter || 'Not available'}</p>
                <p><strong>Website:</strong> ${userSocialLinks.website || 'Not available'}</p>
            </div>
        </div>
    `;

    userInfoContainer.appendChild(userInfo);
}

function fetchRepositories() {
    const username = document.getElementById('username').value;

    if (!username) {
        alert('Please enter a Github username.');
        return;
    }

    const url = `${apiUrl}${username}/repos`;

    // Make API call using jQuery
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            repositoriesData = data;
            displayRepositories(currentPage);
        },
        error: function (error) {
            console.error('Error fetching repositories:', error);
        }
    });
}

function displayRepositories(page) {
    const repositoriesContainer = document.getElementById('repositories');
    repositoriesContainer.innerHTML = '';

    const startIndex = (page - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const currentRepositories = repositoriesData.slice(startIndex, endIndex);

    if (currentRepositories.length === 0) {
        repositoriesContainer.innerHTML = '<p>No repositories found for the given user.</p>';
        return;
    }

    for (let i = 0; i < currentRepositories.length; i += 2) {
        const row = document.createElement('div');
        row.className = 'row mt-3';

        const repo1 = currentRepositories[i];
        const repoCard1 = createRepoCard(repo1);

        row.appendChild(repoCard1);

        if (i + 1 < currentRepositories.length) {
            const repo2 = currentRepositories[i + 1];
            const repoCard2 = createRepoCard(repo2);

            row.appendChild(repoCard2);
        }

        repositoriesContainer.appendChild(row);
    }

    renderPaginationButtons();
}

function createRepoCard(repo) {
    const repoCard = document.createElement('div');
    repoCard.className = 'col-md-6';

    const card = document.createElement('div');
    card.className = 'card';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const repoName = document.createElement('h5');
    repoName.className = 'card-title';
    repoName.innerHTML = `<span style="color: blue;">${repo.name}</span>`;

    const repoDescription = document.createElement('p');
    repoDescription.className = 'card-text';
    repoDescription.textContent = repo.description || 'No description available.';

    cardBody.appendChild(repoName);
    cardBody.appendChild(repoDescription);
    card.appendChild(cardBody);
    repoCard.appendChild(card);

    return repoCard;
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(repositoriesData.length / reposPerPage);
    const paginationContainer = document.getElementById('pagination');

    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary mx-1';
        button.textContent = i;
        button.onclick = function () {
            currentPage = i;
            displayRepositories(currentPage);
        };

        paginationContainer.appendChild(button);
    }
}

// Initial call to display repositories on page load
fetchUser();
