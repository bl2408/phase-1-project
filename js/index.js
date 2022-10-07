const loader = document.querySelector("#loader-box");
const overlay = document.querySelector("#overlay");

//login/profile
const btnCreateProfile = document.querySelector("#btn-create-profile");
const btnBackProfiles = document.querySelector("#btn-create-back");
const btnSaveProfile = document.querySelector("#btn-create-save");
const btnLogout = document.querySelector("#btn-logout");
const displayLogin = document.querySelector("#display-login");
const displayCreateProfile = document.querySelector("#display-create-profile");


const app = {
    profile: {},
};

const loadApp = (json)=>{
    resetDisplays();
    toggleElVis(loader, true);

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

    toggleElVis(loader, false);
};

const loadProfile = (profileId, profileObj = {})=>{
    resetDisplays();
    toggleElVis(loader, true);

    if(profileId === -1){
        if(profileObj.name){
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
    })
    .catch(error=>{
        createNotif({msg: "Failed to get profiles from database.", theme:"error"});
        toggleElVis(loader, false);
        renderProfiles();
    });
    
};

const toggleElVis=(el, bool)=>{
    el.style.visibility = bool ? "visible" : "hidden";
};
const toggleElDisplay=(el, dis="block")=>{
    el.style.display = dis;
};
const resetDisplays =()=>{
    toggleElDisplay(displayLogin, "none");
    toggleElDisplay(displayCreateProfile, "none");
    toggleElVis(overlay, false);
    toggleElVis(loader, false);
};


const init=()=>{
    resetDisplays();
    getProfiles();

    btnLogout.addEventListener("click",()=>{
        loadApp();
        getProfiles();
    });

    btnCreateProfile.addEventListener("click",()=>{
        resetDisplays();
        toggleElDisplay(displayLogin, "none");
        toggleElDisplay(displayCreateProfile, "grid");
        toggleElVis(overlay, true);
    });

    btnBackProfiles.addEventListener("click", ()=>{
        resetDisplays();
        getProfiles();
    });

    btnSaveProfile.addEventListener("click", ()=>{
        
        const form = document.querySelector("#form-create-profile");
        const profileName = form.inputName.value;
        if(!profileName){
            createNotif({msg:"Please use a valid name.", theme:"error"});
            return;
        }

        toggleElVis(loader, true);

        const tempProfile = {     
            name: profileName,
            settings: {
                startPage: 0,
                theme: form.selectTheme.value
            },
            watchList: []
            
        };

        fetch(dbEndpoint.profiles(),{
            method: "POST",
            headers:{
                "Content-type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(tempProfile)
        })
        .then(res=> res.json())
        .then(json =>{
            if(json.id){
                createNotif({msg:"Profile successfully created!", theme:"success"});
                loadProfile(-1, json);
            }else{
                createNotif({msg:"Failed to create profile", theme:"error"});
            }
            toggleElVis(loader, false);
        })
        .catch(error=>{
            createNotif({msg:"No connection to database, temp profile created!"});
            loadProfile(-1, tempProfile);
        });
        
    });

};
init();