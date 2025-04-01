import React from 'react'
import Canvas from '../modules/Canvas'
import { useTheme } from 'next-themes'
import { PredictionResult } from '../modules/knn'
import Spinner from '../modules/Spinner'
import Matches from '../modules/Matches'
import Layout from '../modules/Layout'

const SIZE = 28

const Home: React.FC = () => {
    const { theme } = useTheme()

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [prediction, setPrediction] = React.useState<PredictionResult | null>(null)

    async function handleSubmit(pixels: number[][]) {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/digit-recognition/classify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pixels),
            })

            if (!response.ok) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Failed to classify the digit.')
            }

            setPrediction(await response.json())
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout title="Digit Recognition" description="Draw a digit and let the AI recognize it!">
            <header>
                <h1>Digit Recognition</h1>
                <p>by David Veszelovszki and GPT-4</p>
            </header>
            <main>
                <p>Draw a digit!</p>
                <Canvas size={SIZE} darkMode={theme === 'dark'} onSubmit={handleSubmit} />
                {loading && <Spinner />}
                {error && <p className="error">{error}</p>}
                <h2>Prediction: {prediction?.digit}</h2>
                <p>
                    Full disclosure: this is not a neural network, it&apos;s a k-nearest neighbors
                    algorithm, and there is some bug why it almost always guesses &quot;1&quot;. 😄
                </p>
                <p>Matches:</p>
                {prediction && <Matches size={SIZE} matches={prediction.matches} />}
            </main>
        </Layout>
    )
}

export default Home
