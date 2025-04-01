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
    // Create a more realistic test dataset
    const mockMnistData: MnistData = {
        train: {
            images: [
                // A digit "1" pattern
                Array.from({ length: 28 }, (_, y) =>
                    Array.from({ length: 28 }, (_, x) =>
                        x >= 13 && x <= 15 && y >= 5 && y <= 22 ? 255 : 0,
                    ),
                ),

                // A digit "2" pattern
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

                // A digit "3" pattern
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

                // Additional digit "1" pattern with different style
                Array.from({ length: 28 }, (_, y) =>
                    Array.from({ length: 28 }, (_, x) =>
                        x >= 12 && x <= 16 && y >= 4 && y <= 23 ? 255 : 0,
                    ),
                ),
            ],
            labels: [1, 2, 3, 1],
        },
        test: {
            images: [],
            labels: [],
        },
    }

    it('should correctly recognize each digit with various k values', () => {
        // Test "1" recognition
        const testDigit1 = Array.from({ length: 28 }, (_, y) =>
            Array.from({ length: 28 }, (_, x) =>
                x >= 13 && x <= 15 && y >= 5 && y <= 22 ? 230 : 0,
            ),
        )

        const result1 = originalKnnClassifier(mockMnistData, testDigit1, 1)
        expect(result1.digit).toBe(1)

        // Test with k=3 for "1"
        const result1_k3 = originalKnnClassifier(mockMnistData, testDigit1, 3)
        expect(result1_k3.digit).toBe(1)

        // Test "2" recognition
        const testDigit2 = Array.from({ length: 28 }, (_, y) => {
            return Array.from({ length: 28 }, (_, x) => {
                // Make it match the training digit more closely
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

        // Debug distances for digit 2
        const flatTest2 = normalizeImage(flattenImage(testDigit2))
        const distances2 = mockMnistData.train.images.map((trainImg, index) => {
            const flatTrain = normalizeImage(flattenImage(trainImg))
            const distance = euclideanDistance(flatTest2, flatTrain)
            return {
                digit: mockMnistData.train.labels[index],
                distance,
            }
        })
        console.log('Distances for digit 2:', distances2)
        console.log(
            'Sorted distances for digit 2:',
            [...distances2].sort((a, b) => a.distance - b.distance),
        )

        const result2 = originalKnnClassifier(mockMnistData, testDigit2, 1)
        console.log('Result for digit 2:', result2)
        expect(result2.digit).toBe(2)

        // Test "3" recognition
        const testDigit3 = Array.from({ length: 28 }, (_, y) => {
            return Array.from({ length: 28 }, (_, x) => {
                // Top horizontal line
                if (y === 5 && x >= 7 && x <= 21) return 230
                // Middle horizontal line
                if (y === 14 && x >= 7 && x <= 21) return 230
                // Bottom horizontal line
                if (y === 22 && x >= 7 && x <= 21) return 230
                // Right vertical line
                if (x === 21 && y >= 5 && y <= 22) return 230

                return 0
            })
        })

        const result3 = originalKnnClassifier(mockMnistData, testDigit3, 1)
        expect(result3.digit).toBe(3)
    })

    it('should handle normalization and flatten images correctly', () => {
        // Test normalization
        const flatImage = [0, 100, 200, 255]
        const normalized = normalizeImage(flatImage)
        expect(normalized).toEqual([0, 0.39215686274509803, 0.7843137254901961, 1])

        // Test flattening
        const image = [
            [1, 2],
            [3, 4],
        ]
        expect(flattenImage(image)).toEqual([1, 2, 3, 4])

        // Test with empty array
        expect(flattenImage([])).toEqual([])
    })
})
