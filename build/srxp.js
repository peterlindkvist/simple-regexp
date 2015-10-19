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
        this.depth = 1;
        this.matches = [];
        this.regExps = [];
        this.matches.push([ this.source ]);
    };
    srxp.prototype.result = function() {
        return this.matches[this.depth - 1];
    };
    srxp.prototype.match = function(pattern) {
        var i, match, matches = [];
        var rxp = srxp._cleanupPattern(pattern);
        var prev = this.result();
        for (i = 0; i < prev.length; i++) {
            while (match = rxp.exec(prev[i])) {
                matches.push(match[1]);
            }
        }
        this._add(rxp, matches);
        return this;
    };
    srxp.prototype.between = function(start, end) {
        var rxp = new RegExp(start + "(" + srxp.ANY + ")" + end, "mg");
        this.match(rxp);
        return this;
    };
    srxp.prototype.exclude = function(pattern) {
        var i, match, matches = [];
        var rxp = new RegExp(pattern, "mg");
        var prev = this.result();
        for (i = 0; i < prev.length; i++) {
            if (rxp.exec(prev[i]) === null) {
                matches.push(prev[i]);
            }
        }
        this._add(null, matches);
        return this;
    };
    srxp.prototype._add = function(rxp, matches) {
        this.regExps.push(rxp);
        this.matches.push(matches);
        this.depth++;
    };
    srxp.ANY = "[\\s\\S]*?";
    srxp.simplify = function(text) {
        text = text.replace(/[åäáàã]/g, "a");
        text = text.replace(/[ÅÄÁÀÃ]/g, "A");
        text = text.replace(/[éèẽæë]/g, "e");
        text = text.replace(/[ÉÈẼÆË]/g, "E");
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
    srxp.trim = function(text) {
        text = text.replace(/^[\s|\t]*/g, "");
        text = text.replace(/[\s|\t]*$/g, "");
        text = text.replace(/(\s|\t){2,}/g, " ");
        return text;
    };
    srxp._cleanupPattern = function(pattern) {
        var rxp;
        if (pattern instanceof RegExp) {
            rxp = pattern;
        } else {
            pattern = srxp.expandPattern(pattern);
            rxp = new RegExp("(" + pattern + ")", "mg");
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