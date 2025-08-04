import { parseAbi } from "viem";

// ERC20 Token ABI (for RON and KTTY tokens)
export const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
]);

export function formatNumberToHuman(num: number, digits = 1) {

  if (num === 999999) {
    return "999,999"
  }

  // Define the suffixes and their corresponding thresholds
  const suffixes = [
    { value: 1e12, symbol: "T" }, // Trillion
    { value: 1e9, symbol: "B" }, // Billion
    { value: 1e6, symbol: "M" }, // Million
    { value: 1e3, symbol: "K" }, // Thousand
  ];

  // Handle 0 or undefined separately
  if (num === 0 || !num) return "0";

  // Handle negative numbers
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Find the appropriate suffix
  for (const { value, symbol } of suffixes) {
    if (absNum >= value) {
      // Calculate the formatted value with proper rounding
      let formattedValue = (absNum / value).toFixed(digits);

      // Remove trailing zeros after decimal point
      formattedValue = formattedValue.replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

      // Return the formatted string with the negative sign if needed
      return (isNegative ? "-" : "") + formattedValue + symbol;
    }
  }

  // If number is smaller than 1000, just return it as is
  return num.toString();
}
