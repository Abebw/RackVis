//todo: colors?
//mouseover what piece it is?
//add peanuts
//thick boarder around the different "sets" of things.
//more robust math (including head width)
var n = 20, // number of layers
    m = 150, // number of samples per layer
    zStack = d3.layout.stack().offset("zero"),
    wStack = d3.layout.stack().offset("wiggle"),
    camalots = null,
    friends = null,
    harrisonA = null,
    harrisonB = null;

function stackToWiggle(){
    camalots = wStack(getCamalots(2,m));
    friends = wStack(getFriends(2,m));
    harrisonA = wStack(getHarrisonsRack(m, true));
    harrisonB = wStack(getHarrisonsRack(m, false));
}
function stackToZero(){
    camalots = zStack(getCamalots(2,m));
    friends = zStack(getFriends(2,m));
    harrisonA = zStack(getHarrisonsRack(m, true));
    harrisonB = zStack(getHarrisonsRack(m, false));
}
stackToWiggle();


var width = 960,
    height = 500,
    scaleHeight = 50;

var x = d3.scale.sqrt()
    .domain([0.5, 9.5])
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

function transition(var data) {
  var animationLength = 2500;
  var selection = svg.selectAll("path").data(data);
    selection.exit().transition()
      .duration(animationLength)
      .style("opacity",0)
      .remove();
    
    selection.enter().append("path")
      .attr("d", area)
      .style("opacity",0)
      .style("fill", function(x) { return x[0].c; });


    selection.transition()
      .duration(animationLength)
      .attr("d", area)
      .style("opacity",1)
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
    var c = "blue";
    return Array(coverage(100,100,100000,n),
 	coverage(14,22.54,SD,n,'#00659e'), //0
	coverage(16.56,26.66,SD,n,'#c5331c'), //0.5
	coverage(19.71,31.73,SD,n,'#eccb01'), //1
	coverage(23.59,37.98,SD,n,'#abaeb8'), //1.5
	coverage(28.41,45.73,SD,n,'#c5331c'), //2
	coverage(34.40,55.39,SD,n,'#eccb01'), //2.5
	coverage(41.90,67.47,SD,n,'#6d2688'), //3
	coverage(51.34,82.65,SD,n,'#00659e'), //3.5
	coverage(63.25,101.83,SD,n,'#abaeb8'));//4
    //there is also a 5 and 6 

}
function getCamalots(SD,n){
    return Array(coverage(100,100,100000,n),
	coverage(13.0,23.4,SD,n,'#00659e'),//0.3
	coverage(15.5,26.7,SD,n,'#abaeb8'),//0.4
	coverage(19.6,33.5,SD,n,'#6d2688'),//0.5
	coverage(23.9,41.2,SD,n,'#456f6e'),//0.75
	coverage(30.2,52.1,SD,n,'#c5331c'),//1
	coverage(37.2,64.9,SD,n,'#eccb01'),//2
	coverage(50.7,87.9,SD,n,'#00659e'));//3
	//there is also 4-6
}
function coverage(min,max,sd,n, color){
    if (color == null) {
	color = '#666';
    }
    var a = probabilityOfCoverage(min,max,sd,n);
    ans = a.map(function(d, i) { return {x: i/10, y: Math.max(0, d)}});
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
