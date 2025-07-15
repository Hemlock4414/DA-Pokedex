let currentOffset = 20;
let pokemonPerPage = 20;
let totalPokemonCount = 0;
allPokemon = [];
let filteredPokemon = [];
let isSearching = false;

async function init() {
    await fetchPokeList();
    sortPokemon();
    renderPokemon();
    updateButtonText();
    updateRemainingPokemon();
    hideLoading();
}

async function fetchPokeList() {
    try {
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?offset=0&limit=20");
        let data = await response.json();

        totalPokemonCount = data.count;
        // Pokémon Details sequenziell laden
        for (let i = 0; i < data.results.length; i++) {
            // pokemon Listeneintrag, enthält nur Namen und URL
            let pokemon = data.results[i];  
            let pokemonDetails = await fetchPokeDetails(pokemon.url);
            allPokemon.push(pokemonDetails);
        }

    } catch (error) {
        console.error("Error loading pokemon list:", error);
    }
}

async function fetchPokeDetails(url) {
    try {
        let response = await fetch(url);
        // pokemonData enthält die vollständigen Details eines Pokémon
        let pokemonData = await response.json();   

        // Strukturierte Daten zurückgeben
        return {
            id: pokemonData.id,
            name: pokemonData.name,
            image: pokemonData.sprites.other['official-artwork'].front_default,
            types: pokemonData.types
        };

    } catch (error) {
        console.error("Error loading pokemon data:", error);
    }
}

function createPokemonCard(pokemonData) {

        // ID formatieren
        let pokeId = String(pokemonData.id).padStart(4, '0');

        // Primären Typ für Hintergrundfarbe ermitteln
        let primaryType = pokemonData.types[0].type.name;

        // Typen extrahieren
        let typesHtml = "";
        for (let i = 0; i < pokemonData.types.length; i++) {
            let typeName = pokemonData.types[i].type.name;
            typesHtml += `<span class="type ${typeName}">${typeName}</span> `;
        }

        let card = `
            <div class="poke-card type ${primaryType}">
                <h2 class="poke-name">${pokemonData.name}</h2>
                <img src="${pokemonData.image}" alt="${pokemonData.name}" loading="lazy">
                <div class="type-content">
                    ${typesHtml}
                </div>
                <span class="poke-id">No. ${pokeId}</span>
            </div>
        `;
        return card;
}

function sortPokemon() {
    // Nach ID sortieren (aufsteigend)
    allPokemon.sort((a, b) => a.id - b.id);
}

function renderPokemon() {
    let container = document.getElementById('poke-content');
    
    // Container leeren
    container.innerHTML = '';

    // Alle Pokémon rendern
    allPokemon.forEach(pokemon => {
        let pokemonCard = createPokemonCard(pokemon);
        container.innerHTML += pokemonCard;
    });
}

// Load 20 more pokemon button

async function loadMorePokemon() {

    showLoading();
    await new Promise(resolve => setTimeout(resolve, 400)); 
    // Verzögert die API-Anfrage sodass man den Spinner länger geniessen kann

    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${pokemonPerPage}`);
        let data = await response.json();

        // Neue Pokémon Details laden
        for (let i = 0; i < data.results.length; i++) {
            let pokemon = data.results[i];
            let pokemonDetails = await fetchPokeDetails(pokemon.url);
            allPokemon.push(pokemonDetails);
        }

        currentOffset += pokemonPerPage;
        
        // Pokémon sortieren und rendern
        sortPokemon();
        renderPokemon();
        updateRemainingPokemon();

        // Button verstecken wenn keine weiteren Pokémon verfügbar
        let loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn && data.next === null) {
            loadMoreBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error("Error loading more pokemon:", error);
    } finally {
        hideLoading();
    }
}

function updateButtonText() {
    let loadMoreBtn = document.getElementById('load-more-btn');
    loadMoreBtn.innerText = `LOAD ${pokemonPerPage} MORE`;
}

function updateRemainingPokemon() {
    let remainingPokemon = document.getElementById('poke-remain');
    remainingPokemon.innerText = `${totalPokemonCount - currentOffset} pokemon remaining`;
}

// Such-Funktionen

function handleSearch(event) {
    let searchTerm = event.target.value.toLowerCase();
    let clearIcon = document.getElementById('clear-search');

    // X-Icon anzeigen/verstecken
    if (searchTerm.length > 0) {
        clearIcon.classList.add('show');
    } else {
        clearIcon.classList.remove('show');
    }
    
    if (searchTerm.length >= 3) {
        isSearching = true;
        filteredPokemon = allPokemon.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm) ||
            pokemon.types.some(type => type.type.name.toLowerCase().includes(searchTerm))
        );
        renderFilteredPokemon();
        hideLoadMoreButton();
        showCancelButton();
    } else if (searchTerm.length === 0) {
        // Zurück zur normalen Ansicht
        isSearching = false;
        renderPokemon();
        showLoadMoreButton();
        hideCancelButton();
    }
}

function renderFilteredPokemon() {
    let container = document.getElementById('poke-content');
    container.innerHTML = '';
    
    if (filteredPokemon.length === 0) {
        container.innerHTML = '<p class="no-pokemon-found">No pokemon found</p>';
        return;
    }
    
    filteredPokemon.forEach(pokemon => {
        let pokemonCard = createPokemonCard(pokemon);
        container.innerHTML += pokemonCard;
    });
}

function hideLoadMoreButton() {
    let loadMoreBtn = document.getElementById('load-more-btn');
    let remainingSpan = document.getElementById('poke-remain');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    if (remainingSpan) remainingSpan.style.display = 'none';
}

function showLoadMoreButton() {
    let loadMoreBtn = document.getElementById('load-more-btn');
    let remainingSpan = document.getElementById('poke-remain');
    if (loadMoreBtn) loadMoreBtn.style.display = 'block';
    if (remainingSpan) remainingSpan.style.display = 'block';
}

// Suche abbrechen

function clearSearch() {
    let searchInput = document.getElementById('search-input');
    let clearIcon = document.getElementById('clear-search');
    
    // Suchfeld leeren
    searchInput.value = '';
    clearIcon.classList.remove('show');
    
    // Zur normalen Ansicht zurückkehren
    isSearching = false;
    renderPokemon();
    showLoadMoreButton();
    hideCancelButton();
    
    // Focus zurück auf Suchfeld
    searchInput.focus();
}

function showCancelButton() {
    document.getElementById('cancel-search-btn').style.display = 'block';
}

function hideCancelButton() {
    document.getElementById('cancel-search-btn').style.display = 'none';
}

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
