//todo: colors?
//mouseover what piece it is?
//add peanuts
//thick boarder around the different "sets" of things.
//more robust math (including head width)
var n = 20, // number of layers
    m = 100, // number of samples per layer
    //stack = d3.layout.stack().offset("zero"),
    stack = d3.layout.stack().offset("wiggle"),
    //stack = d3.layout.stack().offset("silhouette"),
//layers0 = stack(getHarrisonsRack(m, true));
//layers1 = stack(getHarrisonsRack(m, false));

    layers0 = stack(getCamalots(1.5,m));
    layers1 = stack(getCamalots(2,m));
var width = 960,
    height = 500,
    scaleHeight = 50;

var x = d3.scale.sqrt()
    .domain([0.5, (m - 1)/10])
    .range([0, width]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

var y = d3.scale.linear()
    .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
    .range([height-scaleHeight, 0]);

var color = d3.scale.linear()
    .range(["#aad", "#556"]);

var area = d3.svg.area()
    .x(function(d) { return x(d.x); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("transform", "translate(0," + (height - scaleHeight) + ")")
    .call(xAxis);

svg.selectAll("path")
    .data(layers0)
  .enter().append("path")
    .attr("d", area)
    .style("fill", function(x) { return x[0].c; });

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height - 5)
    .text("Centimeters");

function transition() {
  d3.selectAll("path")
      .data(function() {
        var d = layers1;
        layers1 = layers0;
        return layers0 = d;
      })
    .transition()
      .duration(2500)
      .attr("d", area)
      .style("fill", function(x) { return x[0].c; });
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
  return a.map(function(d, i) { return {x: i/10, y: Math.max(0, d)}; });
 
}

function getHarrisonsRack(n, nutsFirst){
    var SD = 2;
    if (nutsFirst){
	return Array(coverage(100,100,100000,n)).concat(getWallnuts(SD,n), getCamalotDoubles(SD,n));
    }else{
	return Array(coverage(0,100,100000,n)).concat(getCamalotDoubles(SD,n), getWallnuts(SD,n));
    }

}
function getFriends(SD,n){
    return Array(
 	coverage(6.7,14.3,SD,n,c),
	coverage(8.1,15.8,SD,n,c),
	coverage(9.4,16.5,SD,n,c),
	coverage(11.0,17.6,SD,n,c),
	coverage(13.2,19.4,SD,n,c),
	coverage(15.6,22.6,SD,n,c),
	coverage(18.9,25.8,SD,n,c),
	coverage(22.3,29.0,SD,n,c),
	coverage(25.2,32.1,SD,n,c),
	coverage(28.8,32.6,SD,n,c),
	coverage(33.1,37.4,SD,n,c));

}
function getCamalots(SD,n){
    return Array(
	coverage(13.0,23.4,SD,n,'#00659e'),//0.3
	coverage(15.5,26.7,SD,n,'#abaeb8'),//0.4
	coverage(19.6,33.5,SD,n,'#6d2688'),//0.5
	coverage(23.9,41.2,SD,n,'#456f6e'),//0.75
	coverage(30.2,52.1,SD,n,'#c5331c'),//1
	coverage(37.2,64.9,SD,n,'#eccb01'),//2
	coverage(50.7,87.9,SD,n,'#00659e'));//3
	//the rest of the sizes
}
function coverage(min,max,sd,n, color){
    if (color == null) {
	color = '#666';
    }
    var a = probabilityOfCoverage(min,max,sd,n);
    ans = a.map(function(d, i) { console.log({'i':i, 'd':d}); return {x: i/10, y: Math.max(0, d)}});
    ans[0].c = d3.rgb(color);
  return ans;
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
