var exp = function() {
    var srxp = function() {
        console.log("hi");
    };
    srxp.simplify = function(text) {
        text = text.toLowerCase();
        text = text.replace(/[åäáàã]/g, "a");
        text = text.replace(/[éèẽæë]/g, "e");
        text = text.replace(/[öõø]/g, "o");
        text = text.replace(/[üũ]/g, "u");
        text = text.replace(/(\s|\t){2,}/g, " ");
        return text;
    };
    srxp.prototype.between = function(start, end) {
        console.log(start, end);
    };
    return srxp;
}();

if (typeof exports === "undefined") {
    srxp = exp;
} else {
    module.exports = exports = exp;
}