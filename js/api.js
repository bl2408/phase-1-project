//checks if the api response is ok and updates the status of the icon
const checkApi =()=>{
    fetch(dataEndpoint.ping())
    .then(res=>res.json())
    .then(json=>{
        if(json.gecko_says){
            updateStatusLight(statusApi, "API", 1);
        }else{
            updateStatusLight(statusApi, "API", 2);
            createNotif({msg: "Failed to connect to API", theme: "error"});
        }
    });
};

const searchApi =(term)=>{
    toggleElVis(loader, true);
    fetch(dataEndpoint.search(term))
    .then(res=>res.json())
    .then(json=>{
        if(json.coins.length === 0){
            createNotif({msg: "No results found!"});
        }else{
            let anyDisplayed =false; 
            const sorted = json.coins.sort((a, b)=> a.market_cap_rank - b.market_cap_rank);

            searchResults.innerHTML = `
                <div class="search-item">
                    <div></div>
                    <div>Name</div>
                    <div>Mkt No.</div>
                    <div></div>
                </div>`;

            sorted.forEach(coin => {
                if(!coin.market_cap_rank){ return; }
                if(anyDisplayed === false){ anyDisplayed = true; }

                searchResults.innerHTML += `
                <div class="search-item">
                    <div><img src="${coin.thumb}" alt="${coin.api_symbol}"/></div>
                    <div>${coin.name}</div>
                    <div>${coin.market_cap_rank}</div>
                    <div>ADD</div>
                </div>`;
            });
            if(!anyDisplayed){
                createNotif({msg: "No results found!"});
            }
        }
        toggleElVis(loader, false);
    });
};