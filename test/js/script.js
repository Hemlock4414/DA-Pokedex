let offset = 0;
let loadLimit = 25;
let pokemonList = [];

async function init() {
    pokemonList = await getPokemonList();
    await loadPokemons(loadLimit, pokemonList);
}

async function getPokemonList() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000');
        const data = await res.json();
        return data.results;
    } catch (err) {
        console.error("Error loading Pokemonlist");
    }
}

async function getPokemonData(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error loading Pokemondata");
    }
}

async function loadPokemons(n, arr) {
    if(offset >= pokemonList.length) {
        toggleButtonState();
        return;
    }
    const remainingList = pokemonList.length - offset;
    const toLoad = Math.min(n, remainingList);
    toggleButtonState();
    preloadContent(toLoad);
    for (let i = offset; i < offset + toLoad; i++) {
        const pokemonData = await getPokemonData(arr[i].url)
        renderPokemon(pokemonData, i);
    }
    toggleButtonState();
}

function renderPokemon(data, index) {
    const loadingSlot = document.getElementById(`loading-slot-${index}`);
    if (!loadingSlot) return;
    const newElement = document.createElement('div');
    newElement.innerHTML = getPokemonWidgetTemplate(data, index);
    loadingSlot.replaceWith(newElement);
}

function preloadContent(n) {
    const content = document.getElementById('content'); 
    for (let i = 0; i < n; i++) {
        content.insertAdjacentHTML('beforeend', getLoadingSlotTemplate(offset + i));
    }
}

function increaseOffset(n) {
    offset = Math.min(offset + n, pokemonList.length);
}

async function searchPokemon() {
    const searchValue = document.getElementById('input-search').value;
    const content = document.getElementById('content');
    if (searchValue.trim() == "") {
        resetSearch();
        return;
    }
    if (searchValue.length < 3) return;

    const filteredPokemonList = pokemonList.filter(element => element.name.includes(searchValue));
    content.innerHTML = "";
    offset = 0;
    swapToResetButton();
    await loadPokemons(filteredPokemonList.length, filteredPokemonList);
}

function resetSearch() {
    document.getElementById('input-search').value = "";
    document.getElementById('content').innerHTML = "";
    offset = 0;
    loadPokemons(24, pokemonList);
    swapToLoadButton();
}

function toggleButtonState() {
    const loadButton = document.getElementById('btn-load');
    loadButton.disabled = !loadButton.disabled;
}

function swapToResetButton() {
    const loadButton = document.getElementById('btn-load');
    const resetButton = document.getElementById('btn-reset');
    resetButton.classList.remove('d-none');
    loadButton.classList.add('d-none');
}

function swapToLoadButton() {
    const loadButton = document.getElementById('btn-load');
    const resetButton = document.getElementById('btn-reset');
    loadButton.classList.remove('d-none');
    resetButton.classList.add('d-none');
}

async function openModal(index) {
    const body = document.getElementById('body');
    const overlay = document.getElementById('overlay');
    const data = await getPokemonData(pokemonList[index].url);
    overlay.innerHTML = "";
    overlay.innerHTML += getPokemonModalTemplate(data, index);
    overlay.classList.remove('d-none');
    body.style.overflow = 'hidden';
    disableNavigateButton(index);
}

function closeModal() {
    const body = document.getElementById('body');
    const overlay = document.getElementById('overlay');
    overlay.classList.add('d-none');
    body.style.overflow = 'auto';
}

function navigateModal(index, direction) {
    if (direction === "next") {
        openModal(Math.min(index + 1, pokemonList.length - 1));
    } else if (direction === "previous") {
        openModal(Math.max(index - 1, 0));
        
        
    }
}

function disableNavigateButton(index) {
    if (index === 0) {
        const button = document.getElementById('btn-previous');
        button.disabled = true;
    }
    if (index === pokemonList.length - 1) {
        const button = document.getElementById('btn-next');
        button.disabled = true;
    } 
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




















// async function loadPokemons() {
//     offset = offset + 24;
//     preloadContent(24);
//     await getPokemonList();
// }

// async function getPokemonList() {
//     try {
//         const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
//         const data = await res.json();
        
//         await delay(2000);
        
//         for (const result of data.results) {
//             const pokemonData = await getPokemonData(result.url);
//             renderPokemon(pokemonData);
//         }
//     } catch (err) {
//         console.error("Fehler beim laden");
//     }
// }

// async function getAllPokemonList() {
//     try {
//         const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000`);
//         const data = await res.json();
//         return data.results;
//     } catch (err) {
//         console.error("Fehler beim laden");
//     }
// }

// async function getPokemonData(url) {
//     try {
//         const res = await fetch(url);
//         const data = await res.json();
//         return data;
//     } catch (err) {
//         console.error("Fehler beim laden");
//     }
// }

// function renderPokemon(data) {
//     const skeletalDiv = document.querySelector('.skeletal');
//     const newElement = document.createElement('div');
//     newElement.innerHTML = getPokemonWidget(data);
//     skeletalDiv.replaceWith(newElement);
// }




// async function searchPokemon() {
//     const searchValue = document.getElementById('input-search').value;
//     const content = document.getElementById('content');
//     if (searchValue === "") {
//         offset = -24;
//         content.innerHTML = "";
//         loadPokemons();
//         showLoadButton();
//     }
//     if (searchValue.length < 3) return;

//     const pokemonList = await getAllPokemonList();
//     const filteredPokemon = pokemonList.filter(element => element.name.includes(searchValue));
//     content.innerHTML = "";
//     hideLoadButton()
//     preloadContent(filteredPokemon.length);

//     for (const result of filteredPokemon) {
//         const pokemonData = await getPokemonData(result.url);
//         renderPokemon(pokemonData);
//     }
// }

