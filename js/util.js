"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrUndefined = (o) => {
    return o == null && o == undefined;
};
exports.padLeft = (str, length, fill = " ") => {
    if (exports.isNullOrUndefined(str)) {
        str = "";
    }
    if (fill.length != 1) {
        throw {
            name: "InvalidArgument",
            message: "fill length must be 1"
        };
    }
    let indent = length - str.length;
    let pad = new Array(indent < 0 ? 0 : indent + 1).join(fill);
    return pad + str;
};
//# sourceMappingURL=util.js.map