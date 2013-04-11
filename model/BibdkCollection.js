BibdkCollection = function (collection) {
    this.collection = collection;

    this.getTitle = function() {
        return this.collection.collection.object[0].record.title[0].$;
    }
    this.getId = function() {
        return this.collection.collection.object[0].identifier.$;
    }
}
