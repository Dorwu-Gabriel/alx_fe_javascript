// --- Quote Data Management with Local Storage ---
let quotes = [];
const LOCAL_STORAGE_KEY = 'dynamicQuotes';
const CATEGORY_FILTER_KEY = 'lastCategoryFilter';

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
    populateCategories();
    // If the new quote's category matches the filter, show it; else, re-filter
    if (document.getElementById('categoryFilter').value === category || document.getElementById('categoryFilter').value === "all") {
        filterQuotes();
    } else {
        filterQuotes();
    }
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
                populateCategories();
                filterQuotes();
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

// --- Category Filtering ---
let selectedCategory = "all"; // Track the currently selected category

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    // Get unique categories
    const categories = [...new Set(quotes.map(q => q.category))];
    // Save current selection
    const currentValue = categoryFilter.value || selectedCategory;
    // Remove all except "All Categories"
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
    // Restore selection if possible
    if (categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
        selectedCategory = currentValue;
    } else {
        categoryFilter.value = "all";
        selectedCategory = "all";
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const category = document.getElementById('categoryFilter').value;
    selectedCategory = category; // Update the selected category
    localStorage.setItem(CATEGORY_FILTER_KEY, category);
    let filteredQuotes = quotes;
    if (category !== "all") {
        filteredQuotes = quotes.filter(q => q.category === category);
    }
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = `<span>No quotes found for this category.</span>`;
        return;
    }
    // Show a random quote from filtered
    const idx = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[idx];
    document.getElementById('quoteDisplay').innerHTML = `
        <span>${quote.text}</span>
        <span class="category">${quote.category}</span>
    `;
    // Save last quote index for session (optional, only for filtered set)
    saveLastQuoteIndex(quotes.indexOf(quote));
}

// --- Dynamically create the Add Quote Form (if needed) ---
function createAddQuoteForm() {
    // Prevent duplicate form
    if (document.getElementById('addQuoteForm')) return;

    const form = document.createElement('div');
    form.id = 'addQuoteForm';
    form.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button id="addQuoteBtn">Add Quote</button>
    `;
    // Insert after quoteDisplay
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.parentNode.insertBefore(form, quoteDisplay.nextSibling);

    // Attach event listener
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// --- Server Simulation and Data Syncing ---
const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Simulated endpoint
const SYNC_INTERVAL = 30000; // 30 seconds

let syncNotificationTimeout = null;

// Simulate fetching quotes from a server (using JSONPlaceholder for demo)
async function fetchQuotesFromServer() {
    try {
        // Simulate server quotes as posts with title as text and body as category
        const response = await fetch(SERVER_API_URL);
        const serverData = await response.json();
        // Convert server data to quote format (simulate only first 10 for demo)
        const serverQuotes = serverData.slice(0, 10).map(post => ({
            text: post.title,
            category: post.body ? post.body.substring(0, 20) : "General"
        }));
        return serverQuotes;
    } catch (error) {
        console.error('Failed to fetch from server:', error);
        return [];
    }
}

// Merge server quotes with local, server takes precedence on conflicts (by text)
function mergeQuotes(serverQuotes, localQuotes) {
    const merged = [...serverQuotes];
    const serverTexts = new Set(serverQuotes.map(q => q.text));
    localQuotes.forEach(q => {
        if (!serverTexts.has(q.text)) {
            merged.push(q);
        }
    });
    return merged;
}

// Show notification to user
function showSyncNotification(message) {
    let notif = document.getElementById('syncNotification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'syncNotification';
        notif.style.position = 'fixed';
        notif.style.top = '10px';
        notif.style.right = '10px';
        notif.style.background = '#4a90e2';
        notif.style.color = '#fff';
        notif.style.padding = '10px 18px';
        notif.style.borderRadius = '6px';
        notif.style.zIndex = 1000;
        notif.style.boxShadow = '0 2px 8px rgba(44,62,80,0.12)';
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.style.display = 'block';
    clearTimeout(syncNotificationTimeout);
    syncNotificationTimeout = setTimeout(() => {
        notif.style.display = 'none';
    }, 4000);
}

// Periodically sync with server
async function syncWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    if (serverQuotes.length === 0) return;

    const localQuotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    const mergedQuotes = mergeQuotes(serverQuotes, localQuotes);

    // If merged is different from local, update and notify
    if (JSON.stringify(mergedQuotes) !== JSON.stringify(localQuotes)) {
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        filterQuotes();
        showSyncNotification('Quotes updated from server (server data takes precedence).');
    }
}

// Manual conflict resolution (optional, for demo)
function manualResolveConflicts() {
    fetchQuotesFromServer().then(serverQuotes => {
        if (serverQuotes.length === 0) {
            showSyncNotification('No server data available for conflict resolution.');
            return;
        }
        // For demo, just overwrite with server data
        quotes = mergeQuotes(serverQuotes, quotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        showSyncNotification('Conflicts resolved: Server data merged.');
    });
}

// Add a button for manual conflict resolution
function addConflictResolutionButton() {
    if (document.getElementById('resolveConflictsBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'resolveConflictsBtn';
    btn.textContent = 'Resolve Conflicts (Manual)';
    btn.style.margin = '10px';
    btn.onclick = manualResolveConflicts;
    const container = document.querySelector('.centered-buttons') || document.body;
    container.appendChild(btn);
}

// --- Initialization ---
window.addEventListener('DOMContentLoaded', function() {
    loadQuotes();
    populateCategories();

    // Restore last selected filter
    const lastFilter = localStorage.getItem(CATEGORY_FILTER_KEY) || "all";
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = lastFilter;
        categoryFilter.addEventListener('change', filterQuotes);
    }

    // Show filtered quotes or all
    filterQuotes();

    document.getElementById('newQuote').addEventListener('click', filterQuotes);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
    document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);

    // Add conflict resolution button
    addConflictResolutionButton();

    // Start periodic sync
    setInterval(syncWithServer, SYNC_INTERVAL);
    // Initial sync
    syncWithServer();
});
