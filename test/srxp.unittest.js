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
      assert.deepEqual(srxp(str).match('abc').result(), ['abc', 'abc']);
      assert.deepEqual(srxp(str).match('cde').result(), ['cde']);
      assert.notDeepEqual(srxp(str).match('cde').result(), ['cdde']);

    });

    it('should find multiple strings ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match('abcd', 'ef').result(), ['abcd', 'ef']);
      assert.deepEqual(srxp(str).match('abc', 'ef').result(), ['abc', 'abc', 'ef']);

    });

    it('should find a match with regexp ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match(/abc/g).result(), ['abc', 'abc']);
      assert.deepEqual(srxp(str).match(/a|b/g).result(), ['a', 'b', 'a', 'b']);
      assert.deepEqual(srxp(str).match(/cde/g).result(), ['cde']);
      assert.notDeepEqual(srxp(str).match(/cde/g).result(), ['cdde']);
      assert.notDeepEqual(srxp(str).match(/cde/g).result(), ['cdde']);

    });

    it('should find matches in a grouped regexp ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match(/ab(c)/g).result(), ['c', 'c']);
      assert.deepEqual(srxp(str).match(/(ab(c))/g).result(), ['abc', 'c', 'abc', 'c']);
      assert.deepEqual(srxp(str).match(/((a)(.*)d)(.{3})/g).result(), ['abcd', 'a', 'bc', 'efg']);
    });

    it('should find mathces in expanded searches', function(){
      var str = '<div  class = "test">content</div>';
      assert.deepEqual(srxp(str).match('<div').result(), ['<div']);
      assert.deepEqual(srxp(str).match('<div class').result(), ['<div  class']);
      assert.deepEqual(srxp(str).match('<div  class').result(), ['<div  class']);
      assert.deepEqual(srxp(str).match('<div   class').result(), ['<div  class']);
      assert.deepEqual(srxp(str).match('class = "').result(), ['class = "']);
    });
  });

  describe('between', function(){
    it('should find matches between simple strings ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).between('bc', 'gab').result(), ['def']);
      assert.deepEqual(srxp(str).between('a', 'c').result(), ['b', 'b']);
    });

    it('should find match paranteses ', function(){
      var str = 'a(b(c))(d)';
      assert.deepEqual(srxp(str).between('\\(', '\\)').result(), ['b(c)', 'c', 'd']);
      assert.deepEqual(srxp(str).between('b\\(', 'd\\)').result(), ['c))(']);
    });
  });

  describe('exclude', function(){
    it('should exclude matches from result', function(){
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