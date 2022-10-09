const dbEndpoint = {
    base: ` http://localhost:3000`,
    profiles: function(){
        return `${this.base}/profiles`;
    },
    profile: function(id){
        return `${this.base}/profiles/${id}`;
    },
};

const dataEndpoint = {
    base: `https://api.coingecko.com/api/v3`,
    ping: function(){
        return `${this.base}/ping`;
    },
    coinsList: function(){
        return `${this.base}/coins/list/`;
    },
    coinInfo: function(id = "bithashex"){
        return `${this.base}/coins/${id}`;
    },
    search: function(term){
        return `${this.base}/search/?query=${term}`;
    }
};
