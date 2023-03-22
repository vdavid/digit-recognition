// utils/mnist.ts

import fs from 'fs';
import { Buffer } from 'buffer';

const readInt32 = (buffer: Buffer, offset: number) => {
    return buffer.readInt32BE(offset);
};

const readImages = (filePath: string): MnistImage[] => {
    const buffer = fs.readFileSync(filePath);
    const magicNumber = readInt32(buffer, 0);
    const numImages = readInt32(buffer, 4);
    const numRows = readInt32(buffer, 8);
    const numCols = readInt32(buffer, 12);

    if (magicNumber !== 2051) {
        throw new Error('Invalid image file magic number');
    }

    const images = [];

    for (let i = 0; i < numImages; i++) {
        const image = [];
        for (let r = 0; r < numRows; r++) {
            const row = [];
            for (let c = 0; c < numCols; c++) {
                const pixel = buffer.readUInt8(16 + (i * numRows * numCols) + (r * numCols) + c);
                row.push(pixel);
            }
            image.push(row);
        }
        images.push(image);
    }

    return images;
};

const readLabels = (filePath: string): MnistLabel[] => {
    const buffer = fs.readFileSync(filePath);
    const magicNumber = readInt32(buffer, 0);
    const numLabels = readInt32(buffer, 4);

    if (magicNumber !== 2049) {
        throw new Error('Invalid label file magic number');
    }

    const labels = [];

    for (let i = 0; i < numLabels; i++) {
        const label = buffer.readUInt8(8 + i);
        labels.push(label);
    }

    return labels;
};

export type MnistImage = number[][];
export type MnistLabel = number;

export type MnistImageAndLabel = {
    images: MnistImage[],
    labels: MnistLabel[],
}
type MnistData = {
    train: MnistImageAndLabel,
    test: MnistImageAndLabel
}

export const loadMNIST = (dataPath: string): MnistData => {
    const trainImagesPath = `${dataPath}/train-images-idx3-ubyte`;
    const trainLabelsPath = `${dataPath}/train-labels-idx1-ubyte`;
    const testImagesPath = `${dataPath}/t10k-images-idx3-ubyte`;
    const testLabelsPath = `${dataPath}/t10k-labels-idx1-ubyte`;

    const trainImages = readImages(trainImagesPath);
    const trainLabels = readLabels(trainLabelsPath);
    const testImages = readImages(testImagesPath);
    const testLabels = readLabels(testLabelsPath);

    return {
        train: {
            images: trainImages,
            labels: trainLabels,
        },
        test: {
            images: testImages,
            labels: testLabels,
        },
    };
};
