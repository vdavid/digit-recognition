import { describe, it, expect } from 'vitest'
import { knnClassifier, normalizeImage, flattenImage, euclideanDistance } from '../modules/knn'
import type { MnistData } from '../modules/mnist'

describe('Digit Recognition Integration Test', () => {
    // Create a more distinct dataset for each digit
    const mockMnistData: MnistData = {
        train: {
            images: [
                // A digit "1" pattern (simplified 28x28)
                Array.from({ length: 28 }, (_, y) => 
                    Array.from({ length: 28 }, (_, x) => 
                        x === 14 ? 255 : 0 // Simple vertical line in the middle
                    )
                ),
                
                // A digit "2" pattern (simplified 28x28)
                Array.from({ length: 28 }, (_, y) => {
                    return Array.from({ length: 28 }, (_, x) => {
                        // Top horizontal line
                        if (y === 5 && x >= 7 && x <= 21) return 255;
                        // Top-right vertical line
                        if (x === 21 && y >= 5 && y <= 12) return 255;
                        // Middle horizontal line
                        if (y === 12 && x >= 7 && x <= 21) return 255;
                        // Bottom-left vertical line
                        if (x === 7 && y >= 12 && y <= 20) return 255;
                        // Bottom horizontal line
                        if (y === 20 && x >= 7 && x <= 21) return 255;
                        
                        return 0;
                    });
                }),
                
                // A digit "3" pattern (simplified 28x28)
                Array.from({ length: 28 }, (_, y) => {
                    return Array.from({ length: 28 }, (_, x) => {
                        // Top horizontal line
                        if (y === 5 && x >= 7 && x <= 21) return 255;
                        // Middle horizontal line
                        if (y === 14 && x >= 7 && x <= 21) return 255;
                        // Bottom horizontal line
                        if (y === 22 && x >= 7 && x <= 21) return 255;
                        // Right vertical line
                        if (x === 21 && y >= 5 && y <= 22) return 255;
                        
                        return 0;
                    });
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
                if (y === 5 && x >= 7 && x <= 21) return 230;
                // Top-right vertical line
                if (x === 21 && y >= 5 && y <= 12) return 230;
                // Middle horizontal line
                if (y === 12 && x >= 7 && x <= 21) return 230;
                // Bottom-left vertical line
                if (x === 7 && y >= 12 && y <= 20) return 230;
                // Bottom horizontal line
                if (y === 20 && x >= 7 && x <= 21) return 230;
                
                return 0;
            });
        });
        
        // Calculate distances directly for debugging
        const flatTest = normalizeImage(flattenImage(testImage));
        
        const distances = mockMnistData.train.images.map((trainImg, index) => {
            const flatTrain = normalizeImage(flattenImage(trainImg));
            const distance = euclideanDistance(flatTest, flatTrain);
            return {
                digit: mockMnistData.train.labels[index],
                distance
            };
        });
        
        // Log distances for debugging
        console.log('Distances:', distances);
        
        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance);
        console.log('Sorted distances:', distances);
        
        // Test with k=1
        const result = knnClassifier(mockMnistData, testImage, 1);
        console.log('Result:', result);
        expect(result.digit).toBe(2);
    });
}); 