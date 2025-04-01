import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'
import { loadMNIST } from '../../../modules/mnist'
import { logger } from '../../../utils/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    try {
        // Load the MNIST data
        const mnist = await loadMNIST('data/digit-recognition')

        // Analyze distribution of training data
        const distribution = {
            total: mnist.train.labels.length,
            byDigit: {} as Record<number, number>,
            percentages: {} as Record<number, string>,
        }

        // Count occurrences of each digit
        mnist.train.labels.forEach((label) => {
            if (!distribution.byDigit[label]) {
                distribution.byDigit[label] = 0
            }
            distribution.byDigit[label]++
        })

        // Calculate percentages
        for (let digit = 0; digit < 10; digit++) {
            const count = distribution.byDigit[digit] || 0
            distribution.percentages[digit] = `${((count / distribution.total) * 100).toFixed(2)}%`
        }

        // Analyze user-saved digits if available
        let userDigits = {}
        try {
            const userDigitsDir = path.join(process.cwd(), 'data', 'user-digits')

            if (fs.existsSync(userDigitsDir)) {
                const userDigitCount = {} as Record<number, number>

                // Count files in each digit directory
                for (let digit = 0; digit <= 9; digit++) {
                    const digitDir = path.join(userDigitsDir, digit.toString())
                    if (fs.existsSync(digitDir)) {
                        const files = fs.readdirSync(digitDir)
                        userDigitCount[digit] = files.length
                    } else {
                        userDigitCount[digit] = 0
                    }
                }

                userDigits = {
                    total: Object.values(userDigitCount).reduce((sum, count) => sum + count, 0),
                    byDigit: userDigitCount,
                }
            }
        } catch (error) {
            logger.error('Error analyzing user digits:', error)
            userDigits = { error: 'Failed to analyze user digits' }
        }

        // Return analysis
        res.status(200).json({
            mnist: distribution,
            userDigits,
        })
    } catch (error) {
        logger.error('Error analyzing dataset:', error)
        res.status(500).json({ error: 'Failed to analyze dataset' })
    }
}
