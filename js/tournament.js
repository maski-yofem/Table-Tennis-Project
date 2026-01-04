let matchState = {
    p1Points: 0,
    p2Points: 0,
    p1Sets: 0,
    p2Sets: 0,
    neededSets: 0,
    currentMatchElement: null,
    p1Name: '',
    p2Name: '',
    matchFinished: false
};

document.addEventListener('DOMContentLoaded', () => {
    const players = JSON.parse(localStorage.getItem('shuffledPlayers'));
    if (players) buildBracket(players);
});

function buildBracket(players) {
    const container = document.getElementById('bracket-container');
    container.innerHTML = '';

    const numPlayers = players.length;
    const rounds = Math.log2(numPlayers);

    for (let r = 1; r <= rounds; r++) {
        const roundDiv = document.createElement('div');
        roundDiv.className = `round round-${r}`;

        const matches = numPlayers / Math.pow(2, r);

        for (let m = 0; m < matches; m++) {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            matchDiv.id = `r${r}-m${m}`;

            const p1 = r === 1 ? players[m * 2] : '?';
            const p2 = r === 1 ? players[m * 2 + 1] : '?';

            matchDiv.innerHTML = `
                <div class="player player-top">${p1}</div>
                <div class="player player-bottom">${p2}</div>
            `;

            matchDiv.onclick = () => {
                if (matchDiv.classList.contains('finished')) return;

                const n1 = matchDiv.querySelector('.player-top').innerText;
                const n2 = matchDiv.querySelector('.player-bottom').innerText;

                if (n1 === '?' || n2 === '?') return;

                if (n1 === 'BYE' || n2 === 'BYE') {
                    advanceWinner(matchDiv, n1 === 'BYE' ? n2 : n1, true);
                } else {
                    openScoreModal(matchDiv, n1, n2);
                }
            };

            roundDiv.appendChild(matchDiv);
        }

        container.appendChild(roundDiv);
    }
}

/* =========================
   MODAL / SCORE
========================= */

function openScoreModal(matchEl, p1, p2) {
    const format = parseInt(localStorage.getItem('matchFormat')) || 5;

    matchState = {
        p1Points: 0,
        p2Points: 0,
        p1Sets: 0,
        p2Sets: 0,
        neededSets: Math.ceil(format / 2),
        currentMatchElement: matchEl,
        p1Name: p1,
        p2Name: p2,
        matchFinished: false
    };

    document.getElementById('modal-p1-name').innerText = p1;
    document.getElementById('modal-p2-name').innerText = p2;

    updateModalUI();
    document.getElementById('score-modal').style.display = 'flex';
}

function changePoint(player, value) {
    if (matchState.matchFinished) return;

    if (player === 'p1') {
        matchState.p1Points = Math.max(0, matchState.p1Points + value);
    } else {
        matchState.p2Points = Math.max(0, matchState.p2Points + value);
    }

    if (
        (matchState.p1Points >= 11 || matchState.p2Points >= 11) &&
        Math.abs(matchState.p1Points - matchState.p2Points) >= 2
    ) {
        if (matchState.p1Points > matchState.p2Points) {
            matchState.p1Sets++;
        } else {
            matchState.p2Sets++;
        }

        matchState.p1Points = 0;
        matchState.p2Points = 0;

        if (
            matchState.p1Sets === matchState.neededSets ||
            matchState.p2Sets === matchState.neededSets
        ) {
            matchState.matchFinished = true;
        }
    }

    updateModalUI();
}

function updateModalUI() {
    document.getElementById('points-p1').innerText = matchState.p1Points;
    document.getElementById('points-p2').innerText = matchState.p2Points;
    document.getElementById('sets-p1').innerText = matchState.p1Sets;
    document.getElementById('sets-p2').innerText = matchState.p2Sets;

    document.getElementById('confirm-score-btn').disabled = !matchState.matchFinished;
}

function finalizeMatch() {
    const winner =
        matchState.p1Sets > matchState.p2Sets
            ? matchState.p1Name
            : matchState.p2Name;

    markMatchFinished(matchState.currentMatchElement, winner);
    advanceWinner(matchState.currentMatchElement, winner);
    closeModal();
}

function closeModal() {
    document.getElementById('score-modal').style.display = 'none';
}

/* =========================
   VISUAL RESULT
========================= */

function markMatchFinished(matchEl, winner) {
    const p1El = matchEl.querySelector('.player-top');
    const p2El = matchEl.querySelector('.player-bottom');

    if (p1El.innerText === winner) {
        p1El.classList.add('winner');
        p2El.classList.add('loser');
    } else {
        p2El.classList.add('winner');
        p1El.classList.add('loser');
    }

    matchEl.classList.add('finished');
}

/* =========================
   BRACKET FLOW
========================= */

function advanceWinner(matchEl, winner, isBye = false) {
    if (!isBye) {
        markMatchFinished(matchEl, winner);
    }

    const [rPart, mPart] = matchEl.id.split('-');
    const round = parseInt(rPart.substring(1));
    const match = parseInt(mPart.substring(1));

    const nextMatch = document.getElementById(
        `r${round + 1}-m${Math.floor(match / 2)}`
    );

    if (nextMatch) {
        const slot =
            match % 2 === 0 ? '.player-top' : '.player-bottom';
        nextMatch.querySelector(slot).innerText = winner;
    } else {
        displayChampion(winner);
    }
}

function displayChampion(name) {
    document.getElementById('bracket-container').innerHTML = `
        <div class="champion-display-final">
            <h1>🏆 CAMPEÃO 🏆</h1>
            <h2>${name}</h2>
            <button onclick="window.location.href='../index.html'">
                Novo Torneio
            </button>
        </div>
    `;
}
