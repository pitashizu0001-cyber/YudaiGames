class ToolsSystem {
    constructor() {
        this.autoClickerCount = this.loadAutoClickerCount() || 0;
        this.multiplierLevel = this.loadMultiplierLevel() || 1;
        this.autoSaveEnabled = true;
        this.gameStats = this.loadGameStats() || {
            clickerClicks: 0,
            diceSpins: 0,
            matchingGames: 0
        };

        this.initializeAutoClicker();
        this.updateToolDisplay();
    }

    initializeAutoClicker() {
        if (this.autoClickerCount > 0) {
            this.startAutoClicker();
        }
    }

    startAutoClicker() {
        if (this.autoClickerInterval) {
            clearInterval(this.autoClickerInterval);
        }

        const incomePerSecond = 10 * this.autoClickerCount * this.multiplierLevel;
        
        this.autoClickerInterval = setInterval(() => {
            const earnPerTick = (10 * this.autoClickerCount * this.multiplierLevel) / 100;
            currency.addMoney(earnPerTick);
        }, 100);

        this.updateToolDisplay();
    }

    buyAutoClicker() {
        const cost = 1000;
        if (currency.subtractMoney(cost)) {
            this.autoClickerCount++;
            this.saveAutoClickerCount();
            this.startAutoClicker();
            this.updateToolDisplay();
            return true;
        } else {
            alert('お金が足りません！');
            return false;
        }
    }

    buyMultiplier() {
        const cost = 5000 * this.multiplierLevel;
        if (currency.subtractMoney(cost)) {
            this.multiplierLevel++;
            this.saveMultiplierLevel();
            this.startAutoClicker();
            this.updateToolDisplay();
            return true;
        } else {
            alert('お金が足りません！');
            return false;
        }
    }

    updateToolDisplay() {
        document.getElementById('autoClickerCount').textContent = this.autoClickerCount;
        document.getElementById('multiplierLevel').textContent = this.multiplierLevel + '倍';
        document.getElementById('multiplierCost').textContent = (5000 * this.multiplierLevel).toLocaleString();
    }

    saveAutoClickerCount() {
        localStorage.setItem('yudai_autoClickerCount', this.autoClickerCount.toString());
    }

    loadAutoClickerCount() {
        const saved = localStorage.getItem('yudai_autoClickerCount');
        return saved ? parseInt(saved) : null;
    }

    saveMultiplierLevel() {
        localStorage.setItem('yudai_multiplierLevel', this.multiplierLevel.toString());
    }

    loadMultiplierLevel() {
        const saved = localStorage.getItem('yudai_multiplierLevel');
        return saved ? parseInt(saved) : null;
    }

    recordClickerClick() {
        this.gameStats.clickerClicks++;
        this.saveGameStats();
    }

    saveGameStats() {
        localStorage.setItem('yudai_gameStats', JSON.stringify(this.gameStats));
    }

    loadGameStats() {
        const saved = localStorage.getItem('yudai_gameStats');
        return saved ? JSON.parse(saved) : null;
    }
}

const tools = new ToolsSystem();

function buyAutoClicker() {
    tools.buyAutoClicker();
}

function buyMultiplier() {
    tools.buyMultiplier();
}

function toggleAutoSave() {
    tools.autoSaveEnabled = !tools.autoSaveEnabled;
    document.getElementById('autoSaveStatus').textContent = tools.autoSaveEnabled ? '有効' : '無効';
}

function showStats() {
    const stats = {
        money: currency.getMoney(),
        level: currency.level,
        autoClickerCount: tools.autoClickerCount,
        multiplierLevel: tools.multiplierLevel
    };
    const statsContent = `
        <ul style="text-align: left; font-size: 1.1em; line-height: 1.8;">
            <li><strong>現在のお金:</strong> ${stats.money.toLocaleString()}円</li>
            <li><strong>レベル:</strong> ${stats.level}</li>
            <li><strong>自動クリッカー台数:</strong> ${stats.autoClickerCount}台</li>
            <li><strong>マルチプライヤー:</strong> ${stats.multiplierLevel}倍</li>
        </ul>
    `;
    document.getElementById('statsContent').innerHTML = statsContent;
    document.getElementById('statsModal').classList.remove('hidden');
}

function closeStats() {
    document.getElementById('statsModal').classList.add('hidden');
}