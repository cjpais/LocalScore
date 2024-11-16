export const capitalize = (str: string) => {
  // Check if the input is a string and not empty
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }

  // Capitalize the first letter and concatenate with the rest of the string
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
