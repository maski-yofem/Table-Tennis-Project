let matchState = {
    p1Points: 0, p2Points: 0, p1Sets: 0, p2Sets: 0,
    neededSets: 0, currentMatchElement: null,
    p1Name: '', p2Name: '', matchFinished: false
};

document.addEventListener('DOMContentLoaded', () => {
    const players = JSON.parse(localStorage.getItem('shuffledPlayers'));
    if (players && players.length > 0) {
        buildBracket(players);
    } else {
        document.getElementById('bracket-container').innerHTML = "<h2>Erro: Jogadores não encontrados.</h2>";
    }
});

function buildBracket(players) {
    const container = document.getElementById('bracket-container');
    container.innerHTML = ''; // Clear the "Loading" screen.

    const numPlayers = players.length;
    const rounds = Math.log2(numPlayers);

    for (let r = 1; r <= rounds; r++) {
        const roundDiv = document.createElement('div');
        roundDiv.className = `round round-${r}`;
        const matchesInRound = numPlayers / Math.pow(2, r);

        for (let m = 0; m < matchesInRound; m++) {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            matchDiv.id = `r${r}-m${m}`;

            const p1 = r === 1 ? players[m * 2] : '?';
            const p2 = r === 1 ? players[m * 2 + 1] : '?';

            matchDiv.innerHTML = `
                <div class="player player-top" onclick="openModal('${matchDiv.id}')">
                    <span class="name">${p1}</span>
                    <span class="score">-</span>
                </div>
                <div class="player player-bottom" onclick="openModal('${matchDiv.id}')">
                    <span class="name">${p2}</span>
                    <span class="score">-</span>
                </div>
            `;
            roundDiv.appendChild(matchDiv);
            if (r === 1) checkNextMatchForBye(matchDiv);
        }
        container.appendChild(roundDiv);
    }
}

function openModal(matchId) {
    const matchEl = document.getElementById(matchId);
    const p1 = matchEl.querySelector('.player-top .name').innerText;
    const p2 = matchEl.querySelector('.player-bottom .name').innerText;

    if (p1 === '?' || p2 === '?' || p1 === 'BYE' || p2 === 'BYE' || matchEl.classList.contains('finished')) return;

    matchState.currentMatchElement = matchEl;
    matchState.p1Name = p1;
    matchState.p2Name = p2;
    matchState.p1Points = 0; matchState.p2Points = 0;
    matchState.p1Sets = 0; matchState.p2Sets = 0;
    matchState.matchFinished = false;

    const format = localStorage.getItem('matchFormat') || '3';
    matchState.neededSets = Math.ceil(parseInt(format) / 2);

    document.getElementById('modal-p1-name').innerText = p1;
    document.getElementById('modal-p2-name').innerText = p2;
    updateModalDisplay();
    document.getElementById('score-modal').style.display = 'flex';
}

function updateModalDisplay() {
    document.getElementById('points-p1').innerText = matchState.p1Points;
    document.getElementById('points-p2').innerText = matchState.p2Points;
    document.getElementById('sets-p1').innerText = matchState.p1Sets;
    document.getElementById('sets-p2').innerText = matchState.p2Sets;
    document.getElementById('confirm-score-btn').disabled = !matchState.matchFinished;
}

function changePoint(player, amount) {
    if (matchState.matchFinished && amount > 0) return;
    if (player === 'p1') matchState.p1Points = Math.max(0, matchState.p1Points + amount);
    else matchState.p2Points = Math.max(0, matchState.p2Points + amount);
    checkSetWinner();
    updateModalDisplay();
}

function checkSetWinner() {
    const p1 = matchState.p1Points;
    const p2 = matchState.p2Points;
    if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
        if (p1 > p2) matchState.p1Sets++;
        else matchState.p2Sets++;
        matchState.p1Points = 0; matchState.p2Points = 0;
        if (matchState.p1Sets === matchState.neededSets || matchState.p2Sets === matchState.neededSets) {
            matchState.matchFinished = true;
        }
    }
}

function finalizeMatch() {
    const winner = matchState.p1Sets > matchState.p2Sets ? matchState.p1Name : matchState.p2Name;
    advanceWinner(matchState.currentMatchElement, winner, false, matchState.p1Sets, matchState.p2Sets);
    closeModal();
}

function closeModal() {
    document.getElementById('score-modal').style.display = 'none';
}

function markMatchFinished(matchEl, winner, s1, s2) {
    matchEl.classList.add('finished');
    const p1Score = matchEl.querySelector('.player-top .score');
    const p2Score = matchEl.querySelector('.player-bottom .score');
    if (p1Score) p1Score.innerText = s1;
    if (p2Score) p2Score.innerText = s2;

    matchEl.querySelectorAll('.player').forEach(row => {
        const nameSpan = row.querySelector('.name');
        const currentName = nameSpan.innerText.trim();
        if (currentName === winner) {
            nameSpan.classList.add('winner-highlight');
        } else if (currentName !== '?' && currentName !== '') {
            nameSpan.classList.add('loser-highlight');
        }
    });
}

function advanceWinner(matchEl, winner, isBye = false, s1 = '', s2 = '') {
    markMatchFinished(matchEl, winner, isBye ? '' : s1, isBye ? '' : s2);
    const [rPart, mPart] = matchEl.id.split('-');
    const round = parseInt(rPart.substring(1));
    const match = parseInt(mPart.substring(1));
    const nextMatch = document.getElementById(`r${round + 1}-m${Math.floor(match / 2)}`);

    if (nextMatch) {
        const slot = match % 2 === 0 ? '.player-top' : '.player-bottom';
        nextMatch.querySelector(slot + ' .name').innerText = winner;
        checkNextMatchForBye(nextMatch);
    } else {
        displayChampion(winner);
    }
}

function checkNextMatchForBye(matchEl) {
    const p1 = matchEl.querySelector('.player-top .name').innerText;
    const p2 = matchEl.querySelector('.player-bottom .name').innerText;
    if (p1 !== '?' && p2 !== '?' && (p1 === 'BYE' || p2 === 'BYE')) {
        const winner = p1 === 'BYE' ? p2 : p1;
        setTimeout(() => advanceWinner(matchEl, winner, true), 100);
    }
}

function displayChampion(winner) {
    // Hide the tournament content.
    const header = document.querySelector('.tournament-header');
    const bracket = document.getElementById('bracket-container');
    if (header) header.style.display = 'none';
    if (bracket) bracket.style.display = 'none';

    const container = document.querySelector('.tournament-screen');
    
    // Remove previous display if it exists to avoid duplication.
    const oldDisplay = document.getElementById('champion-display');
    if (oldDisplay) oldDisplay.remove();

    const championDiv = document.createElement('div');
    championDiv.id = 'champion-display';
    
    championDiv.innerHTML = `
        <div style="font-size: 7em; margin-bottom: 20px;">🏆</div>
        <h1>GRANDE CAMPEÃO</h1>
        <h2>${winner}</h2>
        <button class="btn-restart" onclick="resetTournament()">NOVO TORNEIO</button>
    `;
    
    container.appendChild(championDiv);
}

// RESET FUNCTION
function resetTournament() {
    localStorage.clear(); 

    window.location.href = '../index.html'; 
}