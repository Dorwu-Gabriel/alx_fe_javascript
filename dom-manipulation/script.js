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
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    // Get unique categories
    const categories = [...new Set(quotes.map(q => q.category))];
    // Save current selection
    const currentValue = categoryFilter.value;
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
    } else {
        categoryFilter.value = "all";
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const category = document.getElementById('categoryFilter').value;
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
});
