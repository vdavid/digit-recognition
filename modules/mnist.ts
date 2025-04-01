import { Buffer } from 'buffer'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'

const readInt32 = (buffer: Buffer, offset: number) => {
    return buffer.readInt32BE(offset)
}

const readImages = async (buffer: Buffer): Promise<MnistImage[]> => {
    const magicNumber = readInt32(buffer, 0)
    const numImages = readInt32(buffer, 4)
    const numRows = readInt32(buffer, 8)
    const numCols = readInt32(buffer, 12)

    if (magicNumber !== 2051) {
        throw new Error('Invalid image file magic number')
    }

    const images = []

    for (let i = 0; i < numImages; i++) {
        const image = []
        for (let r = 0; r < numRows; r++) {
            const row = []
            for (let c = 0; c < numCols; c++) {
                const pixel = buffer.readUInt8(16 + i * numRows * numCols + r * numCols + c)
                row.push(pixel)
            }
            image.push(row)
        }
        images.push(image)
    }

    return images
}

const readLabels = async (buffer: Buffer): Promise<MnistLabel[]> => {
    const magicNumber = readInt32(buffer, 0)
    const numLabels = readInt32(buffer, 4)

    if (magicNumber !== 2049) {
        throw new Error('Invalid label file magic number')
    }

    const labels = []

    for (let i = 0; i < numLabels; i++) {
        const label = buffer.readUInt8(8 + i)
        labels.push(label)
    }

    return labels
}

export type MnistImage = number[][]
export type MnistLabel = number

export type MnistImageAndLabel = {
    images: MnistImage[]
    labels: MnistLabel[]
}
export type MnistData = {
    train: MnistImageAndLabel
    test: MnistImageAndLabel
}

async function readOrDownloadFile(dataPath: string, fileName: string): Promise<Buffer> {
    const filePath = path.join(dataPath, fileName)
    
    // Check if file exists locally
    try {
        if (fs.existsSync(filePath)) {
            return fs.promises.readFile(filePath)
        }
    } catch (error) {
        console.warn(`Error reading cached file: ${error}`)
    }
    
    // File doesn't exist, download it
    const url = new URL(`https://test-sdsddsds.s3.eu-west-2.amazonaws.com/mnist/${fileName}`)

    return new Promise<Buffer>((resolve, reject) => {
        https
            .get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download the file: ${response.statusCode}`))
                    return
                }

                const chunks: Buffer[] = []
                response
                    .on('data', (chunk) => chunks.push(chunk))
                    .on('end', async () => {
                        const buffer = Buffer.concat(chunks)
                        try {
                            // Ensure directory exists
                            try {
                                if (!fs.existsSync(dataPath)) {
                                    fs.mkdirSync(dataPath, { recursive: true })
                                }
                                // Save the file
                                await fs.promises.writeFile(filePath, buffer)
                                console.log(`Downloaded and saved ${fileName} to ${filePath}`)
                            } catch (err) {
                                console.warn(`Failed to save file locally: ${err}`)
                            }
                            resolve(buffer)
                        } catch (err) {
                            reject(err)
                        }
                    })
                    .on('error', (err) => reject(err))
            })
            .on('error', (err) => reject(err))
    })
}

export const loadMNIST = async (dataPath: string): Promise<MnistData> => {
    const trainImagesPath = `train-images-idx3-ubyte`
    const trainLabelsPath = `train-labels-idx1-ubyte`
    const testImagesPath = `t10k-images-idx3-ubyte`
    const testLabelsPath = `t10k-labels-idx1-ubyte`

    try {
        // Try to load the full training dataset
        const trainImages = await readImages(await readOrDownloadFile(dataPath, trainImagesPath))
        const trainLabels = await readLabels(await readOrDownloadFile(dataPath, trainLabelsPath))
        const testImages = await readImages(await readOrDownloadFile(dataPath, testImagesPath))
        const testLabels = await readLabels(await readOrDownloadFile(dataPath, testLabelsPath))

        return {
            train: {
                images: trainImages,
                labels: trainLabels,
            },
            test: {
                images: testImages,
                labels: testLabels,
            },
        }
    } catch (error) {
        console.warn('Failed to load full training dataset, falling back to test dataset only:', error)
        
        // Fallback to using just the test dataset (smaller)
        const testImages = await readImages(await readOrDownloadFile(dataPath, testImagesPath))
        const testLabels = await readLabels(await readOrDownloadFile(dataPath, testLabelsPath))
        
        return {
            train: {
                images: testImages,
                labels: testLabels,
            },
            test: {
                images: [],
                labels: [],
            },
        }
    }
}
