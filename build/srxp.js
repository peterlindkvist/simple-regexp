var exp = function() {
    var srxp = function(source, trim) {
        if (srxp === this.constructor) {
            this.init(source, trim);
        } else {
            return new srxp(source, trim);
        }
    };
    srxp.prototype.init = function(source, trim) {
        trim = trim === undefined ? false : trim;
        var i, text = trim ? srxp.trim(source) : source;
        this.source = source;
        this._depth = 1;
        this._stack = [ {
            match: [ {
                text: text,
                start: 0,
                length: text.length
            } ],
            text: text
        } ];
    };
    srxp.prototype.matches = function() {
        return srxp.pluck(this._stack[this._depth - 1].match, "text");
    };
    srxp.prototype.text = function() {
        return this._stack[this._depth - 1].text;
    };
    srxp.prototype.match = function() {
        var i, j, k, match, matches = [], rxp, prev, cnt;
        prev = this.matches();
        for (k = 0; k < arguments.length; k++) {
            rxp = srxp._getRegExp(arguments[k]);
            for (i = 0; i < prev.length; i++) {
                cnt = 0;
                if (rxp.global) {
                    while (match = rxp.exec(prev[i])) {
                        matches = matches.concat(srxp._parseMatch(match));
                        if (cnt++ > 1e5) {
                            console.error("infinity loop");
                            break;
                        }
                    }
                } else {
                    match = prev[i].match(rxp);
                    matches = matches.concat(srxp._parseMatch(match));
                }
            }
        }
        this._add({
            regex: rxp,
            match: matches
        });
        return this;
    };
    srxp.prototype.between = function(start, end) {
        var i, j, k, match, matches = [], indexes = [], index, depth = 0;
        var startRxp = srxp._getRegExp(start);
        var endRxp = srxp._getRegExp(end);
        var prev = this.matches();
        for (i = 0; i < prev.length; i++) {
            while (match = startRxp.exec(prev[i])) {
                indexes.push({
                    type: "start",
                    start: match.index + match[0].length,
                    end: 0
                });
            }
            while (match = endRxp.exec(prev[i])) {
                indexes.push({
                    type: "end",
                    start: match.index
                });
            }
            indexes.sort(function(a, b) {
                return a.start > b.start;
            });
            for (j = 0; j < indexes.length; j++) {
                index = indexes[j];
                if (index.type === "start") {
                    for (k = j + 1; k < indexes.length; k++) {
                        if (indexes[k].type === "start") {
                            depth++;
                        } else if (indexes[k].type === "end") {
                            if (depth === 0) {
                                index.end = indexes[k].start;
                                break;
                            } else {
                                depth--;
                            }
                        }
                    }
                }
            }
            for (j = 0; j < indexes.length; j++) {
                index = indexes[j];
                if (index.type === "start" && index.start < index.end) {
                    match = prev[i].substring(index.start, index.end);
                    matches.push({
                        text: match,
                        start: index.start,
                        length: match.length
                    });
                }
            }
        }
        this._add({
            match: matches
        });
        return this;
    };
    srxp.prototype.replace = function(replace) {
        var t, i, j, repl;
        var text = this.text();
        var prev = this._stack[this._depth - 1].match;
        var match = [];
        prev.sort(function(a, b) {
            return a.start > b.start;
        });
        for (i = prev.length - 1; i >= 0; i--) {
            if (typeof replace === "string") {
                repl = replace;
                text = srxp.stringSplice(text, prev[i].start, prev[i].length, repl);
            } else if (replace instanceof Function) {
                repl = replace.call(null, prev[i].text, prev[i].start, prev[i].length);
                text = srxp.stringSplice(text, prev[i].start, prev[i].length, repl);
            } else if (replace instanceof Array) {
                repl = replace[i] === undefined ? prev[i].text : replace[i];
                text = srxp.stringSplice(text, prev[i].start, prev[i].length, repl);
            }
            match.push({
                text: repl,
                start: prev[i].start,
                length: repl.length
            });
        }
        this._add({
            match: match,
            text: text
        });
        return this;
    };
    srxp.prototype.exclude = function(pattern) {
        var i, matches = [];
        var rxp = srxp._getRegExp(pattern);
        var prev = this._stack[this._depth - 1].match;
        for (i = 0; i < prev.length; i++) {
            if (prev[i].text.search(rxp) === -1) {
                matches.push(prev[i]);
            }
        }
        this._add({
            match: matches
        });
        return this;
    };
    srxp.prototype.include = function(pattern) {
        var i, matches = [];
        var rxp = srxp._getRegExp(pattern);
        var prev = this._stack[this._depth - 1].match;
        for (i = 0; i < prev.length; i++) {
            if (prev[i].text.search(rxp) !== -1) {
                matches.push(prev[i]);
            }
        }
        this._add({
            match: matches
        });
        return this;
    };
    srxp.prototype.word = function() {
        var rxp = /[\w]+/g;
        this.match(rxp);
        return this;
    };
    srxp.prototype.size = function(atLeast, atMost) {
        atLeast = atLeast === undefined ? 0 : atLeast;
        atMost = atMost === undefined ? atLeast : atMost;
        var i, len, matches = [];
        var prev = this._stack[this._depth - 1].match;
        for (i = 0; i < prev.length; i++) {
            len = prev[i].text.length;
            if (len >= atLeast && len <= atMost) {
                matches.push(prev[i]);
            }
        }
        this._add({
            match: matches
        });
        return this;
    };
    srxp.prototype._add = function(properties) {
        if (properties.text === undefined) {
            properties.text = this._stack[this._depth - 1].text;
        }
        this._stack.push(properties);
        this._depth++;
    };
    srxp.simplify = function(text) {
        text = text.replace(/[åäáàãæ]/g, "a");
        text = text.replace(/[ÅÄÁÀÃÆ]/g, "A");
        text = text.replace(/[éèẽë]/g, "e");
        text = text.replace(/[ÉÈẼË]/g, "E");
        text = text.replace(/[öõø]/g, "o");
        text = text.replace(/[ÖÕØ]/g, "O");
        text = text.replace(/[üũ]/g, "u");
        text = text.replace(/[ÜŨ]/g, "U");
        text = srxp.trim(text);
        return text;
    };
    srxp.expandPattern = function(text) {
        text = text.replace(/\s+/g, "\\s+");
        return text;
    };
    srxp.escape = function(text) {
        text = text.replace(/([\(\)\[\]\{\}\\\?\.])/g, "\\$1");
        return text;
    };
    srxp.trim = function(text) {
        text = text.replace(/^(\s)*/g, "");
        text = text.replace(/(\s)*$/g, "");
        text = text.replace(/(\s){2,}/g, " ");
        return text;
    };
    srxp._getRegExp = function(pattern, escape, expand) {
        var rxp;
        escape = escape === undefined ? true : escape;
        expand = expand === undefined ? true : expand;
        if (pattern instanceof RegExp) {
            rxp = pattern;
        } else {
            if (escape) {
                pattern = srxp.escape(pattern);
            }
            if (expand) {
                pattern = srxp.expandPattern(pattern);
            }
            rxp = new RegExp(pattern, "mg");
        }
        return rxp;
    };
    srxp._parseMatch = function(match) {
        var matches = [];
        if (match.length === 1) {
            matches.push({
                text: match[0],
                start: match.index,
                length: match[0].length
            });
        } else {
            for (j = 1; j < match.length; j++) {
                matches.push({
                    text: match[j],
                    start: match.index,
                    length: match[j].length
                });
            }
        }
        return matches;
    };
    srxp.pluck = function(arr, property) {
        var i, ret = [];
        for (i = 0; i < arr.length; i++) {
            ret.push(arr[i][property]);
        }
        return ret;
    };
    srxp.stringSplice = function(text, start, length, insert) {
        return text.slice(0, start) + insert + text.slice(start + length);
    };
    return srxp;
}();

if (typeof exports === "undefined") {
    srxp = exp;
} else {
    module.exports = exports = exp;
}