let currentOffset = 20;
let pokemonPerPage = 20;
let totalPokemonCount = 0;
let allPokemon = [];
let filteredPokemon = [];
let isSearching = false;
let currentImageIndex = 0;

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

        for (let i = 0; i < data.results.length; i++) {

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
        let pokemonData = await response.json();   
        return {
            id: pokemonData.id,
            name: pokemonData.name,
            image: pokemonData.sprites.other['official-artwork'].front_default,
            types: pokemonData.types,
            abilities: pokemonData.abilities,
            height: pokemonData.height,
            weight: pokemonData.weight,
            base_experience: pokemonData.base_experience,
            stats: pokemonData.stats,
            moves: pokemonData.moves
        };
    } catch (error) {
        console.error("Error loading pokemon data:", error);
    }
}

function createPokemonCard(pokemonData) {

        let pokeId = String(pokemonData.id).padStart(4, '0');
        let primaryType = pokemonData.types[0].type.name;

        let typesHtml = "";
        for (let i = 0; i < pokemonData.types.length; i++) {
            let typeName = pokemonData.types[i].type.name;
            typesHtml += getTypeBadgeTemplate(typeName);
        }
        return getPokemonCardTemplate(pokemonData, pokeId, primaryType, typesHtml);
}

function sortPokemon() {
    allPokemon.sort((a, b) => a.id - b.id);
}

function renderPokemon() {
    let container = document.getElementById('poke-content');
    
    container.innerHTML = '';

    allPokemon.forEach(pokemon => {
        let pokemonCard = createPokemonCard(pokemon);
        container.innerHTML += pokemonCard;
    });
}

async function loadMorePokemon() {
    showLoading();
    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${pokemonPerPage}`);
        let data = await response.json();

        for (let i = 0; i < data.results.length; i++) {
            let pokemon = data.results[i];
            let pokemonDetails = await fetchPokeDetails(pokemon.url);
            allPokemon.push(pokemonDetails);
        }
        currentOffset += pokemonPerPage;
        sortPokemon();
        renderPokemon();
        updateRemainingPokemon();
        handleLoadMoreButton(data.next);

    } catch (error) {
        console.error("Error loading more pokemon:", error);
    } finally {
        hideLoading();
    }
}

function handleLoadMoreButton(hasNext) {
    let loadMoreBtn = document.getElementById('load-more-btn');
    
    if (loadMoreBtn && hasNext === null) {
        loadMoreBtn.style.display = 'none';
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

function handleSearch(event) {
    let searchTerm = event.target.value.toLowerCase();
    updateClearIcon(searchTerm);
    toggleSearchTooltip(searchTerm);

    if (event.key === 'Enter' && searchTerm.length >= 3) {
        performAPISearch(searchTerm);
        return;
    }
    if (searchTerm.length === 0) {
        resetSearch();
        hideSearchTooltip();
    }
}

function toggleSearchTooltip(searchTerm) {
    const tooltip = document.getElementById('search-tooltip');
    if (searchTerm.length > 0) {
        tooltip.classList.add('show');
    } else {
        tooltip.classList.remove('show');
    }
}

function updateClearIcon(searchTerm) {
    let clearIcon = document.getElementById('clear-search');
    clearIcon.classList.toggle('show', searchTerm.length > 0);
}

async function performAPISearch(searchTerm) {
    isSearching = true;
    showLoading();

    try {
        let allPokemonNames = await fetchAllPokemonNames();
        let matchingNames = allPokemonNames.filter(pokemon => 
            pokemon.name.includes(searchTerm.toLowerCase())
        );
        
        if (matchingNames.length > 0) {
            let pokemonDetailsPromises = matchingNames.map(pokemon => 
                fetchPokeDetails(pokemon.url)
            );
            let pokemonDetails = await Promise.all(pokemonDetailsPromises);
            handleSearchSuccess(pokemonDetails);
        } else {
            handleSearchNotFound();
        }
    } catch (error) {
        console.error("Error searching for pokemon:", error);
        handleSearchError();
    } finally {
        hideLoading();
    }
}

function createPokemonDetailsObject(pokemonData) {
    return {
        id: pokemonData.id,
        name: pokemonData.name,
        image: pokemonData.sprites.other['official-artwork'].front_default,
        types: pokemonData.types,
        abilities: pokemonData.abilities,
        height: pokemonData.height,
        weight: pokemonData.weight,
        base_experience: pokemonData.base_experience,
        stats: pokemonData.stats,
        moves: pokemonData.moves
    };
}

async function fetchAllPokemonNames() {
    try {
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1302");
        let data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching all pokemon names:", error);
        throw error;
    }
}

function handleSearchSuccess(pokemonDetailsList) {
    filteredPokemon = pokemonDetailsList;
    updateUIForSearchResults();
}

function handleSearchNotFound() {
    filteredPokemon = [];
    updateUIForSearchResults();
}

function handleSearchError() {
    filteredPokemon = [];
    updateUIForSearchResults();
}

function updateUIForSearchResults() {
    renderFilteredPokemon();
    hideLoadMoreButton();
    showCancelButton();
}

function resetSearch() {
    isSearching = false;
    renderPokemon();
    showLoadMoreButton();
    hideCancelButton();
    hideSearchTooltip();
}

function renderFilteredPokemon() {
    let container = document.getElementById('poke-content');
    container.innerHTML = '';
    
    if (filteredPokemon.length === 0) {
        container.innerHTML = noPokemonFoundTemplate();
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

function clearSearch() {
    let searchInput = document.getElementById('search-input');
    let clearIcon = document.getElementById('clear-search');
    
    searchInput.value = '';
    clearIcon.classList.remove('show');
    
    isSearching = false;
    renderPokemon();
    showLoadMoreButton();
    hideCancelButton();
    hideSearchTooltip();
    
    searchInput.focus();
}

function hideSearchTooltip() {
    const tooltip = document.getElementById('search-tooltip');
    tooltip.classList.remove('show');
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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleOverlay() {
    let overlay = document.getElementById('overlay-pokemon');
    if (overlay.style.display === 'flex') {
        overlay.style.display = 'none';
    } else {
        overlay.style.display = 'flex';
    }
}