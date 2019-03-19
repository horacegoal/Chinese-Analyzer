
let socket = io();
socket.on('connect', function(){
  console.log('server connected')
})


socket.on('wordsList', function(tokens){
  let counts = {};
  let keys = [];
  // console.log(tokens)
  for(let i = 0; i < tokens.length; i++){
    if(!counts[tokens[i]]){
      counts[tokens[i]] = 1;
      keys.push(tokens[i]);
    }else{
      counts[[tokens[i]]] += 1;
    }
  }
  keys.sort(compare)
  function compare(a, b){
    countA = counts[a]
    countB = counts[b]
    return countB - countA;
  }
  // for(let i = 0; i < keys.length; i++){
  //   console.log(`${keys[i]} ${counts[keys[i]]}`)
  // }


  var fill = d3.scale.category20();
  let wordScale = d3.scale.linear().range([15,60]);
  wordScale.domain([d3.min(keys, function(d){return counts[d]}),
                    d3.max(keys, function(d){return counts[d]})]);

  let width;
  let height;
  function setWidthHeight(x){
    if(x.matches){
      width = 350;
      height = 350;
    }else{
      width = 500;
      height = 500;
    }
  }

  let x = window.matchMedia("(max-width: 500px)")
  setWidthHeight(x);
  x.addListener(setWidthHeight);
  var layout = d3.layout.cloud()
      .size([width, height])
      .words(keys.map(function(d) {
        return {text: d, size: counts[d], test: "haha"};
      }))
      .padding(5)
      .rotate(function() { return ~~(Math.random() * 1) * 45; })
      .font("Impact")
      .fontSize(function(d) { return wordScale(d.size); })
      .on("end", draw);

  layout.start();

  function draw(words) {
    d3.select("#word_cloud").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
      .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }
})
let submitButton = document.getElementById("submit")
submitButton.onclick = function(){
  let textInput = document.getElementById("text_input").value;
  let cloudArea = document.getElementById("word_cloud")
  cloudArea.innerHTML = ''
  socket.emit('text', textInput);
}

// socket.on('result', function (res) {
//   console.log(res)
// })

socket.on('sentimentClassify', function (res) {
  let sentiment = res.sentiment;
  let confidence = Math.floor(res.confidence * 100);
  let score = document.getElementById("score");
  if(sentiment === 0){
    score.innerHTML = '負面'
  }else if(sentiment === 1){
    score.innerHTML = '中性'
  }else if(sentiment === 2){
    score.innerHTML = '正面'
  }
  let scoreConfidence = document.getElementById("score_confidence");
  scoreConfidence.innerHTML = confidence;
})
