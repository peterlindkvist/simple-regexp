/// <reference path="../../assets/js/tundra.js" />
var assert = require('chai').assert;
var srxp = require('../src/srxp.js');

describe('Simple Regexp', function(){
  describe('simplify', function(){
    it('return same simple string', function(){
      assert.equal(srxp.simplify('abc'), 'abc');
      assert.equal(srxp.simplify('123'), '123');
    });

    it('return string without special chars', function(){
      assert.equal(srxp.simplify('åäöéÅÄÖü'), 'aaoeAAOu');
      assert.equal(srxp.simplify("a   b  \t c"), 'a b c');
    });

    it('return string without double spaces', function(){
      assert.equal(srxp.simplify('abc'), 'abc');
      assert.equal(srxp.simplify("a   b  \t c"), 'a b c');
    });
  });

  describe('trim', function(){
    it('remove spaces and tabs in at start and end of strings', function(){
      assert.equal(srxp.trim('abc'), 'abc');
      assert.equal(srxp.trim(" abc "), 'abc');
      assert.equal(srxp.trim("\t  abc\t  "), 'abc');
    });
  });

  describe('expandPattern', function(){

    it('fix spaces', function(){
      assert.equal(srxp.expandPattern('a b'), 'a\\s{1,}b');
      assert.equal(srxp.expandPattern('a   b'), 'a\\s{1,}b');
      assert.equal(srxp.expandPattern('a   b c'), 'a\\s{1,}b\\s{1,}c');
    });
  });

  describe('match', function(){
    it('simple string ', function(){
      assert.deepEqual(srxp('abcdefgabcd').match('abc').result(), ['abc', 'abc']);
      assert.deepEqual(srxp('abcdefgabcd').match('cde').result(), ['cde']);
      assert.notDeepEqual(srxp('abcdefgabcd').match('cde').result(), ['cdde']);

    });

    it('simple regexp ', function(){
      assert.deepEqual(srxp('abcdefgabc').match(/(abc)/g).result(), ['abc', 'abc']);
      assert.deepEqual(srxp('abcdefgabc').match(/(a|b)/g).result(), ['a', 'b', 'a', 'b']);
      assert.deepEqual(srxp('abcdefgabc').match(/(cde)/g).result(), ['cde']);
      assert.notDeepEqual(srxp('abcdefgabc').match(/(cde)/g).result(), ['cdde']);
      assert.notDeepEqual(srxp('abcdefgabc').match(/(cde)/g).result(), ['cdde']);

    });

    it('expanded searches', function(){
      var str = '<div  class = "test">content</div>';
      assert.deepEqual(srxp(str).match('<div').result(), ['<div']);
      assert.deepEqual(srxp(str).match('<div class').result(), ['<div  class']);
      assert.deepEqual(srxp(str).match('<div  class').result(), ['<div  class']);
      assert.deepEqual(srxp(str).match('<div   class').result(), ['<div  class']);
      assert.deepEqual(srxp(str).match('class = "').result(), ['class = "']);
    });
  });

  describe('between', function(){
    it('simple strings ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).between('bc', 'gab').result(), ['def']);
      assert.deepEqual(srxp(str).between('a', 'c').result(), ['b', 'b']);


    });
  });

  describe('exclude', function(){
    it('simple strings ', function(){
      var str = 'abc aBc abc';
      assert.deepEqual(srxp(str).between('a','c').result(), ['b', 'B', 'b']);
      assert.deepEqual(srxp(str).between('a','c').exclude('B').result(), ['b', 'b']);
      assert.deepEqual(srxp(str).between('a','c').exclude('b').result(), ['B']);
    });
  });

  describe('chaining', function(){
     it('should match chain searches', function(){
       var str = ('abcdefghi def');
       assert.deepEqual(srxp(str).match('def').match('def').result(), ['def', 'def']);
       assert.deepEqual(srxp(str).match('cdefg').match('def').result(), ['def']);
     });

    it('should match chain searches with between', function(){
      var str = ('abcdefghi def');
      assert.deepEqual(srxp(str).between('bc', 'gh').match('d').result(), ['d']);
      assert.deepEqual(srxp(str).between('a', ' def').between('c', 'i').match('ef').result(), ['ef']);

    });
  });
});