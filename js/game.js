let currentGame = null;
let clickerClicks = 0;

function selectGame(game) {
    currentGame = game;
    
    document.getElementById('gameArea').classList.add('hidden');
    document.getElementById('clickerGame').classList.add('hidden');
    document.getElementById('diceGame').classList.add('hidden');
    document.getElementById('matchingGame').classList.add('hidden');
    
    switch(game) {
        case 'clicker':
            document.getElementById('clickerGame').classList.remove('hidden');
            document.getElementById('clickCount').textContent = '0';
            break;
        case 'dice':
            document.getElementById('diceGame').classList.remove('hidden');
            break;
        case 'matching':
            document.getElementById('matchingGame').classList.remove('hidden');
            initMatchingGame();
            break;
    }
}

function backToMenu() {
    currentGame = null;
    document.getElementById('gameArea').classList.remove('hidden');
    document.getElementById('clickerGame').classList.add('hidden');
    document.getElementById('diceGame').classList.add('hidden');
    document.getElementById('matchingGame').classList.add('hidden');
}

function clickerClick() {
    clickerClicks++;
    currency.addMoney(10 * tools.multiplierLevel);
    tools.recordClickerClick();
    document.getElementById('clickCount').textContent = clickerClicks;
}

function rollDice() {
    const bet = parseInt(document.getElementById('diceBet').value);
    if (currency.getMoney() < bet) {
        alert('お金が足りません！');
        return;
    }
    
    currency.subtractMoney(bet);
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    
    let result = '';
    let winAmount = 0;
    
    if (total === 7 || total === 11) {
        result = '🎉 大当たり！';
        winAmount = bet * 3;
        currency.addMoney(winAmount);
    } else if (total % 2 === 0) {
        result = '✨ 当たり！';
        winAmount = bet;
        currency.addMoney(winAmount);
    } else {
        result = '😢 ハズレ';
    }
    
    const resultHtml = `
        <div style="margin: 20px 0; padding: 20px; background: #f0f0f0; border-radius: 8px;">
            <p style="font-size: 2em; margin: 10px 0;">🎲 ${dice1} + ${dice2} = ${total}</p>
            <p style="font-size: 1.5em; color: #667eea; font-weight: bold;">${result}</p>
            ${winAmount > 0 ? `<p style="color: #4caf50;">+${winAmount.toLocaleString()}円</p>` : ''}
        </div>
    `;
    
    document.getElementById('diceResult').innerHTML = resultHtml;
}

const matchingEmojis = ['🍎', '🍌', '🍇', '🍓', '🍎', '🍌', '🍇', '🍓'];
let matchingCards = [];
let matchedPairs = 0;
let flippedCards = [];

function initMatchingGame() {
    const grid = document.getElementById('matchingGrid');
    grid.innerHTML = '';
    
    const shuffled = matchingEmojis.sort(() => Math.random() - 0.5);
    
    matchingCards = shuffled.map((emoji, index) => ({
        id: index,
        emoji: emoji,
        isFlipped: false,
        isMatched: false
    }));
    
    matchedPairs = 0;
    flippedCards = [];
    
    matchingCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'matching-card';
        cardEl.textContent = '?';
        cardEl.onclick = () => flipMatchingCard(index, cardEl);
        grid.appendChild(cardEl);
    });
}

function flipMatchingCard(index, cardEl) {
    const card = matchingCards[index];
    
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) {
        return;
    }
    
    card.isFlipped = true;
    cardEl.textContent = card.emoji;
    cardEl.classList.add('flipped');
    flippedCards.push(index);
    
    if (flippedCards.length === 2) {
        setTimeout(() => checkMatching(), 500);
    }
}

function checkMatching() {
    const [index1, index2] = flippedCards;
    const card1 = matchingCards[index1];
    const card2 = matchingCards[index2];
    
    const allCards = document.querySelectorAll('.matching-card');
    
    if (card1.emoji === card2.emoji) {
        card1.isMatched = true;
        card2.isMatched = true;
        allCards[index1].classList.add('matched');
        allCards[index2].classList.add('matched');
        matchedPairs++;
        
        if (matchedPairs === 4) {
            setTimeout(() => {
                const reward = 500 * tools.multiplierLevel;
                currency.addMoney(reward);
                alert(`🎉 ゲーム完了！${reward}円獲得！`);
            }, 300);
        }
    } else {
        card1.isFlipped = false;
        card2.isFlipped = false;
        allCards[index1].textContent = '?';
        allCards[index2].textContent = '?';
        allCards[index1].classList.remove('flipped');
        allCards[index2].classList.remove('flipped');
    }
    
    flippedCards = [];
}