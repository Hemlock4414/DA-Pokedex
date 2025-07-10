function init() {
    fetchPokeApi();
}

async function fetchPokeApi() {
    let response = await fetch("https://pokeapi.co/api/v2/pokemon/1");
    let pokeData = await response.json();
    console.log(pokeData);

    // Typen extrahieren
    let typesHtml = "";
    for (let i = 0; i < pokeData.types.length; i++) {
        let typeName = pokeData.types[i].type.name;
        typesHtml += `<span class="type ${typeName}">${typeName}</span> `;
    }

    let html = `
    <h2 class="poke-name">${pokeData.name}</h2>
    <img src="${pokeData.sprites.other['official-artwork'].front_default}" alt="${pokeData.name}">
    <div class="type-content">
        ${typesHtml}
    </div>
    `;

    document.getElementById('poke-content').innerHTML = html;
}
