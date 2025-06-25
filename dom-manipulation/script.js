// --- Quote Data Management with Local Storage ---
let quotes = [];
const LOCAL_STORAGE_KEY = 'dynamicQuotes';

// Load quotes from localStorage or use defaults
function loadQuotes() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        quotes = JSON.parse(stored);
    } else {
        quotes = [
            { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
            { text: "Success is not in what you have, but who you are.", category: "Success" },
            { text: "Dream big and dare to fail.", category: "Inspiration" }
        ];
        saveQuotes();
    }
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// --- Session Storage for Last Viewed Quote ---
function saveLastQuoteIndex(index) {
    sessionStorage.setItem('lastQuoteIndex', index);
}

function getLastQuoteIndex() {
    return sessionStorage.getItem('lastQuoteIndex');
}

// --- DOM Manipulation ---
function showRandomQuote() {
    if (quotes.length === 0) return;
    let idx = Math.floor(Math.random() * quotes.length);
    saveLastQuoteIndex(idx);
    displayQuote(idx);
}

function displayQuote(idx) {
    const quote = quotes[idx];
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <span>${quote.text}</span>
        <span class="category">${quote.category}</span>
    `;
}

// --- Add Quote Form ---
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (!text || !category) {
        alert('Please enter both quote and category.');
        return;
    }
    quotes.push({ text, category });
    saveQuotes();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    showRandomQuote();
}

// --- JSON Export ---
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- JSON Import ---
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                showRandomQuote();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format.');
            }
        } catch {
            alert('Failed to import quotes. Invalid JSON.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// --- Initialization ---
window.onload = function() {
    loadQuotes();

    // Restore last viewed quote if available
    const lastIdx = getLastQuoteIndex();
    if (lastIdx && quotes[lastIdx]) {
        displayQuote(lastIdx);
    } else {
        showRandomQuote();
    }

    document.getElementById('newQuote').onclick = showRandomQuote;
    document.getElementById('addQuoteBtn').onclick = addQuote;
    document.getElementById('exportBtn').onclick = exportToJsonFile;
    document.getElementById('importFile').onchange = importFromJsonFile;
};