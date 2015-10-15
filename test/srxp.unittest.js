/// <reference path="../../assets/js/tundra.js" />
var assert = require('chai').assert;
var srxp = require('../src/srxp.js');

describe('shared', function(){
  describe('simplify', function(){
    it('return string without special chars', function(){
      assert.equal(srxp.simplify('abc'), 'abc');
      assert.equal(srxp.simplify('åäöéÅÄÖü'), 'aaoeaaou');
      assert.equal(srxp.simplify('123'), '123');
      assert.equal(srxp.simplify("a   b  \t c"), 'a b c');
    });
  });
});