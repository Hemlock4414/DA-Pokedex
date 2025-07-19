function getPokemonWidgetTemplate(data, index) {
    return `
        <div class="poke-widget widget-type-${data.types[0].type.name} fade-in" onclick="openModal(${index})">
            <span class="poke-name">${data.name}</span>
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
            <div class="poke-types-container">
                ${data.types.map(typeIndex => `<div class="type type-${typeIndex.type.name}">${typeIndex.type.name}</div>`).join('')}
            </div>
            <span class="poke-num">Nr. ${data.id.toString().padStart(4,'0')}</span>
        </div>
    `
}

function getLoadingSlotTemplate(index) {
    return `<div class="loading-slot" id="loading-slot-${index}"></div>`
}

function getPokemonModalTemplate(data, index) {
    return `
        <div class="pokemon-modal modal-type-${data.types[0].type.name}" onclick="event.stopPropagation()">
            <div class="modal-bgd-container">
                <button class="modal-btn modal-btn-close" onclick="closeModal()">
                    <img src="../assets/img/icon-close.svg" alt="close">
                </button>
                <div class="modal-img-container">
                    <button class="modal-btn" id="btn-previous" onclick="navigateModal(${index}, 'previous')">
                        <img src="../assets/img/icon-arrow-back.svg" alt="previous">
                    </button>
                    <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
                    <button class="modal-btn" id="btn-next" onclick="navigateModal(${index}, 'next')">
                        <img src="../assets/img/icon-arrow-forward.svg" alt="next">
                    </button>
                </div>
            </div>
            <div class="modal-info-container">
                <div class="modal-name-container">
                    <h1>${data.name}</h1>
                    <span>Nr. ${data.id.toString().padStart(4,'0')}</span>
                </div>
                <div class="modal-types-container">
                    ${data.types.map(typeIndex => `<div class="type type-${typeIndex.type.name}">${typeIndex.type.name}</div>`).join('')}
                </div>
                <div class="modal-about-container">
                    <div class="bodymass-container">
                        <span><b>${(data.weight / 10).toFixed(1)} KG</b></span>
                        <span style="color: #888; font-size: 16px;">Weight</span>
                    </div>
                    <div class="bodymass-container">
                        <span><b>${(data.height / 10).toFixed(1)} M</b></span>
                        <span style="color: #888; font-size: 16px;">Height</span>
                    </div>
                </div>
                <table class="modal-base-stats-table">
                    <caption><b>Base Stats</b></caption>
                    <tr>
                        <td>HP</td>
                        <td>${data.stats[0].base_stat}</td>
                        <td> <div class="stat-bar type-${data.types[0].type.name}" style="width: ${(data.stats[0].base_stat / 255) * 100}%"></div> </td>
                    </tr>
                    <tr>
                        <td>Atk</td>
                        <td>${data.stats[1].base_stat}</td>
                        <td> <div class="stat-bar type-${data.types[0].type.name}" style="width: ${(data.stats[1].base_stat / 255) * 100}%"></div> </td>
                    </tr>
                    <tr>
                        <td>Def</td>
                        <td>${data.stats[2].base_stat}</td>
                        <td> <div class="stat-bar type-${data.types[0].type.name}" style="width: ${(data.stats[2].base_stat / 255) * 100}%"></div> </td>
                    </tr>
                    <tr>
                        <td>S.Atk</td>
                        <td>${data.stats[3].base_stat}</td>
                        <td> <div class="stat-bar type-${data.types[0].type.name}" style="width: ${(data.stats[3].base_stat / 255) * 100}%"></div> </td>
                    </tr>
                    <tr>
                        <td>S.Def</td>
                        <td>${data.stats[4].base_stat}</td>
                        <td> <div class="stat-bar type-${data.types[0].type.name}" style="width: ${(data.stats[4].base_stat / 255) * 100}%"></div> </td>
                    </tr>
                    <tr>
                        <td>Spd</td>
                        <td>${data.stats[5].base_stat}</td>
                        <td> <div class="stat-bar type-${data.types[0].type.name}" style="width: ${(data.stats[5].base_stat / 255) * 100}%"></div> </td>
                    </tr>
                </table>
            </div>
        </div>
    `
}