class CurrencySystem {
    constructor() {
        this.money = this.loadMoney() || 0;
        this.level = this.loadLevel() || 1;
        this.updateDisplay();
    }

    addMoney(amount) {
        this.money += amount;
        this.updateDisplay();
        this.saveMoney();
        this.checkLevelUp();
    }

    subtractMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateDisplay();
            this.saveMoney();
            return true;
        }
        return false;
    }

    getMoney() {
        return this.money;
    }

    checkLevelUp() {
        const moneyPerLevel = 5000;
        const newLevel = Math.floor(this.money / moneyPerLevel) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.saveLevel();
        }
    }

    updateDisplay() {
        document.getElementById('money').textContent = this.money.toLocaleString() + '円';
        document.getElementById('level').textContent = this.level;
    }

    saveMoney() {
        localStorage.setItem('yudai_money', this.money.toString());
    }

    loadMoney() {
        const saved = localStorage.getItem('yudai_money');
        return saved ? parseInt(saved) : null;
    }

    saveLevel() {
        localStorage.setItem('yudai_level', this.level.toString());
    }

    loadLevel() {
        const saved = localStorage.getItem('yudai_level');
        return saved ? parseInt(saved) : null;
    }
}

const currency = new CurrencySystem();