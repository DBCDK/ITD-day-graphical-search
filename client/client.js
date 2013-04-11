/**
 * Helper functions
 */

/*Deps.autorun(function () {
    Meteor.subscribe("Works");
});*/

var okCancelEvents = function (selector, callbacks) {
    var cancel = callbacks.cancel || function () {};
    var ok = callbacks.ok || function () {};

    var events = {};
    events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
        function (evt) {
            if (evt.type === "keydown" && evt.which === 27) {
                // escape = cancel
                cancel.call(this, evt);

            } else if (evt.type === "keyup" && evt.which === 13 ||
                evt.type === "focusout") {
                // blur/return/enter = ok/submit if non-empty
                var value = String(evt.target.value || "");
                if (value)
                    ok.call(this, value, evt);
                else
                    cancel.call(this, evt);
            }
        };

    return events;
};


/**
 * TEMPLATES
 */

    var svg;
var force = d3.layout.force()
    .charge(-20)
    .linkDistance(100)
    .size([1000, 1000])
    .gravity(0.01);


Template.map.events({
    'mousedown circle, mousedown text': function (event, template) {
        Session.set("selected", event.currentTarget.id);
        console.log(event.currentTarget);
    }/*,
    'dblclick .map': function (event, template) {
        if (! Meteor.userId()) // must be logged in to create events
            return;
        var coords = coordsRelativeToElement(event.currentTarget, event);
        openCreateDialog(coords.x / 500, coords.y / 500);
    }*/
});

Template.map.rendered = function () {
    var self = this;
    svg = self.find("svg");
    if (! self.handle) {
        self.handle = Deps.autorun(function () {
                var works = Works.find().fetch();
                if(works.length){
                    //ParseLinks(null);
                    ForceView(works, svg);
                }

            }
        );
    }
};

Template.search.events(okCancelEvents(
    '#search-field',
    {
        ok: function (text, evt) {
            Meteor.call('search', text, function (error, result){
               console.log(result)
            });

        }
    }));


Template.textresult.works = function () {
    return Works.find({}, {sort: {title: 1}});
};

Template.work.events({
    'click': function () {
        Works.remove(this._id);
        var works = Works.find().fetch();

        //ForceView(works, svg);

    }
});

/** Adds works to svg
 *
 * @param works
 * @param svg
 * @constructor
 */
ForceView = function (works, svg) {
    var selected = Session.get('selected');
    if (selected){
        selected = Works.findOne(selected);
        console.log(selected);
    }
    d3.select(svg).selectAll(".node").remove();
    d3.select(svg).selectAll(".link").remove();
    if (!works || works.length == 0) {
        console.log('cancel');
        return;
    }
    var handler = new ResultHandler(works);
    var links = handler.getLinks();
    var color = d3.scale.category10();
    //console.log(works.length);
    force
        .nodes(works)
        .links(links)
        .start();

    var link = d3.select(svg).selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(10); });

    var node = d3.select(svg).selectAll(".node")
        .data(works, function(d) { return d._id; })
        .enter().append("circle")
        .attr("class", "node")
        .attr("id", function (party) { return party._id; })
        .call(force.drag)
        .attr("r", function(d) { return d.count; })
        .style("fill", function(d) { return color(d.group); });


    node.append("title")
        .text(function(d) { return d.name;});

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    })
}



function ResultHandler (nodes){
    this._parents = [];
    this._nodes = nodes;
    this._groups = [];
    this._links = [];

    this.groups = function (){
        if (_groups.length){
            return _groups;
        }
        for (var i = 0; i < _nodes; i++) {
            _groups[_nodes[i].group].push({
                index : i,
                element : _nodes[i]
            });
        }
    }
    this.parentIndex = function (id){
        for (var i = 0; i < this._nodes.length; i++) {
            if(this._nodes[i]._id == id){
                return i;
            }

        }
    }

    this.getLinks = function (){
        var n;
        for (var i = 0; i < this._nodes.length; i++) {
            n = this._nodes[i];
            if (n.parent != null){
                this._links.push({
                    source : this.parentIndex(n.parent),
                    target : i
                });
            }
        }
        return this._links;
    }

}


