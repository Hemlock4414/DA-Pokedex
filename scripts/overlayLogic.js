function renderOverlay(pokemon) {
    let overlayRef = document.getElementById('overlay-pokemon');
    let templateData = {
        name: pokemon.name,
        image: pokemon.image,
        primaryType: pokemon.types[0].type.name,
        id: pokemon.id,
        height: `${(pokemon.height / 10).toFixed(1)} m`,
        weight: `${(pokemon.weight / 10).toFixed(1)} kg`,
        baseExperience: pokemon.base_experience,
        types: pokemon.types.map(t => capitalize(t.type.name)).join(', '),
        abilities: pokemon.abilities
            .map(a => {
                let name = capitalize(a.ability.name);
                return a.is_hidden ? `${name} (Hidden)` : name;
            })
            .join(', ')
    };
    overlayRef.innerHTML = getOverlayTemplate(templateData);
}

function showOverlayAndTabs(pokemon) {
    document.getElementById('overlay-pokemon').style.display = 'flex';
    renderStats(pokemon);
    renderMoves(pokemon);
}

function renderStats(pokemon) {
    let statsContainer = document.getElementById('stats');
    statsContainer.innerHTML = '';

    let statNames = getStatNames();
    let maxStatValue = 200;
    let primaryType = pokemon.types[0].type.name;

    pokemon.stats.forEach(stat => {
        let statName = statNames[stat.stat.name] || stat.stat.name;
        let statValue = stat.base_stat;
        let widthPercent = (statValue / maxStatValue) * 100;

        statsContainer.innerHTML += getStatsTemplate(statName, statValue, widthPercent, primaryType);
    });
}

function getStatNames() {
    return {
        hp: "HP",
        attack: "Attack",
        defense: "Defense",
        "special-attack": "Special Attack",
        "special-defense": "Special Defense",
        speed: "Speed"
    };
}

function navigateImage(direction) {
    let pokemonToShow = isSearching ? filteredPokemon : allPokemon;
    currentImageIndex = (currentImageIndex + direction + pokemonToShow.length) % pokemonToShow.length;
    let currentPokemon = pokemonToShow[currentImageIndex];

    renderOverlay(currentPokemon);
    renderStats(currentPokemon);
    renderMoves(currentPokemon);
    
    let evoContainer = document.getElementById("evolution-chain");
    if (evoContainer) {
        delete evoContainer.dataset.loaded;
        evoContainer.innerHTML = '';
    }
}

function openOverlay(pokemonId) {
    let pokemonToShow = isSearching ? filteredPokemon : allPokemon;
    let pokemonIndex = pokemonToShow.findIndex(pokemon => pokemon.id === pokemonId);
    
    if (pokemonIndex === -1) return;
    
    currentImageIndex = pokemonIndex;
    let currentPokemon = pokemonToShow[currentImageIndex];
    
    renderOverlay(currentPokemon);
    showOverlayAndTabs(currentPokemon);
}

function openTab(evt, tabName) {
    deactivateAllTabs();
    deactivateAllTabLinks();
    activateTab(tabName);
    activateTabLink(evt.currentTarget);
    
    if (tabName === "evolution") {
        handleEvolutionTab();
    }
}

function deactivateAllTabs() {
    let tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
}

function deactivateAllTabLinks() {
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
}

function activateTab(tabName) {
    let tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add("active");
    }
}

function activateTabLink(tabLinkElement) {
    if (tabLinkElement) {
        tabLinkElement.classList.add("active");
    }
}

function handleEvolutionTab() {
    let evoContainer = document.getElementById("evolution-chain");
    
    if (!evoContainer) return;
    if (evoContainer.dataset.loaded === "true") {
        return;
    }
    
    showEvolutionSpinner();
    hideEvolutionContainer();
    
    let currentPokemon = getCurrentPokemon();
    loadEvolutionData(currentPokemon.name);
}

function getCurrentPokemon() {
    let pokemonToShow = isSearching ? filteredPokemon : allPokemon;
    return pokemonToShow[currentImageIndex];
}

function showEvolutionSpinner() {
    let spinner = document.querySelector("#evolution .pokeball-spinner");
    if (spinner) {
        spinner.style.display = "block";
    }
}

function hideEvolutionContainer() {
    let evoContainer = document.getElementById("evolution-chain");
    if (evoContainer) {
        evoContainer.style.display = "none";
    }
}

function loadEvolutionData(pokemonName) {
    let evoContainer = document.getElementById("evolution-chain");
    let spinner = document.querySelector("#evolution .pokeball-spinner");
    
    fetchEvolutionData(pokemonName)
        .then(data => {
            handleEvolutionSuccess(data);
        })
        .catch(err => {
            handleEvolutionError(err, spinner, evoContainer);
        });
}

function handleEvolutionSuccess(data) {
    let evoContainer = document.getElementById("evolution-chain");
    
    renderEvolutionChain(data);
    
    if (evoContainer) {
        evoContainer.dataset.loaded = "true";
    }
}

function handleEvolutionError(error, spinner, evoContainer) {
    console.error("Error loading evolution chain:", error);
    
    if (spinner) {
        spinner.style.display = "none";
    }
    if (evoContainer) {
        evoContainer.innerHTML = "<p>Error loading evolution data</p>";
        evoContainer.style.display = "block";
    }
}

function renderMoves(pokemon) {
    let movesContainer = document.getElementById('moves');
    movesContainer.innerHTML = '';

    let levelUpMoves = extractLevelUpMoves(pokemon.moves);
    let topMoves = getTopMovesByLevel(levelUpMoves, 9);
    
    movesContainer.innerHTML = getMovesTemplate(topMoves);
}

function extractLevelUpMoves(moves) {
    return moves
        .map(move => {
            let levelUpInfo = move.version_group_details.find(
                detail => detail.move_learn_method.name === 'level-up'
            );
            return levelUpInfo ? { 
                name: move.move.name, 
                level: levelUpInfo.level_learned_at 
            } : null;
        })
        .filter(Boolean);
}

function getTopMovesByLevel(moves, limit = 9) {
    return moves
        .sort((a, b) => a.level - b.level)
        .slice(0, limit);
}

async function fetchEvolutionData(pokemonName) {
    try {
        let speciesData = await getSpeciesData(pokemonName);
        let evoData = await getEvolutionChainData(speciesData);
        return extractEvolutionChain(evoData);
    } catch (error) {
        console.error("Fehler beim Laden der Evolutionskette:", error);
        return [];
    }
}

async function getSpeciesData(pokemonName) {
    let url = `https://pokeapi.co/api/v2/pokemon-species/${pokemonName.toLowerCase()}`;
    let response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Spezies nicht gefunden: ${pokemonName}`);
    }
    return await response.json();
}

async function getEvolutionChainData(speciesData) {
    let response = await fetch(speciesData.evolution_chain.url);

    if (!response.ok) {
        throw new Error('Evolutionskette nicht gefunden');
    }
    return await response.json();
}

function extractEvolutionChain(evoData) {
    let chain = [];
    let current = evoData.chain;

    while (current) {
        chain.push(current.species.name);
        current = current.evolves_to.length > 0 ? current.evolves_to[0] : null;
    }
    return chain;
}

async function renderEvolutionChain(evoNames) {
    let spinner = document.querySelector("#evolution .pokeball-spinner");
    let evoContainer = document.getElementById("evolution-chain");

    try {
        prepareEvolutionContainer(evoContainer);
        if (evoNames.length === 0) {
            showNoDataMessage(evoContainer, spinner);
            return;
        }
        for (let i = 0; i < evoNames.length; i++) {
            let name = evoNames[i];
            await renderEvolutionStage(name, evoContainer, i < evoNames.length - 1);
        }
        hideSpinner(spinner);
    } catch (error) {
        console.error("Error rendering evolution chain:", error);
        showErrorMessage(evoContainer, spinner);
    }
}

function prepareEvolutionContainer(container) {
    container.innerHTML = '';
    container.style.display = "flex";
}

function showNoDataMessage(container, spinner) {
    container.innerHTML = '<p>No evolution data available</p>';
    hideSpinner(spinner);
}

function showErrorMessage(container, spinner) {
    hideSpinner(spinner);
    container.innerHTML = '<p>Error loading evolution data</p>';
    container.style.display = "block";
}

function hideSpinner(spinner) {
    if (spinner) spinner.style.display = "none";
}

async function renderEvolutionStage(name, container, showArrow) {
    try {
        let pokeData = await fetchPokemonData(name);
        let imageUrl = pokeData.sprites.other['official-artwork'].front_default;
        container.innerHTML += getEvoStageTemplate(name, pokeData, imageUrl);

    } catch (error) {
        console.error(`Error loading data for ${name}:`, error);
        container.innerHTML += getPlaceholderStageTemplate(name);
    }
    if (showArrow) {
        container.innerHTML += getArrowTemplate();
    }
}

async function fetchPokemonData(name) {
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Pokemon not found");
    return await res.json();
}

function noPropagation(event) {
  event.stopPropagation();
}