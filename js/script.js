let playersTournament = [];

function addPlayer() {
    const inputElement = document.getElementById('new-player');
    const name = inputElement.value.trim();
    if (name.length > 0) {
        playersTournament.push(name);
        inputElement.value = '';
        inputElement.focus();
        renderPlayersList();
    } else {
        alert("Please, insert a valid name.");
    }
}

// TOTAL RESTORATION OF YOUR VISUAL LOGIC
function renderPlayersList() {
    const visualList = document.getElementById('list-players-visual');
    visualList.innerHTML = '';

    playersTournament.forEach((name, index) => {
        const newLi = document.createElement('li');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        newLi.appendChild(nameSpan);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add('remove-player-btn'); 

        removeButton.onclick = function () {
            removePlayer(index);
        };

        newLi.appendChild(removeButton);
        visualList.appendChild(newLi);
    });

    totalPlayers();
}

function removePlayer(index) {
    playersTournament.splice(index, 1);
    renderPlayersList();
}

function totalPlayers() {
    const el = document.getElementById('total-players');
    if(el) el.innerText = `Total: ${playersTournament.length} players`;
}

function initiateSwitching() {
    if (playersTournament.length < 2) {
        alert("Please insert at least 2 names.");
        return;
    }
    // Save the format selection.
    localStorage.setItem('matchFormat', document.getElementById('match-format').value);

    let players = [...playersTournament];
    players = verifyNumberPlayers(players);
    shuffle(players);
    localStorage.setItem('shuffledPlayers', JSON.stringify(players));
    window.location.href = './tournament.html';
}

function verifyNumberPlayers(players) {
    const nextPower = Math.pow(2, Math.ceil(Math.log2(players.length)));
    while (players.length < nextPower) { players.push("BYE"); }
    return players;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Enter Key Support
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('new-player');
    if(input) input.addEventListener('keydown', (e) => { if(e.key === 'Enter') addPlayer(); });
});