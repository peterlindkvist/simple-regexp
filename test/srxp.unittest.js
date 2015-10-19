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
      var s = srxp('abcdefgabc');
      assert.deepEqual(s.match('abc').result(), ['abc', 'abc']);
      assert.deepEqual(s.match('cde').result(), ['cde']);
      assert.notDeepEqual(s.match('cde').result(), ['cdde']);

    });

    it('simple regexp ', function(){
      var s = srxp('abcdefgabc');
      assert.deepEqual(s.match(/(abc)/g).result(), ['abc', 'abc']);
      assert.deepEqual(s.match(/(a|b)/g).result(), ['a', 'b', 'a', 'b']);
      assert.deepEqual(s.match(/(cde)/g).result(), ['cde']);
      assert.notDeepEqual(s.match(/(cde)/g).result(), ['cdde']);
      assert.notDeepEqual(s.match(/(cde)/g).result(), ['cdde']);

    });

    it('expanded searches', function(){
      var s = srxp('<div  class = "test">content</div>');
      assert.deepEqual(s.match('<div').result(), ['<div']);
      assert.deepEqual(s.match('<div class').result(), ['<div  class']);
      assert.deepEqual(s.match('<div  class').result(), ['<div  class']);
      assert.deepEqual(s.match('<div   class').result(), ['<div  class']);
      assert.deepEqual(s.match('class = "').result(), ['class = "']);
    });
  });

  describe('between', function(){
    it('simple strings ', function(){
      var s = srxp('abcdefgabc');
      assert.deepEqual(s.between('bc', 'gab').result(), ['def']);
      assert.deepEqual(s.between('a', 'c').result(), ['b', 'b']);


    });
  });
});