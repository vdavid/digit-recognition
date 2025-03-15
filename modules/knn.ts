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
}

export function knnClassifier(
    mnistData: MnistData,
    testImage: number[][],
    k: number,
): PredictionResult {
    // Flatten the test image
    const flattenedTestImage = flattenImage(testImage)

    // Calculate the distance between the test image and all the training images
    const distances: KnnDistance[] = []
    for (let i = 0; i < mnistData.train.images.length; i++) {
        const flattenedTrainImage = flattenImage(mnistData.train.images[i])
        const distance = euclideanDistance(flattenedTestImage, flattenedTrainImage)
        distances.push({ index: i, distance })
    }

    // Sort the distances
    distances.sort((a, b) => a.distance - b.distance)

    // Get the k nearest neighbors
    const kNearestNeighbors = distances.slice(0, k)

    // Get the most common label
    const labelCounts: number[] = Array(10).fill(0)
    for (const neighbor of kNearestNeighbors) {
        const label = mnistData.train.labels[neighbor.index]
        labelCounts[label]++
    }

    // Return the most common label and the distances
    return {
        digit: labelCounts.indexOf(Math.max(...labelCounts)),
        matches: kNearestNeighbors.map((neighbor) => ({
            index: neighbor.index,
            digit: mnistData.train.labels[neighbor.index],
            distance: neighbor.distance,
            image: mnistData.train.images[neighbor.index],
        })),
    }
}

function flattenImage(image: number[][]): number[] {
    return image.map((row) => row.flat()).flat()
}

function euclideanDistance(image1: number[], image2: number[]): number {
    let sum = 0
    for (let i = 0; i < image1.length; i++) {
        sum += Math.pow(image1[i] - image2[i], 2)
    }
    return Math.sqrt(sum)
}
