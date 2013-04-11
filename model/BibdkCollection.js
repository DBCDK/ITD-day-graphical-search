BibdkCollection = function (collection) {
    this.collection = collection;
    console.log(collection);
    this.getTitle = function(i) {
        return this.collection.collection.object[i].record.title[0].$;
    }
    this.getId = function(i) {
        return this.collection.collection.object[i].identifier.$;
    }
    this.count = function() {
        return this.collection.collection.numberOfObjects.$;
    }
}



BibdkManifestation = function (collection) {
    this.manifestation = collection[0].formattedCollection.workDisplay.manifestation;
    this.getTitle = function() {
        return this.manifestation.work.title.titleFull[0].$;
    }
    this.getAuthor = function (){
        return this.manifestation.work.title.titleFull[0].$;
    }
    this.getId = function() {
        return this.collection.collection.object[0].identifier.$;
    }
}
