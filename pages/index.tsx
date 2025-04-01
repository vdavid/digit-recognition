import React from 'react'
import Canvas from '../modules/Canvas'
import { useTheme } from 'next-themes'
import { PredictionResult } from '@/modules/knn'
import Spinner from '../modules/Spinner'
import Matches from '../modules/Matches'
import Layout from '../modules/Layout'
import Link from 'next/link'
import styles from './index.module.scss'

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
                <div className={styles.navLinks}>
                    <Link href="/analysis" className={styles.analysisLink}>
                        View Dataset Analysis
                    </Link>
                </div>
            </header>
            <main>
                <p>Draw a digit!</p>
                <Canvas size={SIZE} darkMode={theme === 'dark'} onSubmit={handleSubmit} />
                {loading && <Spinner />}
                {error && <p className={styles.error}>{error}</p>}

                {prediction && (
                    <div className={styles.predictionSection}>
                        <h2 className={styles.prediction}>
                            Prediction: <span className={styles.digit}>{prediction.digit}</span>
                            {prediction.confidence && (
                                <span className={styles.confidenceLabel}>
                                    ({prediction.confidence}% confidence)
                                </span>
                            )}
                        </h2>

                        <p className={styles.description}>
                            This app uses a k-nearest neighbors algorithm, which compares your
                            drawing to a database of sample digits and finds the closest matches.
                            Save your digits to help improve the model!
                        </p>

                        <h3>Closest matches:</h3>
                        <Matches
                            size={SIZE}
                            matches={prediction.matches}
                            confidence={prediction.confidence}
                        />
                    </div>
                )}
            </main>
        </Layout>
    )
}

export default Home
