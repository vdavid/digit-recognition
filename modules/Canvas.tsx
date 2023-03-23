import React, { useEffect, useRef, useState } from 'react'
import styles from './Canvas.module.scss'

interface Props {
    size: number;
    darkMode: boolean;
    onSubmit: (pixels: number[][]) => void;
}

const Canvas: React.FC<Props> = ({ size, darkMode, onSubmit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawingRef = useRef(false)
    const [pixels, setPixels] = useState<number[][]>(
        Array.from({ length: size }, () => Array(size).fill(0)),
    )

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const cellWidth = canvas.width / size
        const cellHeight = canvas.height / size

        pixels.forEach((row, y) => {
            row.forEach((color, x) => {
                if (!darkMode) {
                    color = 255 - color
                }
                ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)

                // Add grid lines around the pixels
                ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)'
                ctx.lineWidth = 1
                ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
            })
        })
    }, [darkMode, pixels, size])

    const calculateIntensity = (rect: DOMRect, event: React.MouseEvent, x: number, y: number) => {
        const cursorX = event.clientX - rect.left
        const cursorY = event.clientY - rect.top

        const cellWidth = rect.width / size
        const cellHeight = rect.height / size

        const cellCenterX = x * cellWidth + cellWidth / 2
        const cellCenterY = y * cellHeight + cellHeight / 2

        const distance = Math.sqrt(
            Math.pow(cursorX - cellCenterX, 2) + Math.pow(cursorY - cellCenterY, 2),
        )

        const maxDistance = Math.sqrt(Math.pow(cellWidth, 2) + Math.pow(cellHeight, 2)) / 2

        return 255 - Math.round((distance / maxDistance) * 255)
    }

    function updatePixel(canvas: HTMLCanvasElement, event: React.MouseEvent) {
        const rect = canvas.getBoundingClientRect()
        const x = Math.floor((event.clientX - rect.left) / (rect.width / size))
        const y = Math.floor((event.clientY - rect.top) / (rect.height / size))
        const intensity = calculateIntensity(rect, event, x, y)

        setPixels((prevPixels) => {
            if (x >= 0 && x < size && y >= 0 && y < size) {
                const newPixels = [...prevPixels]
                newPixels[y][x] = Math.max(newPixels[y][x], intensity)
                return newPixels
            } else {
                return prevPixels
            }
        })
    }

    const handleMouseDown = (event: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        drawingRef.current = true
        updatePixel(canvas, event)
    }

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!drawingRef.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        updatePixel(canvas, event)
    }

    const handleMouseUp = () => {
        drawingRef.current = false
    }

    const clearCanvas = () => {
        setPixels(Array.from({ length: size }, () => Array(size).fill(0)))
    }

    return (
        <div className={styles.container}>
            <canvas
                ref={canvasRef}
                width={size * 20}
                height={size * 20}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={styles.canvas}
            ></canvas>
            <button className={styles.button} onClick={clearCanvas}>
                Clear
            </button>
            <button className={styles.button} onClick={() => onSubmit(pixels)}>
                Predict what it is
            </button>
        </div>
    )
}

export default Canvas
