/*

 */


var exp = (function(){
  var srxp = function(){
    console.log('hi');
  };

  srxp.simplify = function(text){
    text = text.toLowerCase();
    text = text.replace(/[åäáàã]/g, 'a'); //make a-ish chars to a
    text = text.replace(/[éèẽæë]/g, 'e'); //make e-ish chars to e
    text = text.replace(/[öõø]/g, 'o'); //make o-ish chars to o
    text = text.replace(/[üũ]/g, 'u');  //make u-ish chars to u
    text = text.replace(/(\s|\t){2,}/g, ' ');  //make multiple spaces or tabs to one space

    return text;
  };

  srxp.prototype.between = function(start, end){
    console.log(start, end);
  };

  return srxp;
})();

if(typeof exports === 'undefined'){
  srxp = exp; //make it global
} else {
  module.exports = exports = exp; //node module
}

