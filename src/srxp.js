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
    var i, text = source instanceof Array ? source : [source];
    this.source = source;
    this._depth = 1;
    this._stack = [{match : [], text : text}];

    for(i = 0; i< text.length; i++){
      this._stack[0].match[i] = {text : text[i], start: 0, length : text[i].length };
    }


    //this._add({match: {text:text, start:0, length: text., text: text});
  };

  srxp.prototype.matches = function(){
    return srxp.pluck(this._stack[this._depth - 1].match, 'text');

  };

  srxp.prototype.match = function(/*...patterns*/){
    var i, j, k, match, matches = [], rxp, prev;
    prev = this.matches();

    for(k = 0 ; k < arguments.length ; k++){
      rxp = srxp._getRegExp(arguments[k]);

      //loop the previous results and find matches.
      for(i = 0; i < prev.length ; i++){
        while(match = rxp.exec(prev[i])){ // jshint ignore:line
          if(match.length === 1){
            matches.push({text : match[0], start : match.pos, length : match[0].length});
          } else {
            // grouped search, att all matches.
            for(j = 1 ; j < match.length ; j ++){
              matches.push({text : match[j], start : match.pos, length : match[j].length});
            }
          }
        }
      }
    }

    this._add({regex : rxp, match : matches});

    return this;
  };

  srxp.prototype.between = function(start, end){
    //var rxp = new RegExp(start + '(' + srxp.ANY + ')' + end, 'mg');
    var i, j, k, match, matches = [], indexes = [], index, depth = 0;

    //get start and end regexps.
    var startRxp = srxp._getRegExp(start);
    var endRxp = srxp._getRegExp(end);

    //get previous results in chain
    var prev = this.matches();

    for(i = 0; i < prev.length ; i++){

      //find all starting positions
      while(match = startRxp.exec(prev[i])){ // jshint ignore:line
        indexes.push({type : 'start', pos : match.index + match[0].length, end : 0});
      }

      //find all ending positions
      while(match = endRxp.exec(prev[i])){ // jshint ignore:line
        indexes.push({ type : 'end', pos : match.index});
      }

      //sort by position
      indexes.sort(function(a, b){
        return a.pos > b.pos;
      });

      // match starting position with ending position to match nested groups. ((a)) => [(a), a] not [(a]
      for(j = 0 ; j < indexes.length ; j++){
        index = indexes[j];

        if(index.type === 'start'){
          for(k = j + 1; k < indexes.length ; k++){
            if(indexes[k].type === 'start'){
              depth ++;
            } else if(indexes[k].type === 'end'){
              if(depth === 0){
                index.end = indexes[k].pos;
                break;
              } else {
                depth --;
              }
            }
          }

        }
      }

      //fetch the chars between matches
      for(j = 0 ; j < indexes.length ; j++){
        index = indexes[j];

        if(index.type === 'start' && index.pos < index.end){
          match = prev[i].substring(index.pos, index.end);
          matches.push({text : match, start: index.pos, length: match.length});
        }
      }

    }

    this._add({match : matches});

    return this;
  };

  srxp.prototype.exclude = function(pattern){
    var i, matches = [];
    var rxp = srxp._getRegExp(pattern);
    var prev = this._stack[this._depth - 1].match;

    for(i = 0; i < prev.length ; i++){
      if(rxp.exec(prev[i].text) === null){
        matches.push(prev[i]);
      }
    }

    this._add({match : matches});

    return this;
  };

  srxp.prototype.include = function(pattern){
    var i, matches = [];
    var rxp = srxp._getRegExp(pattern);
    var prev = this._stack[this._depth - 1].match;

    for(i = 0; i < prev.length ; i++){
      if(rxp.exec(prev[i].text) !== null){
        matches.push(prev[i]);
      }
    }

    this._add({match : matches});

    return this;
  };

  srxp.prototype._add = function(properties){
    this._stack.push(properties);

    this._depth ++;
  };

  srxp.simplify = function(text){
    text = text.replace(/[åäáàãæ]/g, 'a'); //make a-ish chars to a
    text = text.replace(/[ÅÄÁÀÃÆ]/g, 'A'); //make A-ish chars to A
    text = text.replace(/[éèẽë]/g, 'e'); //make e-ish chars to e
    text = text.replace(/[ÉÈẼË]/g, 'E'); //make E-ish chars to E
    text = text.replace(/[öõø]/g, 'o'); //make o-ish chars to o
    text = text.replace(/[ÖÕØ]/g, 'O'); //make O-ish chars to O
    text = text.replace(/[üũ]/g, 'u');  //make u-ish chars to u
    text = text.replace(/[ÜŨ]/g, 'U');  //make U-ish chars to U

    text = srxp.trim(text);

    return text;
  };

  srxp.expandPattern = function(text){
    text = text.replace(/\s{1,}/g, '\\s{1,}');

    return text;
  };

  srxp.escape = function(text){
    text = text.replace(/([\(\)\[\]\{\}\\\?\.])/g, '\\$1');
    return text;
  };

  srxp.trim = function(text){
    text = text.replace(/^(\s|\t)*/g, ''); //ltrim
    text = text.replace(/(\s|\t)*$/g, ''); //rtrim
    text = text.replace(/(\s|\t){2,}/g, ' ');  //make multiple spaces or tabs to one space

    return text;
  };

  srxp._getRegExp = function(pattern, escape, expand){
    var rxp;
    escape = escape === undefined ? true : escape;
    expand = expand === undefined ? true : expand;
    if(pattern instanceof RegExp){
      rxp = pattern;
    } else {
      if(escape){
        pattern = srxp.escape(pattern);
      }
      if(expand){
        pattern = srxp.expandPattern(pattern);
      }
      rxp = new RegExp(pattern, 'mg');
    }

    return rxp;
  };

  srxp.pluck = function(arr, property){
    var i, ret = [];
    for(i = 0;i< arr.length; i++){
      ret.push(arr[i][property]);
    }
    return ret;
  };

  return srxp;
})();

//export the class for node and make it global for clientside js.
if(typeof exports === 'undefined'){
  srxp = exp; //make it global
} else {
  module.exports = exports = exp; //node module
}

