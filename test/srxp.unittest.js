/// <reference path="../../assets/js/tundra.js" />
var assert = require('chai').assert;
var srxp = require('../src/srxp.js');

describe('Simple Regexp', function(){
  describe('simplify', function(){
    it('should return the same simple string', function(){
      assert.equal(srxp.simplify('abc'), 'abc');
      assert.equal(srxp.simplify('123'), '123');
    });

    it('should return a string without special chars', function(){
      assert.equal(srxp.simplify('åäöéÅÄÖü'), 'aaoeAAOu');
      assert.equal(srxp.simplify("a   b  \t c"), 'a b c');
    });

    it('should a return string without double spaces', function(){
      assert.equal(srxp.simplify('abc'), 'abc');
      assert.equal(srxp.simplify("a   b  \t c"), 'a b c');
    });
  });

  describe('trim', function(){
    it('should remove spaces and tabs in at start and end of strings and join multiple spaces to one', function(){
      assert.equal(srxp.trim('abc'), 'abc');
      assert.equal(srxp.trim(" abc "), 'abc');
      assert.equal(srxp.trim("\t  abc\t  "), 'abc');
    });
  });

  describe('escape', function(){
    it('should escape (\) special chars as ()[]{}!?., in strings eg patterns', function(){
      assert.equal(srxp.escape('()'), '\\(\\)');
    });
  });

  describe('expandPattern', function(){

    it('should add regexp for multiple spaces', function(){
      assert.equal(srxp.expandPattern('a b'), 'a\\s{1,}b');
      assert.equal(srxp.expandPattern('a   b'), 'a\\s{1,}b');
      assert.equal(srxp.expandPattern('a   b c'), 'a\\s{1,}b\\s{1,}c');
    });
  });

  describe('match', function(){
    it('should find a simple string ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match('abc').matches(), ['abc', 'abc']);
      assert.deepEqual(srxp(str).match('cde').matches(), ['cde']);
      assert.notDeepEqual(srxp(str).match('cde').matches(), ['cdde']);

    });

    it('should find multiple strings ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match('abcd', 'ef').matches(), ['abcd', 'ef']);
      assert.deepEqual(srxp(str).match('abc', 'ef').matches(), ['abc', 'abc', 'ef']);

    });

    it('should find a match with regexp ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match(/abc/g).matches(), ['abc', 'abc']);
      assert.deepEqual(srxp(str).match(/a|b/g).matches(), ['a', 'b', 'a', 'b']);
      assert.deepEqual(srxp(str).match(/cde/g).matches(), ['cde']);
      assert.notDeepEqual(srxp(str).match(/cde/g).matches(), ['cdde']);
      assert.notDeepEqual(srxp(str).match(/cde/g).matches(), ['cdde']);

    });

    it('should find matches in a grouped regexp ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match(/ab(c)/g).matches(), ['c', 'c']);
      assert.deepEqual(srxp(str).match(/(ab(c))/g).matches(), ['abc', 'c', 'abc', 'c']);
      assert.deepEqual(srxp(str).match(/((a)(.*)d)(.{3})/g).matches(), ['abcd', 'a', 'bc', 'efg']);
    });

    it('should find mathces in expanded searches', function(){
      var str = '<div  class = "test">content</div>';
      assert.deepEqual(srxp(str).match('<div').matches(), ['<div']);
      assert.deepEqual(srxp(str).match('<div class').matches(), ['<div  class']);
      assert.deepEqual(srxp(str).match('<div  class').matches(), ['<div  class']);
      assert.deepEqual(srxp(str).match('<div   class').matches(), ['<div  class']);
      assert.deepEqual(srxp(str).match('class = "').matches(), ['class = "']);
    });
  });

  describe('replace', function(){
    it('should replace strings ', function(){
      var str = 'abcdefg';
      assert.deepEqual(srxp(str).replace('ABC').text(), 'ABC');
      assert.deepEqual(srxp(str).between('a', 'f').replace('R').text(), 'aRfg');
      assert.deepEqual(srxp(str).between('a', 'f').replace('R').matches(), ['R']);


    });

    it('should replace multiple strings ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).between('a', 'c').replace('R').text(), 'aRcdefgaRc');
    });

    it('should replace multiple strings using function ', function(){
      var str = 'abcdefgaqc';
      var funct = function(char){
        return char.toUpperCase();
      };
      assert.deepEqual(srxp(str).between('a', 'c').replace(funct).text(), 'aBcdefgaQc');


    });

    it('should replace multiple strings with array ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).between('a', 'c').replace(['1', '2']).text(), 'a1cdefga2c');
      assert.deepEqual(srxp(str).between('a', 'c').replace(['1']).text(), 'a1cdefgabc');
      assert.deepEqual(srxp(str).between('a', 'c').replace(['1', '2', '3']).text(), 'a1cdefga2c');
    });

  });

  describe('between', function(){
    it('should find matches between simple strings ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).between('bc', 'gab').matches(), ['def']);
      assert.deepEqual(srxp(str).between('a', 'c').matches(), ['b', 'b']);
    });

    it('should match paranteses ', function(){
      var str = 'a(b(c))(d)';
      assert.deepEqual(srxp(str).between('(', ')').matches(), ['b(c)', 'c', 'd']);
      assert.deepEqual(srxp(str).between('b(', 'd)').matches(), ['c))(']);
    });
  });

  describe('exclude', function(){
    it('should exclude matches from result', function(){
      var str = 'abc aBc abc';
      assert.deepEqual(srxp(str).between('a','c').matches(), ['b', 'B', 'b']);
      assert.deepEqual(srxp(str).between('a','c').exclude('B').matches(), ['b', 'b']);
      assert.deepEqual(srxp(str).between('a','c').exclude('b').matches(), ['B']);
    });
  });

  describe('include', function(){
    it('should include matches from result', function(){
      var str = 'abcd aBcd abcd';
      assert.deepEqual(srxp(str).between('a','d').matches(), ['bc', 'Bc', 'bc']);
      assert.deepEqual(srxp(str).between('a','d').include('B').matches(), ['Bc']);
      assert.deepEqual(srxp(str).between('a','d').include('b').matches(), ['bc', 'bc']);
    });
  });


  describe('chaining', function(){
     it('should match chain searches', function(){
       var str = ('abcdefghi def');
       assert.deepEqual(srxp(str).match('def').match('def').matches(), ['def', 'def']);
       assert.deepEqual(srxp(str).match('cdefg').match('def').matches(), ['def']);
     });

    it('should match chain searches with between', function(){
      var str = ('abcdefghi def');
      assert.deepEqual(srxp(str).between('bc', 'gh').match('d').matches(), ['d']);
      assert.deepEqual(srxp(str).between('a', ' def').between('c', 'i').match('ef').matches(), ['ef']);

    });
  });
});