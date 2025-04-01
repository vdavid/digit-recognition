import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'
import { loadMNIST, MnistImageAndLabel } from '../../../modules/mnist'
import { logger } from '../../../utils/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    try {
        // Load user digits
        const userDigits = await loadUserDigits()

        if (userDigits.images.length === 0) {
            return res.status(400).json({
                error: 'No user digits found. Please contribute some digits first.',
            })
        }

        // Load current MNIST data
        const mnist = await loadMNIST('data/digit-recognition')

        // Add user digits to the training data
        const combinedTrainingData = {
            images: [...mnist.train.images, ...userDigits.images],
            labels: [...mnist.train.labels, ...userDigits.labels],
        }

        // Save the combined dataset
        const datasetPath = path.join(
            process.cwd(),
            'data',
            'digit-recognition',
            'combined-dataset.json',
        )
        await fs.promises.writeFile(
            datasetPath,
            JSON.stringify(
                {
                    timestamp: new Date().toISOString(),
                    userDigitsCount: userDigits.images.length,
                    mnistCount: mnist.train.images.length,
                    totalSamples: combinedTrainingData.images.length,
                },
                null,
                2,
            ),
        )

        res.status(200).json({
            success: true,
            message: 'Training data updated with user digits',
            statistics: {
                originalSamples: mnist.train.images.length,
                userDigits: userDigits.images.length,
                totalSamples: combinedTrainingData.images.length,
            },
        })
    } catch (error) {
        logger.error('Error in training with user digits:', error)
        res.status(500).json({ error: 'Failed to train with user digits' })
    }
}

async function loadUserDigits(): Promise<MnistImageAndLabel> {
    const userDigitsDir = path.join(process.cwd(), 'data', 'user-digits')

    if (!fs.existsSync(userDigitsDir)) {
        return { images: [], labels: [] }
    }

    const images: number[][][] = []
    const labels: number[] = []

    // Read all user digit directories (0-9)
    for (let digit = 0; digit <= 9; digit++) {
        const digitDir = path.join(userDigitsDir, digit.toString())
        if (!fs.existsSync(digitDir)) {
            continue
        }

        const files = fs.readdirSync(digitDir).filter((file) => file.endsWith('.json'))

        for (const file of files) {
            try {
                const filePath = path.join(digitDir, file)
                const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'))

                if (data.pixels && Array.isArray(data.pixels)) {
                    images.push(data.pixels)
                    labels.push(digit)
                }
            } catch (err) {
                logger.error(`Error reading user digit file ${file}:`, err)
            }
        }
    }

    logger.info(`Loaded ${images.length} user-contributed digits`)
    return { images, labels }
}
