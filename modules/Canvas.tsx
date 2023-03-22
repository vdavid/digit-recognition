import React, { useEffect, useRef, useState } from 'react'
import styles from './Canvas.module.scss'

interface Props {
    onSubmit: (pixels: number[][]) => void;
    darkMode: boolean;
}

const SIZE = 28;

const Canvas: React.FC<Props> = ({ onSubmit, darkMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawingRef = useRef(false)
    const [pixels, setPixels] = useState<number[][]>(
        Array.from({ length: SIZE }, () => Array(SIZE).fill(0)),
    )

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const cellWidth = canvas.width / SIZE
        const cellHeight = canvas.height / SIZE

        pixels.forEach((row, y) => {
            row.forEach((color, x) => {
                ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)

                // Add grid lines around the pixels
                ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)'
                ctx.lineWidth = 1
                ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
            })
        })
    }, [pixels])

    const calculateIntensity = (rect: DOMRect, event: React.MouseEvent, x: number, y: number) => {
        const cursorX = event.clientX - rect.left
        const cursorY = event.clientY - rect.top

        const cellWidth = rect.width / SIZE
        const cellHeight = rect.height / SIZE

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
        const x = Math.floor((event.clientX - rect.left) / (rect.width / SIZE))
        const y = Math.floor((event.clientY - rect.top) / (rect.height / SIZE))
        const intensity = calculateIntensity(rect, event, x, y)

        setPixels((prevPixels) => {
            const newPixels = [...prevPixels]
            newPixels[y][x] = Math.max(newPixels[y][x], intensity)
            return newPixels
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
        drawingRef.current = false;
    };

    const clearCanvas = () => {
        setPixels(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    };

    return (
        <div className={styles.container}>
            <canvas
                ref={canvasRef}
                width={SIZE * 20}
                height={SIZE * 20}
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
                Submit
            </button>
        </div>
    );
};

export default Canvas;
