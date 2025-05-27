export const formatPercentage = (num) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  const numericValue = parseFloat(num);

  if (isNaN(numericValue)) {
    return typeof num === 'string' && num.includes('%') ? num : String(num);
  }

  const integerPercentage = Math.round(numericValue);
  return integerPercentage + "%";
};

export const formatNumber = (num, precision = 1) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  if (typeof num === "string" && isNaN(parseFloat(num))) return num;

  const numericValue = parseFloat(num);
  if (isNaN(numericValue)) return "N/A";

  if (precision === 0 && Number.isInteger(numericValue))
    return numericValue.toString();

  if (Math.abs(numericValue) >= 1000000000)
    return (numericValue / 1000000000).toFixed(precision) + "B";
  if (Math.abs(numericValue) >= 1000000)
    return (numericValue / 1000000).toFixed(precision) + "M";
  if (Math.abs(numericValue) >= 1000)
    return (numericValue / 1000).toFixed(precision) + "K";

  return typeof numericValue === "number"
    ? numericValue.toFixed(Math.min(precision, 2))
    : numericValue;
};