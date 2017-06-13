import { padLeft, isNullOrUndefined } from "../ts/util";

describe("util: padLeft(str: string, length: number, fill: string): string", () => {
    it("padLeft(undefined, 0) returns ''", () => {
        let undefinedVariable: undefined;
        expect(padLeft(undefinedVariable, 0)).toEqual("");
    });
    it("padLeft(null, 0) returns ''", () => expect(padLeft(null, 0)).toEqual(""));
    it("padLeft('', 0) returns ''", () => expect(padLeft("", 0)).toEqual(""));
    it("padLeft('x', 0) returns 'x'", () => expect(padLeft("x", 0)).toEqual("x"));
    it("padLeft('x', 3) returns '  x'", () => expect(padLeft("x", 3)).toEqual("  x"));
    it("padLeft('x', 0, '?') returns 'x'", () => expect(padLeft("x", 0, "?")).toEqual("x"));
    it("padLeft('x', 3, '?') returns '??x'", () => expect(padLeft("x", 3, "?")).toEqual("??x"));
    it("padLeft('x', 3, '??') throws", () => expect(() => padLeft("x", 3, "??")).toThrow());
});

describe("util: test isNullOrUndefined(o: any): boolean", () => {
    it("isNullOrUndefined(undefined) returns true", () => {
        let undefinedVariable: undefined;
        expect(isNullOrUndefined(undefinedVariable)).toBeTruthy();
    });
    it("isNullOrUndefined(null) returns true", () => expect(isNullOrUndefined(null)).toBeTruthy());
    it("isNullOrUndefined('') returns false", () => expect(isNullOrUndefined("")).toBeFalsy());
    it("isNullOrUndefined([]) returns false", () => expect(isNullOrUndefined([])).toBeFalsy());
    it("isNullOrUndefined({}) returns false", () => expect(isNullOrUndefined({})).toBeFalsy());
    it("isNullOrUndefined(['x']) returns false", () => expect(isNullOrUndefined(["x"])).toBeFalsy());
    it("isNullOrUndefined([0]) returns false", () => expect(isNullOrUndefined([0])).toBeFalsy());
    it("isNullOrUndefined([{}, {}]) returns false", () => expect(isNullOrUndefined([{}, {}])).toBeFalsy());
    it("isNullOrUndefined(false) returns false", () => expect(isNullOrUndefined(false)).toBeFalsy());
    it("isNullOrUndefined(true) returns false", () => expect(isNullOrUndefined(true)).toBeFalsy());
});
