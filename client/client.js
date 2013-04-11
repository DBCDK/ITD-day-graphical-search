/**
 * Helper functions
 */

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

Template.map.rendered = function () {
    var color = d3.scale.category20();
    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(500)
        .size([1000, 800]);

    var self = this;
    self.node = self.find("svg");
    var graph = d3.select(self.node).select(".circles").selectAll("circle")
        .data(Works.find().fetch(), function (party) { return party._id; });
    if (! self.handle) {
        self.handle = Deps.autorun(function () {
                var works = Works.find().fetch();
                force
                    .nodes(works)
                    .links([])
                    .start();

                var link = d3.select(self.node).selectAll(".link")
                    .data([])
                    .enter().append("line")
                    .attr("class", "link")
                    .style("stroke-width", function(d) { return Math.sqrt(10); });

                var node = d3.select(self.node).selectAll(".node")
                    .data(works)
                    .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", 5)
                    .style("fill", function(d) { return color(10); })
                    .call(force.drag);

                node.append("title")
                    .text(function(d) { return Math.floor(Math.random() * 500);});

                force.on("tick", function() {
                    link.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    node.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                })
            }
        );
    }
};

Template.search.events(okCancelEvents(
    '#search-field',
    {
        ok: function (text, evt) {
            console.log(text);
            Meteor.call('search', text, function (error, result){
               console.log(result)
            });
        }
    }));


Template.textresult.works = function () {
    //console.log(Works.find().fetch());
    return Works.find({}, {sort: {title: 1}});
};

Template.work.events({
    'click': function () {
        Works.remove(this._id);
    }
});
