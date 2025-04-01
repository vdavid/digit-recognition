import { describe, it, expect } from 'vitest'
import { euclideanDistance, flattenImage } from '../modules/knn'

describe('Image Processing Utils', () => {
    describe('flattenImage', () => {
        it('should flatten a 2x2 image correctly', () => {
            const image = [
                [1, 2],
                [3, 4],
            ]
            expect(flattenImage(image)).toEqual([1, 2, 3, 4])
        })

        it('should handle empty image', () => {
            expect(flattenImage([])).toEqual([])
        })

        it('should handle single pixel image', () => {
            expect(flattenImage([[1]])).toEqual([1])
        })
    })

    describe('euclideanDistance', () => {
        it('should calculate distance between identical vectors', () => {
            const vec1 = [1, 2, 3]
            const vec2 = [1, 2, 3]
            expect(euclideanDistance(vec1, vec2)).toBe(0)
        })

        it('should calculate distance between different vectors', () => {
            const vec1 = [0, 0]
            const vec2 = [3, 4]
            expect(euclideanDistance(vec1, vec2)).toBe(5) // 3-4-5 triangle
        })

        it('should handle empty vectors', () => {
            expect(euclideanDistance([], [])).toBe(0)
        })

        it('should handle vectors of different lengths', () => {
            const vec1 = [1, 2]
            const vec2 = [1, 2, 3]
            expect(() => euclideanDistance(vec1, vec2)).toThrow()
        })
    })
})
