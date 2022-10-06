const app = {
    profile: {},
};




function fetchJson(){
    fetch(endpoint.coinInfo())
    .then(res=>res.json())
    .then(json => {
        //if(json.gecko_says){
            console.log(json);
        /*}else{
            console.log("FAIL");
        }*/
    })
}

//fetchJson();