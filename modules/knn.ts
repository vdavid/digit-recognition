import { MnistData } from './mnist'

export function knnClassifier(
    mnistData: MnistData,
    testImage: number[][],
    k: number,
): number {
    console.log(testImage)
    // Flatten the test image
    const flattenedTestImage = flattenImage(testImage)

    // Calculate the distance between the test image and all the training images
    const distances: { index: number; distance: number }[] = []
    for (let i = 0; i < mnistData.train.images.length; i++) {
        const flattenedTrainImage = flattenImage(mnistData.train.images[i])
        const distance = euclideanDistance(flattenedTestImage, flattenedTrainImage)
        distances.push({ index: i, distance })
    }

    // Sort the distances
    distances.sort((a, b) => a.distance - b.distance)

    // Get the k nearest neighbors
    const kNearestNeighbors = distances.slice(0, k)
    const labels = kNearestNeighbors.map(neighbor => mnistData.train.labels[neighbor.index])
    console.log(kNearestNeighbors, labels)

    // Get the most common label
    const labelCounts: number[] = Array(10).fill(0)
    for (const neighbor of kNearestNeighbors) {
        const label = mnistData.train.labels[neighbor.index]
        labelCounts[label]++
    }

    // Return the most common label
    return labelCounts.indexOf(Math.max(...labelCounts))
}

function flattenImage(image: number[][]): number[] {
    const flattenedImage: number[] = []
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            flattenedImage.push(image[i][j])
        }
    }

    return flattenedImage
}

function euclideanDistance(image1: number[], image2: number[]): number {
    let sum = 0
    for (let i = 0; i < image1.length; i++) {
        sum += Math.pow(image1[i] - image2[i], 2)
    }
    return Math.sqrt(sum)
}
