Meteor.methods({
    search : function (query){
        var result = BibSearch.search(query);
        result.map(function(item){
            obj = new BibdkCollection(item);
            Works.insert({title: obj.getTitle(), _id: obj.getId()});
        });
    }
});

BibSearch = {
    url : 'http://lakiseks.dbc.dk/openbibdk/0.5/',
    params : {
        action : 'search',
        query : 'hest',
        agency : '100200',
        profile : 'test',
        start : '1',
        stepValue : '10',
        outputType : 'json'
    },
    search : function (query){
        this.params.query = query;
        var response =  Meteor.http.call('GET', this.url, {params : this.params});
        return JSON.parse(response.content).searchResponse.result.searchResult;
    }
};
