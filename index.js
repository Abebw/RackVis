

var n = 20, // number of layers
    m = 200, // number of samples per layer
    stack = d3.layout.stack().offset("zero"),
    layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); })),
    //layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); }));
    //layers1 = stack(Array(normalDistTest(m/2, 15, m)));
    //layers0 = stack(Array(probabilityOfCoverageTest(5, 10, m), probabilityOfCoverageTest(23, 30, m), probabilityOfCoverageTest(33, 40, m)));
layers0 = stack(getHarrisonsRack(m));

var width = 960,
    height = 500;

var x = d3.scale.linear()
    .domain([0, m - 1])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
    .range([height, 0]);

var color = d3.scale.linear()
    .range(["#aad", "#556"]);

var area = d3.svg.area()
    .x(function(d) { return x(d.x); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.selectAll("path")
    .data(layers0)
  .enter().append("path")
    .attr("d", area)
    .style("fill", function() { return color(Math.random()); });

function transition() {
  d3.selectAll("path")
      .data(function() {
        var d = layers1;
        layers1 = layers0;
        return layers0 = d;
      })
    .transition()
      .duration(2500)
      .attr("d", area);
}

function normalDist(mean, stdDeviation, n){
  var ans = [], i;
  for (i = 0; i < n; ++i){
      ans[i] = Math.exp(-1*(i-mean)*(i-mean)/(2*stdDeviation*stdDeviation)) / (stdDeviation*Math.sqrt(2*Math.PI));
  }
  return ans;
}

function normalDistCdr(mean, stdDeviation, n){
  var ans = normalDist(mean, stdDeviation, n), i, sum = 0;
  for (i = 0; i < n; ++i){
      sum = ans[i] + sum;
      ans[i] = sum;
  }
  return ans;
}
function normalDistTest(mean,stdDev,n){
    var a = normalDist(mean, stdDev, n);
  return a.map(function(d, i) { return {x: i, y: 1000* Math.max(0, d)}; });
 
}
function probabilityOfCoverageTest(camMin,camMax,n){
    var a = probabilityOfCoverage(camMin,camMax,1,n);
  return a.map(function(d, i) { return {x: i, y: 100* Math.max(0, d)}; });
 
}

function getHarrisonsRack(n){
    var SD = 2;
    return Array(//wallnuts
	coverage(6.7,14.3,SD,n),
	coverage(8.1,15.8,SD,n),
	coverage(9.4,16.5,SD,n),
	coverage(11.0,17.6,SD,n),
	coverage(13.2,19.4,SD,n),
	coverage(15.6,22.6,SD,n),
	coverage(18.9,25.8,SD,n),
	coverage(22.3,29.0,SD,n),
	coverage(25.2,32.1,SD,n),
	coverage(28.8,32.6,SD,n),
	coverage(33.1,37.4,SD,n),
    //camalots
	coverage(13.0,23.4,SD,n),//0.3
	coverage(13.0,23.4,SD,n),
	coverage(15.5,26.7,SD,n),//0.4
	coverage(15.5,26.7,SD,n),
	coverage(19.6,33.5,SD,n),//0.5
	coverage(19.6,33.5,SD,n),
	coverage(23.9,41.2,SD,n),//0.75
	coverage(23.9,41.2,SD,n),
	coverage(30.2,41.2,SD,n),//1
	coverage(30.2,41.2,SD,n),
	coverage(37.2,64.9,SD,n),//2
	coverage(37.2,64.9,SD,n),
	coverage(50.7,87.9,SD,n),//3
	coverage(50.7,87.9,SD,n));
}
function coverage(min,max,sd,n){
    var a = probabilityOfCoverage(min,max,sd,n);
  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}
function probabilityOfCoverage(camMin, camMax, crackSD, n){
    var lowerHalf;
    var upperHalf;
    var halfWayIndex = Math.ceil((camMax + camMin)/2);
    lowerHalf = normalDistCdr(camMin, crackSD, halfWayIndex );
    upperHalf = normalDistCdr(n - camMax, crackSD, n - halfWayIndex);
    return lowerHalf.concat(upperHalf.reverse());
}
// Inspired by Lee Byron's test data generator.
function bumpLayer(n) {

  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }

  var a = [], i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < 5; ++i) bump(a);
  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}
