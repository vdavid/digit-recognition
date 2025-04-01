import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'
import { createCanvas } from 'canvas'
import { logger } from '../../../../utils/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    try {
        const { path: pathParts } = req.query

        if (!pathParts || !Array.isArray(pathParts) || pathParts.length < 2) {
            return res.status(400).json({ error: 'Invalid path' })
        }

        // Combine the path parts
        const filePath = path.join(process.cwd(), 'data', 'user-digits', ...pathParts)

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Image not found' })
        }

        // Read the JSON data
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        if (!data.pixels || !Array.isArray(data.pixels)) {
            return res.status(400).json({ error: 'Invalid image data' })
        }

        // Create a canvas to render the digit
        const size = data.pixels.length
        const scale = 2
        const canvas = createCanvas(size * scale, size * scale)
        const ctx = canvas.getContext('2d')

        // Draw the digit
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const intensity = data.pixels[y][x]
                const color = 255 - intensity // Invert for black on white
                ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
                ctx.fillRect(x * scale, y * scale, scale, scale)
            }
        }

        // Convert to PNG
        const buffer = canvas.toBuffer('image/png')

        // Set cache headers
        res.setHeader('Cache-Control', 'public, max-age=86400')
        res.setHeader('Content-Type', 'image/png')

        // Send the image
        res.status(200).send(buffer)
    } catch (error) {
        logger.error('Error serving digit image:', error)
        res.status(500).json({ error: 'Failed to serve image' })
    }
}
