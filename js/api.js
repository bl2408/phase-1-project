let itemsStore = {};

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

//search the api and display data
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
                <div class="coin-item-headers">
                    <div></div>
                    <div>Name</div>
                    <div>Mkt Rank.</div>
                    <div>Watch</div>
                </div>`;

            itemsStore = {};
            sorted.forEach(coin => {
                if(!coin.market_cap_rank){ return; }
                if(anyDisplayed === false){ anyDisplayed = true; }

                //store results in item store
                itemsStore[coin.api_symbol] = {
                    thumb: coin.thumb,
                    symbol: coin.api_symbol,
                    name: coin.name,
                    mktRank: coin.market_cap_rank
                }

                searchResults.innerHTML += `
                <div class="coin-item" onclick='itemClick(this, "${coin.api_symbol}");'>
                    <div><img src="${coin.thumb}" alt="${coin.api_symbol}"/></div>
                    <div>${coin.name}</div>
                    <div>${coin.market_cap_rank}</div>
                    <div class="itemWatching"><i class="fa ${toggleWatchIcons(!isWatched(coin.api_symbol))}"></i></div>
                </div>`;
            });
            if(!anyDisplayed){
                createNotif({msg: "No results found!"});
            }
        }
        toggleElVis(loader, false);
    });
};

const toggleWatchIcons = (bool) =>{
    return bool ? "fa-eye" : "fa-eye-slash";
};

//check if the user is watching the particular item
const isWatched = (key)=>{
    return app.profile.watchListKeys.filter(watch => watch === key).length > 0;
};

const itemClick=(target, key)=>{
    let type = "";
    const isWatch = isWatched(key);

    //console.log(toggleWatchIcons(isWatch));

    target.querySelector(".itemWatching").children[0].classList.add(toggleWatchIcons(isWatch));
    target.querySelector(".itemWatching").children[0].classList.remove(toggleWatchIcons(!isWatch));

    if(!isWatch){
        app.profile.watchList.push(itemsStore[key]);
        app.profile.watchListKeys.push(key);
        type = "adding";
    }else{
        app.profile.watchListKeys.splice(app.profile.watchListKeys.indexOf(key), 1);
        app.profile.watchList.splice(
           app.profile.watchList.indexOf(app.profile.watchList.find(item=>item.symbol === key)), 
           1
        );
        type = "removing";
    }
    toggleElVis(loader, true);
    fetch(dbEndpoint.profile(app.profile.id), {
        method: "PUT",
        headers:{
            "Content-type": "application/json",
            "Accepts": "application/json"
        },
        body: JSON.stringify({
            ...app.profile,
            watchList: app.profile.watchList,
            watchListKeys: app.profile.watchListKeys
        })
    })
    .then(res=>res.json())
    .then(json=>{
        toggleElVis(loader, false);
    })
    .catch(err=>{
        createNotif({msg:`Error ${type} ${itemsStore[key].name} to profile.`});
        toggleElVis(loader, false);
    });

};