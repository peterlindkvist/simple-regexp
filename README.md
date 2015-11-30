# Simple Regexp

## Description

A chainable regular expression wrapper for text search and replacement.

## Examples
    
    srxp('hi this is a simple text').word().include('s'); // ['this', 'is', 'simple']
    
or finds all links in a html document without rel="nofollow"
    
    srxp(html).between('<a', '>').exclude('rel="nofollow"').between('href="', '"').matches();
    
or do a text replacement

    srxp('where is my dog?').match(/dog/g).replace('cat').text(); //where is my cat?


## API

### General
#### The pattern in-parameter

Some metod has one or more `pattern` as in-parameter. Patterns are either a string or RegExp. 

Strings are converted before turned into a regular expression. Single spaces are turn into one or more spaces, tabs, newlines (\s+). Special chars as [, ( are escaped. The global flag is used. 

RegExp are used as they are with flags.  

#### Chaining
srxp instances are chainable to make it simple to write complex searches in a easy and understandable way. Se examples above.

### srxp(text)                        

Returns a simple regexp instance. The inparameter is the text to use as source. 
    
### .between(startpattern, endpattern)

Find text between patterns. The start and end patterns are paired 

    srxp('a (b c (d) e)').between('(', ')').matches();     //['b c (d) e', 'd']
    
compared with a simple regexp where pairing of patterns is hard

    'a (b c (d) e)'.match(/\((.*)\)/);      //["(b c (d) e)", "b c (d) e"]
    'a (b c (d) e)'.match(/\((.*?)\)/);     //["(b c (d)", "b c (d"]
    
It might be possible with recursive regexp, ?R, but it's not supported in js. 

### .exclude(pattern)

Exclude matches with pattern

    srxp('abcd aBcd abcd').between('a','d').include('B').matches();  //['bc', 'bc']

### .include(pattern)

Include only matches including the pattern. 

    srxp('abcd aBcd abcd').between('a','d').include('B').matches();     //['Bc'])
   
It's similar to match but returns the whole string instead of only the matches. 

    srxp('abcd aBcd abcd').between('a','d').match('B').matches();     //['B'])

### .match(pattern1, pattern2 ...)

Match patterns and adds them to matches. Several patterns can be used to match one pattern or another. 

    srxp('ab bb cb cc').match('ab', 'cb').matches();    //['ab', 'cb']
    
to match with and you have to chain the matches

    srxp('ab bb cb cc').match(/.b/g).match(/c./g).matches()    //['cb']
    
### .matches()

Returns the array of matches. See most examples. 

### .replace(newValue)

replaces the matched strings. To fetch the source with the replaced strings use `.text()`
    
    srxp('abcdefghij').match('a', 'e', 'i').replace('VOWEL').text() //VOWELbcdVOWELfghVOWELj

newValue can also be a array and the replaces are user from the array. 

    srxp('abcdefghij').match('a', 'e', 'i').replace(['V1', 'V2']).text() //V1bcdV2fghij
    
Or a function. 

    var replace = function(text, index, length){
        return text.toUpperCase() + '@' + index;
    };
    srxp('abcdefghij').match(/[aei]/g).replace(replace).text() //A@0bcdE@4fghI@8j

### .size(atLeast, atMost)

Include only matches with given length. 

      var str = 'abcd abc abcd';
      srxp(str).word().size(3).matches();              // exact 3 chars ['abc']
      srxp(str).word().size(4,6).matches();            // 4 to 6 chars ['abcd', 'abcd']
      srxp(str).word().size(undefined, 3).matches();   // less or equal 3 chars ['abc'];
      
### .text()

returns the source text including replacements, se `.replace()` above.

### .word()

Splits a string into words. Alias for `.match(/[\w]+/g)`. 

### srxp.trim(text)

Returns a string with spaces, tabs and newlines removed from start and end of the string.  It also converts multiple spaces, tabs and newlines into one space. 

## Development

- `npm install` to install dependencies
- `grunt start` to build, start development server and watch for changes

To test the script in a browser run `grunt start` and then navigate to ['data:text/html,<html><script type="text/javascript" src="http://localhost:8888/srxp.js"></script></html>'](data:text/html,<html><script type="text/javascript" src="http://localhost:8888/srxp.js"></script></html>) 

## Test

There are some test coverage. It could of course be more comprehensive

    grunt test
      



