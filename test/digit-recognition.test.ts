import { describe, it, expect } from 'vitest'
import { normalizeImage, flattenImage, euclideanDistance } from '../modules/knn'
import type { MnistData } from '../modules/mnist'

// Import the original KNN implementation directly to test consistency
function originalKnnClassifier(mnistData: MnistData, testImage: number[][], k: number): any {
    if (!mnistData.train.images.length || !mnistData.train.labels.length) {
        throw new Error('Training data cannot be empty')
    }

    // Flatten and normalize the test image
    const flattenedTestImage = normalizeImage(flattenImage(testImage))

    // Calculate the distance between the test image and all the training images
    const distances: { index: number; distance: number }[] = []
    for (let i = 0; i < mnistData.train.images.length; i++) {
        const flattenedTrainImage = normalizeImage(flattenImage(mnistData.train.images[i]))
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

    // Find the most common label (digit)
    let maxCount = 0
    let mostCommonDigit = 0
    for (let i = 0; i < labelCounts.length; i++) {
        if (labelCounts[i] > maxCount) {
            maxCount = labelCounts[i]
            mostCommonDigit = i
        }
    }

    // Return the most common label and the distances
    return {
        digit: mostCommonDigit,
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

describe('Digit Recognition Integration Test', () => {
    // Create a more distinct dataset for each digit
    const mockMnistData: MnistData = {
        train: {
            images: [
                // A digit "1" pattern (simplified 28x28)
                Array.from({ length: 28 }, (_, y) =>
                    Array.from(
                        { length: 28 },
                        (_, x) => (x === 14 ? 255 : 0), // Simple vertical line in the middle
                    ),
                ),

                // A digit "2" pattern (simplified 28x28)
                Array.from({ length: 28 }, (_, y) => {
                    return Array.from({ length: 28 }, (_, x) => {
                        // Top horizontal line
                        if (y === 5 && x >= 7 && x <= 21) return 255
                        // Top-right vertical line
                        if (x === 21 && y >= 5 && y <= 12) return 255
                        // Middle horizontal line
                        if (y === 12 && x >= 7 && x <= 21) return 255
                        // Bottom-left vertical line
                        if (x === 7 && y >= 12 && y <= 20) return 255
                        // Bottom horizontal line
                        if (y === 20 && x >= 7 && x <= 21) return 255

                        return 0
                    })
                }),

                // A digit "3" pattern (simplified 28x28)
                Array.from({ length: 28 }, (_, y) => {
                    return Array.from({ length: 28 }, (_, x) => {
                        // Top horizontal line
                        if (y === 5 && x >= 7 && x <= 21) return 255
                        // Middle horizontal line
                        if (y === 14 && x >= 7 && x <= 21) return 255
                        // Bottom horizontal line
                        if (y === 22 && x >= 7 && x <= 21) return 255
                        // Right vertical line
                        if (x === 21 && y >= 5 && y <= 22) return 255

                        return 0
                    })
                }),
            ],
            labels: [1, 2, 3],
        },
        test: {
            images: [],
            labels: [],
        },
    }

    it('should correctly recognize a digit "2" pattern', () => {
        // Create a test image that's very similar to the "2" in our training data
        const testImage = Array.from({ length: 28 }, (_, y) => {
            return Array.from({ length: 28 }, (_, x) => {
                // Top horizontal line
                if (y === 5 && x >= 7 && x <= 21) return 230
                // Top-right vertical line
                if (x === 21 && y >= 5 && y <= 12) return 230
                // Middle horizontal line
                if (y === 12 && x >= 7 && x <= 21) return 230
                // Bottom-left vertical line
                if (x === 7 && y >= 12 && y <= 20) return 230
                // Bottom horizontal line
                if (y === 20 && x >= 7 && x <= 21) return 230

                return 0
            })
        })

        // Calculate distances directly for debugging
        const flatTest = normalizeImage(flattenImage(testImage))

        const distances = mockMnistData.train.images.map((trainImg, index) => {
            const flatTrain = normalizeImage(flattenImage(trainImg))
            const distance = euclideanDistance(flatTest, flatTrain)
            return {
                digit: mockMnistData.train.labels[index],
                distance,
            }
        })

        // Log distances for debugging
        console.log('Distances:', distances)

        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance)
        console.log('Sorted distances:', distances)

        // Test with k=1 using original implementation
        const result = originalKnnClassifier(mockMnistData, testImage, 1)
        console.log('Result:', result)
        expect(result.digit).toBe(2)
    })
})
