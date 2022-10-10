//internal endpoint object - Database
const dbEndpoint = {
    base: ` http://localhost:3000`,
    profiles: function(){
        return `${this.base}/profiles`;
    },
    profile: function(id){
        return `${this.base}/profiles/${id}`;
    },
};

//external endpoint object - coingecko
const dataEndpoint = {
    base: `https://api.coingecko.com/api/v3`,
    ping: function(){
        return `${this.base}/ping`;
    },
    coinsList: function(){
        return `${this.base}/coins/list/`;
    },
    trending: function(){
        return `${this.base}/search/trending`;
    },
    search: function(term){
        return `${this.base}/search/?query=${term}`;
    }
};
