"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrUndefined = function (o) {
    return o == null && o == undefined;
};
exports.padLeft = function (str, length, fill) {
    if (fill === void 0) { fill = " "; }
    if (exports.isNullOrUndefined(str)) {
        str = "";
    }
    if (fill.length != 1) {
        throw {
            name: "InvalidArgument",
            message: "fill length must be 1"
        };
    }
    var indent = length - str.length;
    var pad = new Array(indent < 0 ? 0 : indent + 1).join(fill);
    return pad + str;
};
//# sourceMappingURL=util.js.map