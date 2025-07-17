function getPokemonCardTemplate(pokemonData, pokeId, primaryType, typesHtml) {
    return `
        <div class="poke-card type-label ${primaryType}">
            <h2 class="poke-name">${pokemonData.name}</h2>
            <img src="${pokemonData.image}" alt="${pokemonData.name}" onclick="openOverlay(${pokemonData.id})">
            <div class="type-content">
                ${typesHtml}
            </div>
            <span class="poke-id">No. ${pokeId}</span>
        </div>
    `;
}

function getTypeBadgeTemplate(typeName) {
    return `<span class="type-badge ${typeName}">${typeName}</span> `;
}

function noPokemonFoundTemplate() {
    return `
        <p class="no-pokemon-found">No pokemon found</p>
    `;
}

function getOverlayTemplate(data) {
    return `
        <div class="overlay-pokemon-content type ${data.primaryType}" onclick="noPropagation(event)">
            <div class="overlay-pokemon-header">
                <button class="close-btn" onclick="toggleOverlay()">
                    <img src="./assets/icons/close_white.png" alt="Close">
                </button>
                <div class="overlay-pokemon-title">
                    <button class="nav-btn" onclick="navigateImage(-1)">
                        <img src="./assets/icons/arrow_back_white.png" alt="Back">
                    </button>
                    <h2 class="overlay-pokemon-name">${data.name}</h2>
                    <button class="nav-btn" onclick="navigateImage(1)">
                        <img src="./assets/icons/arrow_forward_white.png" alt="Forward">
                    </button>
                </div>
            </div>
            <img class="overlay-pokemon-img" src="${data.image}" alt="${data.name}">
            <div class="overlay-pokemon-stats">
                <div class="tab">
                    <button class="tablinks active" onclick="openTab(event, 'about')">About</button>
                    <button class="tablinks" onclick="openTab(event, 'stats')">Stats</button>
                    <button class="tablinks" onclick="openTab(event, 'evolution')">Evolution</button>
                    <button class="tablinks" onclick="openTab(event, 'moves')">Moves</button>
                </div>
                <div id="about" class="tab-content active">
                    <div class="about-grid">
                        <p class="about-grid-label">ID</p><p>${data.id}</p>
                        <p class="about-grid-label">Height</p><p>${data.height}</p>
                        <p class="about-grid-label">Weight</p><p>${data.weight}</p>
                        <p class="about-grid-label">Base Experience</p><p>${data.baseExperience}</p>
                        <p class="about-grid-label">Types</p><p>${data.types}</p>
                        <p class="about-grid-label">Abilities</p><p>${data.abilities}</p>
                    </div>
                </div>
                <div id="stats" class="tab-content"></div>
                <div id="evolution" class="tab-content">
                    <div class="pokeball-spinner"></div>
                    <div id="evolution-chain" class="evolution-container"></div>
                </div>
                <div id="moves" class="tab-content"></div>
            </div>
        </div>
    `;
}

function getStatsTemplate(statName, statValue, widthPercent, primaryType) {
    return `
            <div class="stat-row">
            <span class="stat-label">${statName}</span>
            <span class="stat-value">${statValue}</span>
            <div class="stat-bar-container">
                <div class="stat-bar type ${primaryType}" style="width: ${widthPercent}%;"></div>
            </div>
        </div>
    `;
}

function getMovesTemplate(topMoves) {
    return `
        <div class="moves-grid">
            ${topMoves.map(move => `
                <div class="move-entry">
                    ${capitalize(move.name)}<br>
                    <small class="move-small">Lvl ${move.level}</small>
                </div>
            `).join('')}
        </div>
    `;
}

function getArrowTemplate() {
    return `
        <div class="evo-arrow">➜</div>
    `;
}

function getPlaceholderStageTemplate(name) {
    return `
        <div class="evo-stage">
            <div class="evo-placeholder">?</div>
            <div>${capitalize(name)}</div>
        </div>
    `;
}

function getEvoStageTemplate(name, pokeData, imageUrl) {
    return `
        <div class="evo-stage">
            <img class="evo-image" src="${imageUrl}" alt="${name}">
            <div>${capitalize(name)}</div>
        </div>
    `;
}