import chroma from "chroma-js";

export const capitalize = (str: string) => {
  // Check if the input is a string and not empty
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }

  // Capitalize the first letter and concatenate with the rest of the string
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const scale = chroma
  .cubehelix()
  .start(280)
  .rotations(-0.5)
  .gamma(0.8)
  .lightness([0.3, 0.8])
  .scale();

export const getColor = (index: number, max: number = 10) => {
  return scale(index / max).hex();
};
