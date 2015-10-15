/*

 */


var exp = (function(){
  var srxp = function(source){
    // make sure to return an instance of srxp.
    if(srxp === this.constructor){
      this.init(source);
    } else {
      return new srxp(source);
    }
  };

  srxp.prototype.init = function(source){
    this.source = source;
    this.depth = 0;
    this.matches = [];
    this.regExps = [];
  };

  srxp.prototype.result = function(){
    return this.matches[this.depth - 1];
  };

  srxp.prototype.match = function(pattern){
    var rxp = srxp._cleanupPattern(pattern);
    var matches = this.source.match(rxp);

    this._add(rxp, matches);

    return this;
  };

  srxp.prototype.between = function(start, end){
    var match, matches = [];
    var rxp = new RegExp(start + srxp.ANY + end, 'mg');

    while(match = rxp.exec(this.source)){ // jshint ignore:line
      matches.push(match[1]);
    }

    this._add(rxp, matches);

    return this;
  };

  srxp.prototype._add = function(rxp, matches){
    this.regExps[this.depth] = rxp;
    this.matches[this.depth] = matches;
    this.depth ++;
  };


  /* statics */
  srxp.ANY = '([\\s\\S]*?)';


  srxp.simplify = function(text){
    text = text.replace(/[åäáàã]/g, 'a'); //make a-ish chars to a
    text = text.replace(/[ÅÄÁÀÃ]/g, 'A'); //make A-ish chars to A
    text = text.replace(/[éèẽæë]/g, 'e'); //make e-ish chars to e
    text = text.replace(/[ÉÈẼÆË]/g, 'E'); //make E-ish chars to E
    text = text.replace(/[öõø]/g, 'o'); //make o-ish chars to o
    text = text.replace(/[ÖÕØ]/g, 'O'); //make O-ish chars to O
    text = text.replace(/[üũ]/g, 'u');  //make u-ish chars to u
    text = text.replace(/[ÜŨ]/g, 'U');  //make U-ish chars to U

    text = text.replace(/(\s|\t){2,}/g, ' ');  //make multiple spaces or tabs to one space

    return text;
  };

  srxp._cleanupPattern = function(pattern){
    var rxp;
    if(pattern instanceof RegExp){
      rxp = pattern;
    } else {
      rxp = new RegExp(pattern, 'g');
    }

    return rxp;
  };

  return srxp;
})();

//export the class for node and make it global for clientside js.
if(typeof exports === 'undefined'){
  srxp = exp; //make it global
} else {
  module.exports = exports = exp; //node module
}

