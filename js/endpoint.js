const endpoint = {
    base: `https://api.coingecko.com/api/v3`,
    ping: function(){
        return `${this.base}/ping`;
    },
    coinsList: function(){
        return `${this.base}/coins/list/`;
    },
    coinInfo: function(id = "bithashex"){
        return `${this.base}/coins/${id}`;
    }
};
