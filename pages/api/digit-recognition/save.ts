import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../../../utils/logger'

interface SaveDigitRequest {
    pixels: number[][]
    digit: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    try {
        const { pixels, digit } = req.body as SaveDigitRequest

        // Validate input
        if (
            !pixels ||
            !Array.isArray(pixels) ||
            typeof digit !== 'number' ||
            digit < 0 ||
            digit > 9
        ) {
            return res
                .status(400)
                .json({ error: 'Invalid data format. Expected pixels array and digit (0-9).' })
        }

        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data', 'user-digits')
        const digitDir = path.join(dataDir, digit.toString())

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
        }

        if (!fs.existsSync(digitDir)) {
            fs.mkdirSync(digitDir, { recursive: true })
        }

        // Generate a unique filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `digit_${digit}_${timestamp}.json`
        const filePath = path.join(digitDir, filename)

        // Save the digit data
        await fs.promises.writeFile(
            filePath,
            JSON.stringify(
                {
                    pixels,
                    digit,
                    timestamp: new Date().toISOString(),
                },
                null,
                2,
            ),
        )

        // Return success
        res.status(200).json({ success: true, message: 'Digit saved successfully' })
    } catch (error) {
        logger.error('Error saving digit:', error)
        res.status(500).json({ error: 'Failed to save the digit' })
    }
}
