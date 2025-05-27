export const colors = {
    background1: "#0F111E",
    background2: "#121622",
    background3: "#272935",
    background4: "3A3D4C",
    cyan: "#272935",
    blue: "#5772EF",
    magenta: "#C422E6",
    font2: "#CBCBCB"
}

export function hexToRgba(hex, alpha = 1.0) {
    if (typeof hex !== "string") {
        console.error("Hex code must be a string.");
        return null;
    }

    // Remove the hash at the start if it's there
    let processedHex = hex.startsWith("#") ? hex.slice(1) : hex;

    // If shorthand form (e.g., "03F"), expand it ("0033FF")
    if (processedHex.length === 3) {
        processedHex = processedHex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    // Check if the processed hex code is valid (6 hex characters)
    if (!/^[0-9A-Fa-f]{6}$/.test(processedHex)) {
        console.error(
        `Invalid hex code format: "${hex}". Must be 3 or 6 hex characters.`
        );
        return null;
    }

    // Parse the r, g, b values
    const r = parseInt(processedHex.substring(0, 2), 16);
    const g = parseInt(processedHex.substring(2, 4), 16);
    const b = parseInt(processedHex.substring(4, 6), 16);

    // Validate and clamp alpha value
    let validAlpha = parseFloat(alpha);
    if (isNaN(validAlpha) || validAlpha < 0) {
        validAlpha = 0;
    } else if (validAlpha > 1) {
        validAlpha = 1;
    }

    return `rgba(${r}, ${g}, ${b}, ${validAlpha})`;
}