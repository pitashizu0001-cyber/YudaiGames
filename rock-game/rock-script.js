// ===========================
// 石のゲーム - ゲームロジック
// ===========================

class RockGame {
    constructor() {
        // ゲームデータ
        this.rocks = this.loadRocks() || 0;
        this.money = this.loadMoney() || 0;
        this.level = this.loadLevel() || 1;
        this.totalClicks = this.loadTotalClicks() || 0;
        this.totalRocksEarned = this.loadTotalRocksEarned() || 0;
        this.totalMoneyEarned = this.loadTotalMoneyEarned() || 0;

        // アップグレード
        this.clickBoostLevel = this.loadClickBoostLevel() || 0;
        this.autoSellerCount = this.loadAutoSellerCount() || 0;
        this.drillCount = this.loadDrillCount() || 0;
        this.multiplierLevel = this.loadMultiplierLevel() || 1;

        // 定数
        this.BASE_CLICK_VALUE = 1;
        this.BASE_ROCK_PRICE = 1;
        this.AUTO_SELLER_COST = 500;
        this.DRILL_COST = 2000;
        this.MULTIPLIER_COST = 5000;
        this.CLICK_BOOST_COST = 100;

        this.initializeGame();
    }

    initializeGame() {
        this.updateDisplay();
        this.startAutoSellers();
        this.startDrills();
        this.setupEventListeners();
        this.autoSave();
    }

    // ===== クリック処理 =====
    clickRock() {
        const rockValue = this.getClickValue();
        this.rocks += rockValue;
        this.totalClicks++;
        this.totalRocksEarned += rockValue;
        
        this.updateDisplay();
        this.createFloatingText(`+${rockValue}`, 'rock');
        this.saveGame();
    }

    getClickValue() {
        return this.BASE_CLICK_VALUE + this.clickBoostLevel;
    }

    getRockPrice() {
        return Math.floor(this.BASE_ROCK_PRICE * Math.pow(1.02, this.totalMoneyEarned / 1000));
    }

    // ===== 石の売却 =====
    sellRocks(amount) {
        if (amount <= 0) {
            alert('1以上の数値を入力してください');
            return;
        }

        if (this.rocks < amount) {
            alert(`石が足りません。所持数: ${this.rocks}`);\n            return;
        }

        const price = this.getRockPrice();
        const earnedMoney = amount * price;
        
        this.rocks -= amount;
        this.money += earnedMoney;
        this.totalMoneyEarned += earnedMoney;
        this.checkLevelUp();
        
        this.updateDisplay();
        this.createFloatingText(`+${earnedMoney}円`, 'money');
        this.saveGame();
    }

    sellAllRocks() {
        if (this.rocks === 0) {
            alert('石がありません');
            return;
        }
        this.sellRocks(this.rocks);
    }

    // ===== 自動売却機 =====
    buyAutoSeller() {
        if (this.money < this.AUTO_SELLER_COST) {
            alert(`お金が足りません。必要: ${this.AUTO_SELLER_COST}円`);
            return;
        }

        this.money -= this.AUTO_SELLER_COST;
        this.autoSellerCount++;
        this.updateDisplay();
        this.saveGame();
    }

    startAutoSellers() {
        setInterval(() => {
            if (this.autoSellerCount > 0 && this.rocks > 0) {
                const sellCount = Math.min(this.rocks, this.autoSellerCount);
                const price = this.getRockPrice();
                const earnedMoney = sellCount * price;
                
                this.rocks -= sellCount;
                this.money += earnedMoney;
                this.totalMoneyEarned += earnedMoney;
                this.updateDisplay();
            }
        }, 1000);
    }

    // ===== ドリル機械 =====
    buyDrill() {
        if (this.money < this.DRILL_COST) {
            alert(`お金が足りません。必要: ${this.DRILL_COST}円`);
            return;
        }

        this.money -= this.DRILL_COST;
        this.drillCount++;
        this.updateDisplay();
        this.saveGame();
    }

    startDrills() {
        setInterval(() => {
            if (this.drillCount > 0) {
                const rocksPerSecond = this.drillCount * this.multiplierLevel;
                this.rocks += rocksPerSecond;
                this.totalRocksEarned += rocksPerSecond;
                this.updateDisplay();
            }
        }, 1000);
    }

    // ===== クリック強化 =====
    buyClickBoost() {
        const cost = this.CLICK_BOOST_COST * Math.pow(1.15, this.clickBoostLevel);
        if (this.money < cost) {
            alert(`お金が足りません。必要: ${Math.floor(cost)}円`);
            return;
        }

        this.money -= cost;
        this.clickBoostLevel++;
        this.updateDisplay();
        this.saveGame();
    }

    // ===== マルチプライヤー =====
    buyMultiplier() {
        const cost = this.MULTIPLIER_COST * Math.pow(2, this.multiplierLevel - 1);
        if (this.money < cost) {
            alert(`お金が足りません。必要: ${Math.floor(cost)}円`);
            return;
        }

        this.money -= cost;
        this.multiplierLevel++;
        this.updateDisplay();
        this.saveGame();
    }

    // ===== レベルアップチェック =====
    checkLevelUp() {
        const newLevel = Math.floor(this.totalMoneyEarned / 10000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.saveGame();
        }
    }

    // ===== フローティングテキスト =====
    createFloatingText(text, type) {
        const container = document.getElementById('floatingTexts');
        if (!container) return;
        
        const element = document.createElement('div');
        element.className = `floating-text ${type}`;
        element.textContent = text;
        
        const randomX = Math.random() * 100 - 50;
        element.style.left = `calc(50% + ${randomX}px)`;
        element.style.top = '50%';
        
        container.appendChild(element);
        
        setTimeout(() => {\n            element.remove();
        }, 1500);
    }

    // ===== 表示更新 =====
    updateDisplay() {
        const rockPrice = this.getRockPrice();
        const autoSellerRate = this.autoSellerCount * rockPrice * 60;
        const drillRate = this.drillCount * this.multiplierLevel;
        const clickBoostNextCost = Math.floor(this.CLICK_BOOST_COST * Math.pow(1.15, this.clickBoostLevel));
        const multiplierNextCost = Math.floor(this.MULTIPLIER_COST * Math.pow(2, this.multiplierLevel - 1));

        // メイン表示
        document.getElementById('rockCount').textContent = this.formatNumber(this.rocks);
        document.getElementById('money').textContent = this.formatNumber(this.money) + '円';
        document.getElementById('level').textContent = this.level;
        document.getElementById('clickValue').textContent = '+' + this.getClickValue();
        document.getElementById('totalClicks').textContent = this.formatNumber(this.totalClicks);

        // 売却セクション
        document.getElementById('rockPrice').textContent = rockPrice;
        document.getElementById('sellPreview').textContent = this.calculateSellAmount();

        // 自動売却機
        document.getElementById('autoSellCost').textContent = this.AUTO_SELLER_COST;
        document.getElementById('autoSellCount').textContent = this.autoSellerCount;
        document.getElementById('autoSellRate').textContent = this.formatNumber(autoSellerRate);

        // クリック強化
        document.getElementById('clickBoostValue').textContent = '+' + this.getClickValue();
        document.getElementById('clickBoostCost').textContent = clickBoostNextCost;
        document.getElementById('clickBoostLevel').textContent = this.clickBoostLevel;

        // ドリル
        document.getElementById('drillCost').textContent = this.DRILL_COST;
        document.getElementById('drillCount').textContent = this.drillCount;
        document.getElementById('drillRate').textContent = drillRate;

        // マルチプライヤー
        document.getElementById('multiplierLevel').textContent = this.multiplierLevel;
        document.getElementById('multiplierCost').textContent = multiplierNextCost;

        // 統計
        document.getElementById('totalRocksEarned').textContent = this.formatNumber(this.totalRocksEarned);
        document.getElementById('totalMoneyEarned').textContent = this.formatNumber(this.totalMoneyEarned) + '円';
        document.getElementById('currentRockPrice').textContent = rockPrice + '円';
        document.getElementById('totalClicksCount').textContent = this.formatNumber(this.totalClicks);
        document.getElementById('statAutoSellers').textContent = this.autoSellerCount + '台';
        document.getElementById('statDrills').textContent = this.drillCount + '台';
    }

    calculateSellAmount() {
        const sellInput = document.getElementById('sellAmount');
        if (!sellInput) return '0';
        const sellAmount = parseInt(sellInput.value) || 0;
        const price = this.getRockPrice();
        return this.formatNumber(sellAmount * price);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.floor(num).toString();
    }

    // ===== イベントリスナー =====
    setupEventListeners() {
        const sellInput = document.getElementById('sellAmount');
        if (sellInput) {
            sellInput.addEventListener('input', () => {
                document.getElementById('sellPreview').textContent = this.calculateSellAmount();
            });
        }
    }

    // ===== データ保存 =====
    saveGame() {
        localStorage.setItem('rockGame_rocks', this.rocks.toString());
        localStorage.setItem('rockGame_money', this.money.toString());
        localStorage.setItem('rockGame_level', this.level.toString());
        localStorage.setItem('rockGame_totalClicks', this.totalClicks.toString());
        localStorage.setItem('rockGame_totalRocksEarned', this.totalRocksEarned.toString());
        localStorage.setItem('rockGame_totalMoneyEarned', this.totalMoneyEarned.toString());
        localStorage.setItem('rockGame_clickBoostLevel', this.clickBoostLevel.toString());
        localStorage.setItem('rockGame_autoSellerCount', this.autoSellerCount.toString());
        localStorage.setItem('rockGame_drillCount', this.drillCount.toString());
        localStorage.setItem('rockGame_multiplierLevel', this.multiplierLevel.toString());
    }

    autoSave() {
        setInterval(() => {
            this.saveGame();
        }, 10000);
    }

    loadRocks() { return this.loadFromStorage('rockGame_rocks'); }
    loadMoney() { return this.loadFromStorage('rockGame_money'); }
    loadLevel() { return this.loadFromStorage('rockGame_level'); }
    loadTotalClicks() { return this.loadFromStorage('rockGame_totalClicks'); }
    loadTotalRocksEarned() { return this.loadFromStorage('rockGame_totalRocksEarned'); }
    loadTotalMoneyEarned() { return this.loadFromStorage('rockGame_totalMoneyEarned'); }
    loadClickBoostLevel() { return this.loadFromStorage('rockGame_clickBoostLevel'); }
    loadAutoSellerCount() { return this.loadFromStorage('rockGame_autoSellerCount'); }
    loadDrillCount() { return this.loadFromStorage('rockGame_drillCount'); }
    loadMultiplierLevel() { return this.loadFromStorage('rockGame_multiplierLevel'); }

    loadFromStorage(key) {
        const value = localStorage.getItem(key);
        return value ? parseInt(value) : null;
    }

    resetGame() {
        if (confirm('本当にゲームをリセットしますか？')) {
            localStorage.removeItem('rockGame_rocks');
            localStorage.removeItem('rockGame_money');
            localStorage.removeItem('rockGame_level');
            localStorage.removeItem('rockGame_totalClicks');
            localStorage.removeItem('rockGame_totalRocksEarned');
            localStorage.removeItem('rockGame_totalMoneyEarned');
            localStorage.removeItem('rockGame_clickBoostLevel');
            localStorage.removeItem('rockGame_autoSellerCount');
            localStorage.removeItem('rockGame_drillCount');
            localStorage.removeItem('rockGame_multiplierLevel');
            location.reload();
        }
    }
}

// グローバルインスタンス
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new RockGame();
});

// グローバル関数
function clickRock() {
    if (game) game.clickRock();
}

function sellRocks() {
    if (game) {
        const amount = parseInt(document.getElementById('sellAmount').value);
        game.sellRocks(amount);
        document.getElementById('sellAmount').value = 1;
    }
}

function sellAllRocks() {
    if (game) game.sellAllRocks();
}

function buyAutoSeller() {
    if (game) game.buyAutoSeller();
}

function buyDrill() {
    if (game) game.buyDrill();
}

function buyClickBoost() {
    if (game) game.buyClickBoost();
}

function buyMultiplier() {
    if (game) game.buyMultiplier();
}

function toggleStats() {
    const panel = document.getElementById('statsPanel');
    if (panel) panel.classList.toggle('hidden');
}

function resetGame() {
    if (game) game.resetGame();
}
