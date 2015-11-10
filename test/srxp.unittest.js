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
      assert.equal(srxp.expandPattern('a b'), 'a\\s+b');
      assert.equal(srxp.expandPattern('a   b'), 'a\\s+b');
      assert.equal(srxp.expandPattern('a   b c'), 'a\\s+b\\s+c');
      assert.equal(srxp.expandPattern('a  \n \t b  \rc'), 'a\\s+b\\s+c');
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

    it('should find a match with global regexp ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match(/abc/g).matches(), ['abc', 'abc']);
      assert.deepEqual(srxp(str).match(/a|b/g).matches(), ['a', 'b', 'a', 'b']);
      assert.deepEqual(srxp(str).match(/cde/g).matches(), ['cde']);
      assert.notDeepEqual(srxp(str).match(/cde/g).matches(), ['cdde']);

    });

    it('should find a match with non global regexp ', function(){
      var str = 'abcdefgabc';
      assert.deepEqual(srxp(str).match(/abc/).matches(), ['abc']);
      assert.deepEqual(srxp(str).match(/a|b/).matches(), ['a']);
      assert.deepEqual(srxp(str).match(/cd(e)/).matches(), ['e']);
      assert.deepEqual(srxp(str).match(/(cd(e))/).matches(), ['cde', 'e']);
      assert.notDeepEqual(srxp(str).match(/cde/).matches(), ['cdde']);
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

  describe('word', function(){
    it('should find words in string', function(){
      var str = 'abcd aBcd abcd';
      assert.deepEqual(srxp(str).word().matches(), ['abcd',  'aBcd', 'abcd']);
      assert.deepEqual(srxp('abc').word().matches(), ['abc']);
    });

    it('should find words in multiline string', function(){
      var str = "abcd \naBcd. \rabcd";
      assert.deepEqual(srxp(str).word().matches(), ['abcd',  'aBcd', 'abcd']);
    });
  });

  describe('size', function(){
    it('should find words in string', function(){
      var str = 'abcd abc abcd';
      assert.deepEqual(srxp(str).word().size(2).matches(), []);
      assert.deepEqual(srxp(str).word().size(3).matches(), ['abc']);
      assert.deepEqual(srxp(str).word().size(4).matches(), ['abcd', 'abcd']);
      assert.deepEqual(srxp(str).word().size(5).matches(), []);
      assert.deepEqual(srxp(str).word().size(4,6).matches(), ['abcd', 'abcd']);
      assert.deepEqual(srxp(str).word().size(undefined, 3).matches(), ['abc']);

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

  describe('examples in readme', function(){
     it('should find some words in a sentence', function(){
       assert.deepEqual(srxp('hi this is a simple text').word().include('s').matches(), ['this', 'is', 'simple']);
     });

     it('should find links in html', function(){
       var html = '<a href="link1.html">link1</a> <a href="link2.html" rel="nofollow">link2</a>  <a rel="nofollow" href="link3.html">link3</a>';
       var matches = srxp(html).between('<a', '>').exclude('rel="nofollow"').between('href="', '"').matches();
       assert.deepEqual(matches, ['link1.html']);
     });

    it('should replace a pattern', function(){
      assert.deepEqual(srxp('where is my dog?').match('dog').replace('cat').text(), 'where is my cat?');
    });

    it('should pass examples in .between', function(){
      assert.deepEqual(srxp('a (b c (d) e)').between('(', ')').matches(), ['b c (d) e', 'd']);
    });

    it('should pass examples in .match', function(){
      assert.deepEqual(srxp('ab bb cb cc').match('ab', 'cb').matches(), ['ab', 'cb']);
      assert.deepEqual(srxp('ab bb cb cc').match(/.b/g).match(/c./g).matches(), ['cb']);
    });

    it('should pass examples in .replace', function(){
      assert.deepEqual(srxp('abcdefghij').match('a', 'e', 'i').replace('VOWEL').text(), 'VOWELbcdVOWELfghVOWELj');
      assert.deepEqual(srxp('abcdefghij').match(/[aei]/g).replace(['V1', 'V2']).text(), 'V1bcdV2fghij');

      var replace = function(text, index, length){
        return text.toUpperCase() + '@' + index;
      };
      assert.deepEqual(srxp('abcdefghij').match('a', 'e', 'i').replace(replace).text(), 'A@0bcdE@4fghI@8j');
       //A@0bcdE@5fghI@10j

    });




  });
});