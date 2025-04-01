import { MnistData } from './mnist'

export type KnnDistance = {
    index: number
    distance: number
}

export type Match = {
    index: number
    digit: number
    distance: number
    image: number[][]
}

export type PredictionResult = {
    digit: number
    matches: Match[]
    confidence: number // Add confidence score
}

// Function to normalize image values to range [0, 1]
export function normalizeImage(image: number[]): number[] {
    const max = Math.max(...image)
    if (max === 0) return image // Avoid division by zero
    return image.map((pixel) => pixel / max)
}

// Function to preprocess an image for better recognition
export function preprocessImage(image: number[][]): number[][] {
    // Apply a series of preprocessing steps
    let processed = centerDigit(image)
    processed = smoothImage(processed)
    return processed
}

// Center a digit in its image frame
export function centerDigit(image: number[][]): number[][] {
    // Find the bounding box of the digit
    let minRow = image.length
    let maxRow = 0
    let minCol = image[0].length
    let maxCol = 0

    // Find the actual digit bounds
    for (let i = 0; i < image.length; i++) {
        for (let j = 0; j < image[i].length; j++) {
            if (image[i][j] > 0) {
                minRow = Math.min(minRow, i)
                maxRow = Math.max(maxRow, i)
                minCol = Math.min(minCol, j)
                maxCol = Math.max(maxCol, j)
            }
        }
    }

    // If no digit is found, return the original image
    if (minRow >= maxRow || minCol >= maxCol) {
        return image
    }

    // Calculate the center of the digit
    const digitCenterRow = Math.floor((minRow + maxRow) / 2)
    const digitCenterCol = Math.floor((minCol + maxCol) / 2)

    // Calculate the center of the image
    const imageCenterRow = Math.floor(image.length / 2)
    const imageCenterCol = Math.floor(image[0].length / 2)

    // Calculate the shift needed to center the digit
    const rowShift = imageCenterRow - digitCenterRow
    const colShift = imageCenterCol - digitCenterCol

    // Create a new centered image
    const centered = Array.from({ length: image.length }, () => Array(image[0].length).fill(0))

    // Copy the digit to the centered position
    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            const newRow = i + rowShift
            const newCol = j + colShift

            if (newRow >= 0 && newRow < image.length && newCol >= 0 && newCol < image[0].length) {
                centered[newRow][newCol] = image[i][j]
            }
        }
    }

    return centered
}

// Apply a light smoothing to the image
function smoothImage(image: number[][]): number[][] {
    const result = Array.from({ length: image.length }, () => Array(image[0].length).fill(0))

    // Apply a simple 3x3 averaging filter
    const kernelSize = 3
    const offset = Math.floor(kernelSize / 2)

    for (let i = 0; i < image.length; i++) {
        for (let j = 0; j < image[i].length; j++) {
            let sum = 0
            let count = 0

            // Apply kernel
            for (let ki = -offset; ki <= offset; ki++) {
                for (let kj = -offset; kj <= offset; kj++) {
                    const ni = i + ki
                    const nj = j + kj

                    // Skip out-of-bounds pixels
                    if (ni >= 0 && ni < image.length && nj >= 0 && nj < image[i].length) {
                        sum += image[ni][nj]
                        count++
                    }
                }
            }

            // Calculate average
            result[i][j] = count > 0 ? Math.round(sum / count) : 0
        }
    }

    return result
}

export function knnClassifier(
    mnistData: MnistData,
    testImage: number[][],
    k: number,
): PredictionResult {
    if (!mnistData.train.images.length || !mnistData.train.labels.length) {
        throw new Error('Training data cannot be empty')
    }

    // Preprocess and flatten the test image
    const processedImage = preprocessImage(testImage)
    const flattenedTestImage = normalizeImage(flattenImage(processedImage))

    // Calculate the distance between the test image and all the training images
    const distances: KnnDistance[] = []
    for (let i = 0; i < mnistData.train.images.length; i++) {
        const flattenedTrainImage = normalizeImage(flattenImage(mnistData.train.images[i]))
        // Use a combined distance metric that's more robust
        const distance = combinedDistance(flattenedTestImage, flattenedTrainImage)
        distances.push({ index: i, distance })
    }

    // Sort the distances
    distances.sort((a, b) => a.distance - b.distance)

    // Get the k nearest neighbors
    const kNearestNeighbors = distances.slice(0, k)

    // Check for exact matches - if we have a perfect match, return it immediately
    const exactMatch = kNearestNeighbors.find(match => match.distance === 0)
    if (exactMatch) {
        const digit = mnistData.train.labels[exactMatch.index]
        return {
            digit,
            confidence: 100,
            matches: [{
                index: exactMatch.index,
                digit: digit,
                distance: 0,
                image: mnistData.train.images[exactMatch.index],
            }]
        }
    }
    // Weight votes by inverse distance (closer neighbors have more influence)
    const labelScores: { [key: number]: number } = {}
    let totalScore = 0

    for (const neighbor of kNearestNeighbors) {
        const label = mnistData.train.labels[neighbor.index]
        // Add weight inversely proportional to distance with a steeper curve
        const weight = 1 / Math.pow(neighbor.distance + 0.001, 2) // Square to emphasize closer matches

        if (!labelScores[label]) {
            labelScores[label] = 0
        }
        labelScores[label] += weight
        totalScore += weight
    }

    // Find the label with the highest score
    let maxScore = 0
    let bestLabel = 0

    for (const label in labelScores) {
        if (labelScores[label] > maxScore) {
            maxScore = labelScores[label]
            bestLabel = parseInt(label)
        }
    }

    // Calculate confidence score (0-100%)
    const confidence = Math.round((maxScore / totalScore) * 100)

    // Return the predicted digit, matches, and confidence
    return {
        digit: bestLabel,
        confidence,
        matches: kNearestNeighbors
            .map((neighbor) => ({
                index: neighbor.index,
                digit: mnistData.train.labels[neighbor.index],
                distance: neighbor.distance,
                image: mnistData.train.images[neighbor.index],
            }))
            .sort((a, b) => a.distance - b.distance), // Sort matches by distance
    }
}

// Combined distance metric that's more robust to distortions
function combinedDistance(image1: number[], image2: number[]): number {
    // Use a weighted combination of Euclidean distance and Manhattan distance
    return 0.7 * euclideanDistance(image1, image2) + 0.3 * manhattanDistance(image1, image2)
}

export function flattenImage(image: number[][]): number[] {
    // Handle multi-dimensional arrays by recursively flattening
    return image.flat(Infinity) as number[]
}

export function euclideanDistance(image1: number[], image2: number[]): number {
    if (image1.length !== image2.length) {
        throw new Error('Vectors must have the same length')
    }
    let sum = 0
    for (let i = 0; i < image1.length; i++) {
        sum += Math.pow(image1[i] - image2[i], 2)
    }
    return Math.sqrt(sum)
}

// Manhattan distance (L1 norm) - less sensitive to outliers
export function manhattanDistance(image1: number[], image2: number[]): number {
    if (image1.length !== image2.length) {
        throw new Error('Vectors must have the same length')
    }
    let sum = 0
    for (let i = 0; i < image1.length; i++) {
        sum += Math.abs(image1[i] - image2[i])
    }
    return sum
}
