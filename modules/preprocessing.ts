export const preprocessImage = (pixels: number[][]): number[][] => {
    // Normalize pixels
    return pixels.map((row) => row.map((pixel) => pixel / 255));
};
