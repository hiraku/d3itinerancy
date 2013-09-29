var _;

function Model(){
  this.N = 5;
  this.data = [];
  for(var i=0; i<this.N; i++){
    this.data.push(Math.random());
  }
}

Model.prototype = {
  omega: 0.5,
  epsilon: 0.088858,
  f: function(x){
    var r = x-this.omega*Math.cos(2*Math.PI*x) + this.omega;

    return r;
  },
  step: function(){
    var d1 = this.data,
    d2 = [];
    for(var i=0; i<this.N; i++){
      d2[i] = this.f(d1[i]) + this.epsilon * (
        Math.sin(2*Math.PI*d1[(i-1+this.N)%this.N]) +
          Math.sin(2*Math.PI*d1[(i+1+this.N)%this.N]) -
          2*Math.sin(2*Math.PI*d1[i]));
      while(d2[i]>0.5) d2[i] -= 1;
      while(d2[i]<-0.5) d2[i] += 1;
    }
    this.data = d2;
  },
  point: function(x, y){
    return {x: this.data[x],
            y: this.data[y]};
  }
};

function ChaoticItinerancy(selector){
  this.model = new Model();
  this.data = [];
  this.N = 50;
  this.selector = selector;
  this.svg = d3.select(selector);
  this.buildRule();
  this.buildDots();
}

ChaoticItinerancy.prototype = {
  getWidth: function(){
    return this.svg.attr("width");
  },
  getHeight: function(){
    return this.svg.attr("height");
  },
  buildRule: function(){
    this.scale = {
      x: d3.scale.linear().
        domain([-1, 1]).range([0, this.getWidth()]),
      y: d3.scale.linear().
        domain([-1, 1]).range([this.getHeight(), 0])
    };

    this.axis = {
      x: d3.svg.axis().
      scale(this.scale.x).
      orient("bottom"),
      y: d3.svg.axis().
      scale(this.scale.y).
      orient("left")
    };

    this.svg.append("g").
      attr("class", "x axis").
      attr("transform", "translate(0, " + this.scale.y(0) + ")").
      call(this.axis.x);

    this.svg.append("g").
      attr("class", "y axis").
      attr("transform", "translate(" + this.scale.x(0) + ", 0)").
      call(this.axis.y);
  },
  buildDots: function(){
    var fillScale = d3.scale.linear().
      domain([0, this.N]).range(["#fff", "#f00"]);

    var strokeScale = d3.scale.linear().
      domain([0, this.N]).range(["#fff", "#000"]);

    var data = [];
    for(var i=0; i<this.N; i++) data.push({x:0, y:0});
    this.svg.selectAll(".dot").
      data(data).enter().append("circle").
      attr("class", "dot").
      attr("r", 2).
      style("fill", function(d, i){return fillScale(i); }).
      style("stroke", function(d, i){return strokeScale(i)});
  },
  setData: function(){
    var scale = this.scale,
    dot = this.svg.selectAll(".dot");

    for(var i=0; i<this.data.length; i++){
      d3.select(dot[0][i]).datum(this.data[i]).
        attr("cx", function(d){_=[d, scale]; return scale.x(d.x); }).
        attr("cy", function(d){return scale.y(d.y); });
    }
  },
  updateData: function(){
    if(this.data.length == this.N){
      this.data.shift();
    }
    this.data.push(this.model.point(1, 2));
    this.model.step();
    return this;
  },
  start: function(){
    this.updateData().
      setData();
    setTimeout($.proxy(this.start, this), 10);
  }
};

var ci;
$(function(){
  ci = new ChaoticItinerancy("svg");
  ci.start();
});
