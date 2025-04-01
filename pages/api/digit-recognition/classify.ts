import type { NextApiRequest, NextApiResponse } from 'next'
import { knnClassifier, PredictionResult } from '@/modules/knn'
import { MnistData, loadMNIST } from '@/modules/mnist'

const mnistData: Promise<MnistData> = loadMNIST('data/digit-recognition')

export default async function handler(req: NextApiRequest, res: NextApiResponse<PredictionResult>) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
        return
    }

    const preprocessedImage: number[][] = req.body
    const mnist = await mnistData

    const k = 10
    const predictionResult = knnClassifier(mnist, preprocessedImage, k)

    res.status(200).json(predictionResult)
}
