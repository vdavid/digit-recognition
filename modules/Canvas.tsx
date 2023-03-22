// components/Canvas.tsx

import React, { useRef, useState } from 'react';
import styles from './Canvas.module.scss';

interface Props {
    onSubmit: (pixels: number[][]) => void;
}

const SIZE = 28;

const Canvas: React.FC<Props> = ({ onSubmit }) => {
    const [pixels, setPixels] = useState<number[][]>(
        Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
    );
    const drawingRef = useRef(false);

    const calculateIntensity = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;

        const distance = Math.sqrt(
            Math.pow(cursorX - rect.width / 2, 2) + Math.pow(cursorY - rect.height / 2, 2)
        );

        const maxDistance = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2)) / 2;

        const realIntensity = 255 - Math.round((distance / maxDistance) * 255)

        // Make it a little brighter
        return Math.min(255, realIntensity * 1.3 + 80);
    };

    const handleMouseDown = (event: React.MouseEvent, x: number, y: number) => {
        drawingRef.current = true;
        const intensity = calculateIntensity(event);

        setPixels((prevPixels) => {
            const newPixels = [...prevPixels];
            newPixels[y][x] = intensity;
            return newPixels;
        });
    };

    const handleMouseEnter = (event: React.MouseEvent, x: number, y: number) => {
        if (!drawingRef.current) return;
        const intensity = calculateIntensity(event);

        setPixels((prevPixels) => {
            const newPixels = [...prevPixels];
            newPixels[y][x] = intensity;
            return newPixels;
        });
    };

    const handleMouseUp = () => {
        drawingRef.current = false;
    };

    const clearCanvas = () => {
        setPixels(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    };

    return (
        <div className={styles.container}>
            <div
                className={styles.grid}
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
            >
                {pixels.map((row, y) =>
                    row.map((color, x) => (
                        <div
                            key={`${x}-${y}`}
                            className={styles.cell}
                            style={{ backgroundColor: `rgb(${color}, ${color}, ${color})` }}
                            onMouseDown={(event) => handleMouseDown(event, x, y)}
                            onMouseEnter={(event) => handleMouseEnter(event, x, y)}
                        />
                    ))
                )}
            </div>
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
