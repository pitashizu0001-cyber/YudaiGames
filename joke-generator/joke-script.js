class JokeGenerator {
    constructor() {
        this.currentJoke = null;
        this.jokeCount = 0;
        this.history = this.loadHistory() || [];
        this.safeMode = true;
        this.apiUrl = 'https://official-joke-api.appspot.com/random_joke';
        this.safeModeUrl = 'https://official-joke-api.appspot.com/jokes/general/random';
        
        this.initializeEventListeners();
        this.updateStats();
        this.loadSettings();
    }

    async fetchJoke() {
        const btn = document.getElementById('getJokeBtn');
        btn.disabled = true;
        btn.innerHTML = 'Loading...';

        try {
            const url = this.safeMode ? this.safeModeUrl : this.apiUrl;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            let data = await response.json();
            if (Array.isArray(data)) {
                data = data[0];
            }

            this.currentJoke = data;
            this.displayJoke(data);
            this.addToHistory(data);
            this.jokeCount++;
            this.updateStats();
            
            document.getElementById('copyBtn').style.display = 'inline-block';

        } catch (error) {
            console.error('Joke API Error:', error);
            document.getElementById('jokeContent').innerHTML = '⚠️ Failed to fetch joke';
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Get a Joke 🎭';
        }
    }

    displayJoke(joke) {
        const jokeContent = document.getElementById('jokeContent');
        const jokeType = document.getElementById('jokeType');
        
        let jokeText = '';
        if (joke.setup && joke.punchline) {
            jokeText = `<strong>${joke.setup}</strong><br><br>${joke.punchline}`;
        } else if (joke.joke) {
            jokeText = joke.joke;
        }

        jokeContent.innerHTML = jokeText;
        
        if (joke.type) {
            jokeType.innerHTML = `<span>${joke.type}</span>`;
        } else if (joke.category) {
            jokeType.innerHTML = `<span>${joke.category}</span>`;
        }
    }

    copyToClipboard() {
        if (!this.currentJoke) return;

        let jokeText = '';
        if (this.currentJoke.setup && this.currentJoke.punchline) {
            jokeText = `${this.currentJoke.setup}\n\n${this.currentJoke.punchline}`;
        } else if (this.currentJoke.joke) {
            jokeText = this.currentJoke.joke;
        }

        navigator.clipboard.writeText(jokeText).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = 'Copy to Clipboard 📋';
            }, 2000);
        });
    }

    addToHistory(joke) {
        const historyItem = {
            text: joke.setup && joke.punchline 
                ? `${joke.setup} ${joke.punchline}`
                : joke.joke,
            type: joke.type || joke.category || 'general',
            timestamp: new Date().toLocaleTimeString()
        };

        this.history.unshift(historyItem);
        if (this.history.length > 20) {
            this.history.pop();
        }

        this.saveHistory();
        this.displayHistory();
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No jokes yet</p>';
            return;
        }

        historyList.innerHTML = this.history.map((item) => `
            <div class="history-item">
                ${this.truncateText(item.text, 100)}
                <small>${item.timestamp} | ${item.type}</small>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
    }

    clearHistory() {
        if (confirm('Clear all history?')) {
            this.history = [];
            this.saveHistory();
            this.displayHistory();
        }
    }

    loadSettings() {
        const safeMode = localStorage.getItem('jokeGenerator_safeMode');
        const darkMode = localStorage.getItem('jokeGenerator_darkMode');

        if (safeMode !== null) {
            this.safeMode = safeMode === 'true';
            document.getElementById('safeMode').checked = this.safeMode;
        }

        if (darkMode === 'true') {
            document.body.classList.add('dark-mode');
            document.getElementById('darkMode').checked = true;
        }
    }

    saveSettings() {
        localStorage.setItem('jokeGenerator_safeMode', this.safeMode);
    }

    saveDarkMode(enabled) {
        localStorage.setItem('jokeGenerator_darkMode', enabled);
    }

    saveHistory() {
        localStorage.setItem('jokeGenerator_history', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('jokeGenerator_history');
        return saved ? JSON.parse(saved) : [];
    }

    updateStats() {
        document.getElementById('jokeCount').textContent = this.jokeCount;
    }

    initializeEventListeners() {
        document.getElementById('safeMode').addEventListener('change', (e) => {
            this.safeMode = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('darkMode').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            this.saveDarkMode(e.target.checked);
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.fetchJoke();
            }
        });
    }
}

let jokeGenerator;

document.addEventListener('DOMContentLoaded', function() {
    jokeGenerator = new JokeGenerator();
    jokeGenerator.displayHistory();
});

function fetchJoke() {
    if (jokeGenerator) {
        jokeGenerator.fetchJoke();
    }
}

function copyToClipboard() {
    if (jokeGenerator) {
        jokeGenerator.copyToClipboard();
    }
}

function clearHistory() {
    if (jokeGenerator) {
        jokeGenerator.clearHistory();
    }
}