const loader = document.querySelector("#loader-box");
const overlay = document.querySelector("#overlay");

const statusApi = document.querySelector("#status-api");
const statusDb = document.querySelector("#status-db");

//login/profile
const btnCreateProfile = document.querySelector("#btn-create-profile");
const btnBackProfiles = document.querySelector("#btn-create-back");
const btnSaveProfile = document.querySelector("#btn-create-save");
const btnLogout = document.querySelector("#btn-logout");
const btnSettings = document.querySelector("#btn-settings");
const displayLogin = document.querySelector("#display-login");
const displayCreateProfile = document.querySelector("#display-create-profile");
const formProfile = document.querySelector("#form-create-profile");

//treding
const tredingResults = document.querySelector("#section-treding .item-area-results");

//watchlist
const watchListResults = document.querySelector("#section-watchlist .item-area-results");

//search section
const btnSearch = document.querySelector("#btn-search");
const searchResults = document.querySelector("#section-search .item-area-results");
const searchInput = document.querySelector("#inputSearch");


const app = {
    profile: {},
    trendingTime: 60000, // 1min refresh for trending
    trendingChecked: 0,
};

const loadApp = (json)=>{
    resetDisplays();
    toggleElVis(loader, true);

    //resets the app to defaults - used for logging out
    if(!json){
        json = {
            name: "",
            settings: {
                startPage:0,
                theme:"",
            },
        };
    }

    app.profile = json;
    app.page = json.settings.startPage;
    sectionMove();
    
    app.theme = json.settings.theme;
    setTheme(app.theme);

    btnSettings.querySelector("#btn-settings-name").innerHTML = `${json.name}`;

    checkApi();
    toggleElVis(loader, false);
};

const loadProfile = (profileId, profileObj = {})=>{
    resetDisplays();
    toggleElVis(loader, true);

    if(profileId === -1){
        if(profileObj.name){
            profileObj.id = profileId;
            loadApp(profileObj);
        }else{
            getProfiles();
        }
        return;
    }

    fetch(dbEndpoint.profile(profileId))
    .then(res=>res.json())
    .then(json=>{
        loadApp(json);
    })
    .catch(error=>{
        createNotif({msg: "Failed to get profile from database.", theme:"error"});
        toggleElVis(loader, false);
        getProfiles();
    });
};

//displays the login window, loads profiles to select from or prompts user to create a profile if none found
const renderProfiles =(json = null)=>{
    toggleElVis(overlay, true);
    toggleElDisplay(displayLogin, "grid");
    const display = document.querySelector("#login-profiles");
    display.innerHTML = "";

    if(json===null){
        return;
    }

    if(json.length > 0){
        json.forEach(profile => {
            display.innerHTML += `<button onclick="loadProfile(${profile.id})" class="btn">${profile.name}</button>`
        });
    }else if(json.length === 0){
        createNotif({msg: "No profiles found, please create a profile to begin."});
    }
};

//fetches profiles from the db endpoint
const getProfiles=()=>{
    
    toggleElVis(loader, true);
    fetch(dbEndpoint.profiles())
    .then(res=>res.json())
    .then(json=>{
        renderProfiles(json);
        toggleElVis(loader, false);
        updateStatusLight(statusDb, "Database", 1);
    })
    .catch(error=>{
        createNotif({msg: "Failed to get profiles from database.", theme:"error"});
        toggleElVis(loader, false);
        updateStatusLight(statusDb, "Database", 2);
        renderProfiles();
    });
    
};

const updateStatusLight =(item, type, status = 0)=>{
    switch(status){
        case 0: // nothing
            item.style.color = null;
            item.setAttribute("title", `Status: ${type[0].toUpperCase()}.`);
        break;
        case 1: //ok
            item.style.color = "green";
            item.setAttribute("title", `Status: Connected to ${type}.`);
        break;
        case 2://failed
            item.style.color = "red";
            item.setAttribute("title", `Status: Failed to connected to ${type}.`);
        break;
    }
};

//loads the users watchlist
const loadWatchList = ()=>{
    watchListResults.innerHTML = `
    <div class="coin-item-headers">
        <div></div>
        <div>Name</div>
        <div>Mkt Rank.</div>
        <div>Watch</div>
    </div>`;

    app.profile.watchList.forEach(coin=>{
        watchListResults.innerHTML += `
            <div class="coin-item" onclick='itemClick(this, "${coin.symbol}");'>
                <div><img src="${coin.thumb}" alt="${coin.symbol}"/></div>
                <div>${coin.name}</div>
                <div>${coin.mktRank}</div>
                <div class="itemWatching"><i class="fa ${toggleWatchIcons(!isWatched(coin.symbol))}"></i></div>
            </div>`;
    });
};

//refreshes the section it is currently on
const refreshSection=()=>{
    if(app.profile.id === undefined  ){return ;}

    switch(app.page){
        case 0: //trending
            getTrending();
        break;
        case 1: //watchlist
            loadWatchList();
        break;
        case 2: //search
        break;
    }
};

//toggle element visibility
const toggleElVis=(el, bool)=>{
    el.style.visibility = bool ? "visible" : "hidden";
};
//toggle element display
const toggleElDisplay=(el, dis="block")=>{
    el.style.display = dis;
};
//resets all overlays
const resetDisplays =()=>{
    toggleElDisplay(displayLogin, "none");
    toggleElDisplay(displayCreateProfile, "none");
    toggleElVis(overlay, false);
    toggleElVis(loader, false);
};

//resets all sections
const resetSections =()=>{
    searchResults.innerHTML = "";
    searchInput.value = "";
    watchListResults.innerHTML = "";
    tredingResults.innerHTML = "";
    app.trendingChecked = 0;
};

//initialize app
const init=()=>{
    resetDisplays();
    getProfiles();

    //settings button
    btnSettings.addEventListener("click",()=>{
        if(app.profile.id === -1){
            createNotif({msg:"No settings for offline profile.", theme: "error"});
            return;
        }else{
            displayCreateProfile.dataset.id = app.profile.id;
        }
        displayCreateProfile.dataset.mode = "edit";


        formProfile.inputName.value = app.profile.name;
        formProfile.selectStartpage.value = app.profile.settings.startPage;

        [...formProfile.selectTheme.children].forEach(cOpt =>{
            if(cOpt.value === app.profile.settings.theme){
                cOpt.selected = true;
            }
        });


        toggleElDisplay(displayLogin, "none");
        toggleElDisplay(displayCreateProfile, "grid");
        toggleElVis(overlay, true);
    });

    //logout button
    btnLogout.addEventListener("click",()=>{
        loadApp();
        resetSections();
        getProfiles();
    });

    //create profile button
    btnCreateProfile.addEventListener("click",()=>{
        resetDisplays();
        toggleElDisplay(displayLogin, "none");
        toggleElDisplay(displayCreateProfile, "grid");
        displayCreateProfile.dataset.mode = "add";
        toggleElVis(overlay, true);
    });

    //go back button - depends if logged in or not
    btnBackProfiles.addEventListener("click", ()=>{
        if(displayCreateProfile.dataset.mode == "edit"){
            resetDisplays();
        }else{
            resetDisplays();
            getProfiles();
        }
    });

    //save profile button
    btnSaveProfile.addEventListener("click", ()=>{
        
        const mode = displayCreateProfile.dataset.mode;
        
        const profileName = formProfile.inputName.value;
        if(!profileName){
            createNotif({msg:"Please use a valid name.", theme:"error"});
            return;
        }
        
        toggleElVis(loader, true);

        const tempProfile = {     
            name: profileName,
            settings: {
                startPage: formProfile.selectStartpage.value,
                theme: formProfile.selectTheme.value
            },
            watchList: [],
            watchListKeys: []     
        };

        const ep = mode === "edit" ? dbEndpoint.profile(parseInt(displayCreateProfile.dataset.id)): dbEndpoint.profiles();

        fetch(ep,{
            method: mode === "edit" ? "PUT" : "POST",
            headers:{
                "Content-type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(tempProfile)
        })
        .then(res=> res.json())
        .then(json =>{
            if(json.id){
                createNotif({msg:`Profile successfully ${(mode === "edit" ? "updated": "created")}!`, theme:"success"});
                loadProfile(mode === "edit" ? parseInt(displayCreateProfile.dataset.id) : -1, json);
            }else{
                createNotif({msg:`Failed to ${(mode === "edit" ? "update": "create")} profile`, theme:"error"});
            }
            toggleElVis(loader, false);
        })
        .catch(error=>{
            createNotif({msg:`No connection to database${(mode === "edit" ? ", failed to update!": "! Temp profile created")}`});
            loadProfile(mode === "edit" ? parseInt(displayCreateProfile.dataset.id) : -1, tempProfile);
        });
        
    });

    //search button
    btnSearch.addEventListener("click", ()=>{
        
        if(!searchInput.value){
            createNotif({msg: "Search field must not be empty.", theme:"error"});
            return;
        }

        searchApi(searchInput.value);
    });

};
init();