import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../../../utils/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    try {
        const { digit } = req.query
        if (!digit || !/^\d$/.test(digit.toString())) {
            return res
                .status(400)
                .json({ error: 'Invalid digit parameter. Must be a single digit 0-9.' })
        }

        const digitStr = digit.toString()
        const userDigitsDir = path.join(process.cwd(), 'data', 'user-digits', digitStr)

        if (!fs.existsSync(userDigitsDir)) {
            return res.status(200).json({ digits: [] })
        }

        const files = fs.readdirSync(userDigitsDir)

        const digits = files
            .filter((file) => file.endsWith('.json'))
            .map((file) => ({
                digit: parseInt(digitStr),
                path: `${digitStr}/${file}`,
            }))

        res.status(200).json({ digits })
    } catch (error) {
        logger.error('Error fetching user digits:', error)
        res.status(500).json({ error: 'Failed to fetch user digits' })
    }
}
