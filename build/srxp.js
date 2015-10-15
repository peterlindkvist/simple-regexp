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
        this.depth = 0;
        this.matches = [];
        this.regExps = [];
    };
    srxp.prototype.result = function() {
        return this.matches[this.depth - 1];
    };
    srxp.prototype.match = function(pattern) {
        var rxp = srxp._cleanupPattern(pattern);
        var matches = this.source.match(rxp);
        this._add(rxp, matches);
        return this;
    };
    srxp.prototype.between = function(start, end) {
        var match, matches = [];
        var rxp = new RegExp(start + srxp.ANY + end, "mg");
        while (match = rxp.exec(this.source)) {
            matches.push(match[1]);
        }
        this._add(rxp, matches);
        return this;
    };
    srxp.prototype._add = function(rxp, matches) {
        this.regExps[this.depth] = rxp;
        this.matches[this.depth] = matches;
        this.depth++;
    };
    srxp.ANY = "([\\s\\S]*?)";
    srxp.simplify = function(text) {
        text = text.replace(/[åäáàã]/g, "a");
        text = text.replace(/[ÅÄÁÀÃ]/g, "A");
        text = text.replace(/[éèẽæë]/g, "e");
        text = text.replace(/[ÉÈẼÆË]/g, "E");
        text = text.replace(/[öõø]/g, "o");
        text = text.replace(/[ÖÕØ]/g, "O");
        text = text.replace(/[üũ]/g, "u");
        text = text.replace(/[ÜŨ]/g, "U");
        text = text.replace(/(\s|\t){2,}/g, " ");
        return text;
    };
    srxp._cleanupPattern = function(pattern) {
        var rxp;
        if (pattern instanceof RegExp) {
            rxp = pattern;
        } else {
            rxp = new RegExp(pattern, "g");
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