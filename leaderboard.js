const leaderboardList = document.getElementById('leaderboard-list');
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function displayLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboard.forEach((time, index) => {
        const listItem = document.createElement('li');
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        listItem.innerText = `#${index + 1}: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        leaderboardList.appendChild(listItem);
    });
}

displayLeaderboard();
