import React from 'react'
import Canvas from '../../modules/digit-recognition/Canvas'
import { preprocessImage } from '../../modules/digit-recognition/preprocessing'
import { useTheme } from 'next-themes'
import DefaultLayout from '../../modules/site/DefaultLayout'
import { PredictionResult } from '../../modules/digit-recognition/knn'
import Spinner from '../../modules/digit-recognition/Spinner'
import Matches from '../../modules/digit-recognition/Matches'

const SIZE = 28

const Home: React.FC = () => {
    const { theme } = useTheme()

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [prediction, setPrediction] = React.useState<PredictionResult | null>(null)

    async function handleSubmit(pixels: number[][]) {
        setLoading(true)
        setError(null)
        const preprocessedImage = preprocessImage(pixels)
        try {
            const response = await fetch('/api/digit-recognition/classify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preprocessedImage),
            })

            if (!response.ok) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Failed to classify the digit.')
            }

            setPrediction(await response.json())
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DefaultLayout title="Digit recognition | David Veszelovszki" description="I like carrots.">
            <header>
                <h1>Digit recognition</h1>
                <p>by David Veszelovszki and GPT-4</p>
            </header>
            <main>
                <Canvas size={SIZE} darkMode={theme === 'dark'} onSubmit={handleSubmit}/>
                {loading && <Spinner/>}
                {error && <p className="error">{error}</p>}
                <h2>Prediction: {prediction?.digit}</h2>
                <p>Matches:</p>
                {prediction && <Matches size={SIZE} matches={prediction.matches}/>}
            </main>
        </DefaultLayout>
    )
}

export default Home
