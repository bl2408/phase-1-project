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

//sort coins by marketcap
const sortMarketCap = (arr)=>{
    return arr.sort((a, b)=> a.market_cap_rank - b.market_cap_rank);
};


//call the trending api and display in section
const getTrending =()=>{
    toggleElVis(loader, true);

    //check the time since last refresh - prevent spamming API
    if(app.trendingChecked === 0){
        app.trendingChecked = new Date().getTime();
    }else{
        const timeSinceCheck = new Date().getTime() - app.trendingChecked;
        if(timeSinceCheck < app.trendingTime){ // 1min
            toggleElVis(loader, false);
            return;
        }
    }


    fetch(dataEndpoint.trending())
    .then(res=>res.json())
    .then(json=>{

        const coinArr = json.coins.map(obj=>obj.item);
        
        const sorted = sortMarketCap(coinArr);

        itemsStore = {};
        tredingResults.innerHTML = "";
        sorted.forEach(coin => {
            //store results in item store
            itemsStore[coin.id] = {
                thumb: coin.thumb,
                symbol: coin.id,
                name: coin.name,
                mktRank: coin.market_cap_rank
            }

            tredingResults.innerHTML += displayItemTemplate(itemsStore[coin.id]);
        });
        
        toggleElVis(loader, false);
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
            const sorted = sortMarketCap(json.coins);

            searchResults.innerHTML ="";

            itemsStore = {};
            sorted.forEach(coin => {
                if(!coin.market_cap_rank){ return; }
                if(anyDisplayed === false){ anyDisplayed = true; }

                //store results in item store
                itemsStore[coin.api_symbol] = {
                    name: coin.name,
                    thumb: coin.thumb,
                    symbol: coin.api_symbol,
                    mktRank: coin.market_cap_rank
                }

                searchResults.innerHTML += displayItemTemplate(itemsStore[coin.api_symbol]);
            });
            if(!anyDisplayed){
                createNotif({msg: "No results found!"});
            }
        }
        toggleElVis(loader, false);
    });
};

//toggles the watch icons
const toggleWatchIcons = (bool) =>{
    return bool ? "fa-eye" : "fa-eye-slash";
};

//check if the user is watching the particular item
const isWatched = (key)=>{
    return app.profile.watchListKeys.filter(watch => watch === key).length > 0;
};

//when a item is click, it will toggle the watch icon and add the item to the users watchlist
//if offline profile it will still add to the watchlist but not save to db
const itemClick=(target, key)=>{
    let type = "";
    const isWatch = isWatched(key);

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