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

    const handleMouseDown = (x: number, y: number) => {
        drawingRef.current = true;
        setPixels((prevPixels) => {
            const newPixels = [...prevPixels];
            newPixels[y][x] = 255;
            return newPixels;
        });
    };

    const handleMouseEnter = (x: number, y: number) => {
        if (!drawingRef.current) return;
        setPixels((prevPixels) => {
            const newPixels = [...prevPixels];
            newPixels[y][x] = 255;
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
                            onMouseDown={() => handleMouseDown(x, y)}
                            onMouseEnter={() => handleMouseEnter(x, y)}
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
