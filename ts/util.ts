export const isNullOrUndefined: (o: any) => boolean = (o: any): boolean => {
  return o === null || o === undefined;
};

export const padLeft = (str: string, length: number, fill: string = " "): string => {
  if (isNullOrUndefined(str)) {
    str = "";
  }

  if (fill.length !== 1) {
    throw {
      message: "fill length must be 1",
      name: "InvalidArgument"
    };
  }

  const indent: number = length - str.length;
  const pad: string = new Array(indent < 0 ? 0 : indent + 1).join(fill);
  return pad + str;
};
