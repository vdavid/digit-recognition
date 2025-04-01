import { describe, it, expect } from 'vitest'
import { knnClassifier } from '@/modules/knn'
import type { MnistData } from '@/modules/mnist'

describe('KNN Classifier', () => {
    const mockMnistData: MnistData = {
        train: {
            images: [
                // A simple 2x2 "1" image
                [
                    [0, 1],
                    [0, 1],
                ],
                // A simple 2x2 "2" image (closer to "1")
                [
                    [0, 1],
                    [1, 1],
                ],
                // A simple 2x2 "3" image (further from "1")
                [
                    [1, 1],
                    [1, 1],
                ],
            ],
            labels: [1, 2, 3],
        },
        test: {
            images: [],
            labels: [],
        },
    }

    it('should correctly identify a perfect match', () => {
        const testImage = [
            [0, 1],
            [0, 1],
        ] // A perfect match for the "1" image
        const result = knnClassifier(mockMnistData, testImage, 1)
        expect(result.digit).toBe(1)
        expect(result.matches).toHaveLength(1)
        expect(result.matches[0].digit).toBe(1)
        expect(result.matches[0].distance).toBe(0) // Perfect match should have 0 distance
    })

    it('should handle k=2 and return the most common digit', () => {
        const testImage = [
            [0, 1],
            [0, 1],
        ] // Closest to "1"
        const result = knnClassifier(mockMnistData, testImage, 2)
        expect(result.digit).toBe(1)
        expect(result.matches).toHaveLength(2)
        expect(result.matches[0].digit).toBe(1)
        expect(result.matches[1].digit).toBe(2)
    })

    it('should handle k=3 and return the most common digit', () => {
        const testImage = [
            [0, 1],
            [0, 1],
        ] // Closest to "1"
        const result = knnClassifier(mockMnistData, testImage, 3)
        expect(result.digit).toBe(1)
        expect(result.matches).toHaveLength(3)
        expect(result.matches.map((m) => m.digit)).toEqual([1, 2, 3])
    })

    it('should handle empty training data', () => {
        const emptyMnistData: MnistData = {
            train: {
                images: [],
                labels: [],
            },
            test: {
                images: [],
                labels: [],
            },
        }
        const testImage = [
            [0, 1],
            [0, 1],
        ]
        expect(() => knnClassifier(emptyMnistData, testImage, 1)).toThrow()
    })

    it('should handle k larger than training data size', () => {
        const testImage = [
            [0, 1],
            [0, 1],
        ]
        const result = knnClassifier(mockMnistData, testImage, 5)
        expect(result.matches).toHaveLength(3) // Should only return all available matches
    })
})
