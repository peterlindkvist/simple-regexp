var exp = function() {
    var srxp = function(source) {
        if (srxp === this.constructor) {
            this.init(source);
        } else {
            return new srxp(source);
        }
    };
    srxp.prototype.init = function(source) {
        this.source = source;
        this._texts = [];
        this._depth = 1;
        this._matches = [];
        this._regExps = [];
        this._texts.push(this._texts);
        this._matches.push([ this.source ]);
    };
    srxp.prototype.matches = function() {
        return this._matches[this._depth - 1];
    };
    srxp.prototype.match = function() {
        var i, j, k, match, matches = [], rxp, prev;
        prev = this.matches();
        for (k = 0; k < arguments.length; k++) {
            rxp = srxp._getRegExp(arguments[k]);
            for (i = 0; i < prev.length; i++) {
                while (match = rxp.exec(prev[i])) {
                    if (match.length === 1) {
                        matches.push(match[0]);
                    } else {
                        for (j = 1; j < match.length; j++) {
                            matches.push(match[j]);
                        }
                    }
                }
            }
        }
        this._add(rxp, matches);
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
                    pos: match.index + match[0].length,
                    end: 0
                });
            }
            while (match = endRxp.exec(prev[i])) {
                indexes.push({
                    type: "end",
                    pos: match.index
                });
            }
            indexes.sort(function(a, b) {
                return a.pos > b.pos;
            });
            for (j = 0; j < indexes.length; j++) {
                index = indexes[j];
                if (index.type === "start") {
                    for (k = j + 1; k < indexes.length; k++) {
                        if (indexes[k].type === "start") {
                            depth++;
                        } else if (indexes[k].type === "end") {
                            if (depth === 0) {
                                index.end = indexes[k].pos;
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
                if (index.type === "start" && index.pos < index.end) {
                    match = prev[i].substring(index.pos, index.end);
                    matches.push(match);
                }
            }
        }
        this._add(undefined, matches);
        return this;
    };
    srxp.prototype.exclude = function(pattern) {
        var i, matches = [];
        var rxp = srxp._getRegExp(pattern);
        var prev = this.matches();
        for (i = 0; i < prev.length; i++) {
            if (rxp.exec(prev[i]) === null) {
                matches.push(prev[i]);
            }
        }
        this._add(null, matches);
        return this;
    };
    srxp.prototype.include = function(pattern) {
        var i, matches = [];
        var rxp = srxp._getRegExp(pattern);
        var prev = this.matches();
        for (i = 0; i < prev.length; i++) {
            if (rxp.exec(prev[i]) !== null) {
                matches.push(prev[i]);
            }
        }
        this._add(null, matches);
        return this;
    };
    srxp.prototype._add = function(rxp, matches, text) {
        this._regExps.push(rxp);
        this._matches.push(matches);
        this._texts.push(text);
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
        text = text.replace(/\s{1,}/g, "\\s{1,}");
        return text;
    };
    srxp.escape = function(text) {
        text = text.replace(/([\(\)\[\]\{\}\\\?\.])/g, "\\$1");
        return text;
    };
    srxp.trim = function(text) {
        text = text.replace(/^(\s|\t)*/g, "");
        text = text.replace(/(\s|\t)*$/g, "");
        text = text.replace(/(\s|\t){2,}/g, " ");
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
    return srxp;
}();

if (typeof exports === "undefined") {
    srxp = exp;
} else {
    module.exports = exports = exp;
}