let currentOffset = 20;
let pokemonPerPage = 20;
let totalPokemonCount = 0;
allPokemon = [];
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
                <img src="${pokemonData.image}" alt="${pokemonData.name}" loading="lazy" onclick="openOverlay(${pokemonData.id})">
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

    // Verzögert die API-Anfrage sodass man den Spinner länger geniessen kann
    // await new Promise(resolve => setTimeout(resolve, 300)); 

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

    // Container leeren
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

// Pokemon Overlay

function toggleOverlay() {
    let overlay = document.getElementById('overlay-pokemon');
    if (overlay.style.display === 'flex') {
        overlay.style.display = 'none';
    } else {
        overlay.style.display = 'flex';
    }
}

function openOverlay(pokemonId) {
    // Finde das Pokémon anhand der ID
    let pokemonToShow = isSearching ? filteredPokemon : allPokemon;
    let pokemonIndex = pokemonToShow.findIndex(pokemon => pokemon.id === pokemonId);
    
    if (pokemonIndex === -1) return;
    
    // Setze den aktuellen Bildindex
    currentImageIndex = pokemonIndex;
    
    // Hole das Overlay-Element
    let overlayRef = document.getElementById('overlay-pokemon');
    
    // Füge das große Bild zum Overlay hinzu
    overlayRef.innerHTML = getOverlayTemplate(currentImageIndex);
    
    // Zeige das Overlay an
    overlayRef.style.display = 'flex';
}

function getOverlayTemplate(imageIndex) {
    // Bestimme welches Array verwendet werden soll
    let pokemonToShow = isSearching ? filteredPokemon : allPokemon;
    let currentPokemon = pokemonToShow[imageIndex];

    let primaryType = currentPokemon.types[0].type.name;
    
    return `
        <div class="overlay-pokemon-content type ${primaryType}" onclick="noPropagation(event)">
            <div class="overlay-pokemon-header">
                <button class="close-btn" onclick="toggleOverlay()">
                    <img src="./assets/icons/close_white.png" alt="Close">
                </button>
                <div class="overlay-pokemon-title">
                    <button class="nav-btn" onclick="navigateImage(-1)">
                        <img src="./assets/icons/arrow_back_white.png" alt="Back">
                    </button>
                    <h2 class="overlay-pokemon-name">${currentPokemon.name}</h2>
                    <button class="nav-btn" onclick="navigateImage(1)">
                        <img src="./assets/icons/arrow_forward_white.png" alt="Forward">
                    </button>
                </div>
            </div>
            <img class="overlay-pokemon-img" src="${currentPokemon.image}" alt="${currentPokemon.name}">
            <div class="overlay-pokemon-stats">
                <div class="tab">
                    <button class="tablinks active" onclick="openTab(event, 'about')">About</button>
                    <button class="tablinks" onclick="openTab(event, 'stats')">Stats</button>
                    <button class="tablinks" onclick="openTab(event, 'evolution')">Evolution</button>
                    <button class="tablinks" onclick="openTab(event, 'moves')">Moves</button>
                </div>
                <div id="about" class="tab-content active">
                    <p>Stats werden hier angezeigt...</p>
                </div>
                <div id="stats" class="tab-content">
                    <p>Moves werden hier angezeigt...</p>
                </div>
                <div id="evolution" class="tab-content">
                    <p>Evolution werden hier angezeigt...</p>
                </div>
                <div id="moves" class="tab-content">
                    <p>Moves werden hier angezeigt...</p>
                </div>
            </div>
        </div>
    `;
}

function createImageTemplate(imageIndex) {
  return  `<img onclick="openOverlay(${imageIndex})" src="${currentImages[imageIndex]}">`;
}

function navigateImage(direction) {
    let pokemonToShow = isSearching ? filteredPokemon : allPokemon;
    currentImageIndex = (currentImageIndex + direction + pokemonToShow.length) % pokemonToShow.length;
    
    let overlayRef = document.getElementById('overlay-pokemon');
    overlayRef.innerHTML = getOverlayTemplate(currentImageIndex);
}

function noPropagation(event) {
  event.stopPropagation();
}

// Tab-Funktionalität

function openTab(evt, tabName) {
    // Alle tab-content Elemente verstecken
    let tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    
    // Alle tablinks als nicht aktiv markieren
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    
    // Ausgewählten Tab anzeigen und Button als aktiv markieren
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}