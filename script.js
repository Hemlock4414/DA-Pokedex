function init() {
    fetchPokeList();
}

async function fetchPokeList() {
    let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
    let data = await response.json();
    let pokemonList = data.results;

    for (let i = 0; i < pokemonList.length; i++) {
        await fetchPokeDetails(pokemonList[i].url);
    }
}

async function fetchPokeDetails(url) {
    let response = await fetch(url);
    let pokeData = await response.json();

    let pokeId = String(pokeData.id).padStart(4, '0');

    let typesHtml = "";
    for (let i = 0; i < pokeData.types.length; i++) {
        let typeName = pokeData.types[i].type.name;
        typesHtml += `<span class="type ${typeName}">${typeName}</span> `;
    }

    let html = `
        <div class="poke-card">
            <h1 class="poke-name">${pokeData.name}</h1>
            <img src="${pokeData.sprites.other['official-artwork'].front_default}" alt="${pokeData.name}" loading="lazy">
            <div class="type-content">
                ${typesHtml}
            </div>
            <span class="poke-id">Nr. ${pokeId}</span>
        </div>
    `;

    document.getElementById('poke-content').innerHTML += html;
}
