import type { NextApiRequest, NextApiResponse } from 'next'
import { knnClassifier, PredictionResult, preprocessImage } from '../../../modules/knn'
import { MnistData, loadMNIST } from '../../../modules/mnist'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../../../utils/logger'

// Keep a single instance of the MNIST data to avoid reloading
let mnistDataPromise: Promise<MnistData> | null = null

// Check if we should use combined dataset (MNIST + user data)
let useCombinedDataset = false
const combinedDatasetPath = path.join(process.cwd(), 'data/digit-recognition/combined-dataset.json')

function getMnistData(): Promise<MnistData> {
    if (!mnistDataPromise) {
        // Check if we have a combined dataset
        if (fs.existsSync(combinedDatasetPath)) {
            try {
                const fileStats = fs.statSync(combinedDatasetPath)
                // Only use if file is not empty and was created in the last hour
                if (fileStats.size > 0) {
                    logger.info('Using combined dataset (MNIST + user contributions)')
                    useCombinedDataset = true
                    mnistDataPromise = Promise.resolve(
                        JSON.parse(fs.readFileSync(combinedDatasetPath, 'utf8')),
                    )
                } else {
                    // Fallback to regular MNIST data
                    mnistDataPromise = loadMNIST('data/digit-recognition')
                }
            } catch (err) {
                logger.error('Error loading combined dataset:', err)
                mnistDataPromise = loadMNIST('data/digit-recognition')
            }
        } else {
            mnistDataPromise = loadMNIST('data/digit-recognition')
        }
    }
    return mnistDataPromise
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PredictionResult>) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    try {
        const drawnImage: number[][] = req.body

        // Apply enhanced preprocessing to the drawn image
        const enhancedImage = enhanceImage(drawnImage)

        const mnist = await getMnistData()

        // Use k=7 for more robust classification with weighted voting
        const k = 7
        const predictionResult = knnClassifier(mnist, enhancedImage, k)

        // Debug: log the prediction
        logger.debug(
            `Predicted: ${predictionResult.digit} (using ${useCombinedDataset ? 'combined' : 'standard'} dataset)`,
        )

        res.status(200).json(predictionResult)
    } catch (error) {
        logger.error('Error during digit classification:', error)
        res.status(500).json({
            digit: -1,
            matches: [],
            confidence: 0,
        })
    }
}

// Enhanced preprocessing for user-drawn digits
function enhanceImage(image: number[][]): number[][] {
    // First apply preprocessing (centering)
    const centered = preprocessImage(image)

    // Create a copy of the image
    const result = centered.map((row) => [...row])

    // Find max pixel value
    let maxPixel = 0
    let nonZeroPixels = 0
    let totalPixels = image.length * image[0].length

    for (let i = 0; i < centered.length; i++) {
        for (let j = 0; j < centered[i].length; j++) {
            maxPixel = Math.max(maxPixel, centered[i][j])
            if (centered[i][j] > 0) nonZeroPixels++
        }
    }

    // More adaptive threshold based on image density
    const density = nonZeroPixels / totalPixels

    // Use a lower threshold for sparse images (thin lines)
    // and higher threshold for dense images (thick lines)
    const thresholdPercentage = density < 0.1 ? 0.15 : 0.35
    const threshold = maxPixel * thresholdPercentage

    // Apply threshold with a slight Gaussian-like blur for smoother edges
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
            // Apply threshold with some smoothing
            if (result[i][j] > threshold) {
                // Full intensity for pixels well above threshold
                result[i][j] = 255

                // Add some "spread" to neighboring pixels if they're close to the threshold
                // This helps prevent thin lines from disappearing
                spreadIntensity(result, i, j, threshold)
            } else {
                result[i][j] = 0
            }
        }
    }

    // Apply a small amount of noise reduction to remove isolated pixels
    return removeNoise(result)
}

// Helper to spread intensity to neighboring pixels
function spreadIntensity(image: number[][], i: number, j: number, threshold: number): void {
    // Check 4-connected neighbors
    const neighbors = [
        [i - 1, j],
        [i + 1, j],
        [i, j - 1],
        [i, j + 1],
    ]

    for (const [ni, nj] of neighbors) {
        // Skip out of bounds
        if (ni < 0 || ni >= image.length || nj < 0 || nj >= image[0].length) continue

        // Add some intensity to neighbors, even if they're below threshold
        if (image[ni][nj] < threshold && image[ni][nj] > 0) {
            image[ni][nj] = Math.min(255, image[ni][nj] * 1.5)
        }
    }
}

// Remove isolated pixels (noise reduction)
function removeNoise(image: number[][]): number[][] {
    const result = image.map((row) => [...row])

    for (let i = 1; i < image.length - 1; i++) {
        for (let j = 1; j < image[i].length - 1; j++) {
            // Count neighbors
            let nonZeroNeighbors = 0

            for (let ni = i - 1; ni <= i + 1; ni++) {
                for (let nj = j - 1; nj <= j + 1; nj++) {
                    if (ni === i && nj === j) continue // Skip center
                    if (image[ni][nj] > 0) nonZeroNeighbors++
                }
            }

            // Remove isolated pixels
            if (image[i][j] > 0 && nonZeroNeighbors < 2) {
                result[i][j] = 0
            }
        }
    }

    return result
}
