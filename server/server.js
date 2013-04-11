
var size = function (count){
    if (count){
        return 10 + 100*count/100000
    }
    else return 10;
}
var size2 = function (count){
    if (count){
        return 10 + 100*count/100
    }
    else return 10;
}


Meteor.methods({
    search : function (query){
        var result = BibSearch.search(query);
        var items = result.searchResult;

        var patt1=new RegExp(/\((.*)\)/);

        var count = patt1.exec(result.hitCount.$);
        Works.insert({name:query, group: 'query', _id: query, parent : null, count : size(count[1])});
        var hest = [];
        items.map(function(item){
                var obj = new BibdkCollection(item);
                Works.insert({name:obj.getTitle(0), title: obj.getTitle(0), group: query, parent : query, count: size2(obj.count()), _id: obj.getId(0)});
            var test;
            for (var i = 1; i < obj.count(); i++) {
                Works.insert({name:obj.getTitle(i), title: obj.getTitle(i), group: query, parent : obj.getId(0), count: 10, _id: obj.getId(i)});
            }

        });

    },
    'object' : function(id){
        return new BibdkManifestation(BibSearch.objectGet(id));
    },
    'clean' : function (){
        var works = Works.find().fetch();
        for (var i = 0; i < works.length; i++) {
            Works.remove(works[i]._id);
        }
    }
});

BibSearch = {
    url : 'http://lakiseks.dbc.dk/openbibdk/0.5/',
    params : {
        agency : '100200',
        profile : 'test',
        start : '1',
        stepValue : '10',
        outputType : 'json'
    },
    search : function (query){
        this.params.action = 'search';
        this.params.query = query;
        var response =  Meteor.http.call('GET', this.url, {params : this.params});
        return JSON.parse(response.content).searchResponse.result;
    },
    objectGet : function (id){
        this.params.action = 'getObject';
        this.params.identifier = id;
        this.params.objectFormat = 'bibliotekdkWorkDisplay';
        var response =  Meteor.http.call('GET', this.url, {params : this.params});
        return JSON.parse(response.content).searchResponse.result.searchResult;
    }
};
