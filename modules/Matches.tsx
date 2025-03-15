import React from 'react'
import styles from './Matches.module.scss'
import { Match } from './knn'
import { useTheme } from 'next-themes'

interface Props {
    size: number
    matches: Match[]
}

const Matches: React.FC<Props> = ({ size, matches }) => {
    const { theme } = useTheme()
    return (
        <div className={styles.container}>
            {matches.map((match, index) => (
                <div key={index}>
                    <div className={styles.rank}>#{index + 1}</div>
                    <div className={styles.digit}>Digit: {match.digit}</div>
                    <div className={styles.image}>
                        <canvas
                            ref={(el) => {
                                if (el) {
                                    drawImage(size, el, match.image, theme === 'dark')
                                }
                            }}
                            width={size * 5}
                            height={size * 5}
                        ></canvas>
                    </div>
                </div>
            ))}
        </div>
    )
}

const drawImage = (
    size: number,
    canvas: HTMLCanvasElement,
    imageData: number[][],
    darkMode: boolean,
) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellWidth = canvas.width / size
    const cellHeight = canvas.height / size

    imageData.forEach((row, y) => {
        row.forEach((color, x) => {
            if (!darkMode) {
                color = 255 - color
            }
            ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
        })
    })
}

export default Matches
