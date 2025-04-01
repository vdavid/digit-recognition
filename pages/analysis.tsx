import React, { useEffect, useState } from 'react'
import Layout from '../modules/Layout'
import styles from './analysis.module.scss'
import { logger } from '../utils/logger'

interface DigitDistribution {
    total: number
    byDigit: Record<number, number>
    percentages?: Record<number, string>
}

interface DatasetAnalysis {
    mnist: DigitDistribution
    userDigits: {
        total: number
        byDigit: Record<number, number>
    }
}

const Analysis: React.FC = () => {
    const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userDigits, setUserDigits] = useState<{ digit: number; path: string }[]>([])
    const [selectedDigit, setSelectedDigit] = useState<number | null>(null)
    const [trainingStatus, setTrainingStatus] = useState<{ isTraining: boolean; message?: string }>(
        {
            isTraining: false,
        },
    )

    // Function to fetch dataset analysis
    async function fetchAnalysis() {
        try {
            const response = await fetch('/api/digit-recognition/analyze')
            if (!response.ok) {
                throw new Error('Failed to fetch dataset analysis')
            }
            const data = await response.json()
            setAnalysis(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Function to handle training with user digits
    async function handleTrain() {
        setTrainingStatus({ isTraining: true })
        try {
            const response = await fetch('/api/digit-recognition/train', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to train the model')
            }

            const result = await response.json()
            setTrainingStatus({
                isTraining: false,
                message: `Success! Added ${result.statistics.userDigits} user digits to training data.`,
            })

            // Refresh analysis after training
            fetchAnalysis()
        } catch (err) {
            setTrainingStatus({
                isTraining: false,
                message: err instanceof Error ? err.message : 'Failed to train the model',
            })
        }
    }

    // Function to fetch user digits for a specific digit
    async function fetchUserDigits(digit: number) {
        try {
            const response = await fetch(`/api/digit-recognition/user-digits?digit=${digit}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch user digits for ${digit}`)
            }
            const data = await response.json()
            setUserDigits(data.digits || [])
        } catch (err) {
            logger.error('Error fetching user digits:', err)
            setUserDigits([])
        }
    }

    // Load analysis on component mount
    useEffect(() => {
        fetchAnalysis()
    }, [])

    // Fetch user digits when selectedDigit changes
    useEffect(() => {
        if (selectedDigit !== null) {
            fetchUserDigits(selectedDigit)
        }
    }, [selectedDigit])

    // Render distribution table
    function renderDistributionTable(distribution: DigitDistribution, title: string) {
        return (
            <div className={styles.tableContainer}>
                <h3>
                    {title} ({distribution.total} total samples)
                </h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Digit</th>
                            <th>Count</th>
                            {distribution.percentages && <th>Percentage</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 10 }, (_, i) => i).map((digit) => (
                            <tr key={digit}>
                                <td>{digit}</td>
                                <td>{distribution.byDigit[digit] || 0}</td>
                                {distribution.percentages && (
                                    <td>{distribution.percentages[digit] || '0.00%'}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <Layout
            title="Dataset Analysis"
            description="Analysis of the MNIST dataset and user-contributed digits"
        >
            <div className={styles.container}>
                <h1>Dataset Analysis</h1>

                {loading && <p>Loading analysis...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {analysis && (
                    <div className={styles.analysisContainer}>
                        {renderDistributionTable(analysis.mnist, 'MNIST Dataset Distribution')}

                        {analysis.userDigits && analysis.userDigits.total > 0 && (
                            <div>
                                {renderDistributionTable(
                                    analysis.userDigits as DigitDistribution,
                                    'User-Contributed Digits',
                                )}

                                <div className={styles.trainSection}>
                                    <h3>Train the model with your digits</h3>
                                    <button
                                        className={styles.trainButton}
                                        onClick={handleTrain}
                                        disabled={trainingStatus.isTraining}
                                    >
                                        {trainingStatus.isTraining
                                            ? 'Training...'
                                            : 'Train Model with My Digits'}
                                    </button>
                                    {trainingStatus.message && (
                                        <p
                                            className={`${styles.message} ${trainingStatus.message.includes('Success') ? styles.success : styles.error}`}
                                        >
                                            {trainingStatus.message}
                                        </p>
                                    )}
                                </div>

                                <div className={styles.userDigitsSection}>
                                    <h3>View your contributed digits</h3>
                                    <div className={styles.digitSelector}>
                                        {Array.from({ length: 10 }, (_, i) => i).map((digit) => (
                                            <button
                                                key={digit}
                                                className={`${styles.digitButton} ${selectedDigit === digit ? styles.selected : ''}`}
                                                onClick={() => setSelectedDigit(digit)}
                                                disabled={!analysis.userDigits.byDigit[digit]}
                                            >
                                                {digit} ({analysis.userDigits.byDigit[digit] || 0})
                                            </button>
                                        ))}
                                    </div>

                                    {selectedDigit !== null && (
                                        <div className={styles.userDigitsList}>
                                            <h4>
                                                Saved {selectedDigit}s ({userDigits.length})
                                            </h4>
                                            {userDigits.length === 0 ? (
                                                <p>No saved digits found</p>
                                            ) : (
                                                <div className={styles.digitsGrid}>
                                                    {userDigits.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={styles.digitItem}
                                                        >
                                                            <img
                                                                src={`/api/digit-recognition/image/${item.path}`}
                                                                alt={`Digit ${item.digit}`}
                                                                width={56}
                                                                height={56}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(!analysis.userDigits || analysis.userDigits.total === 0) && (
                            <div className={styles.noUserDigits}>
                                <h3>No user-contributed digits yet</h3>
                                <p>
                                    Draw some digits and save them on the main page to build your
                                    own dataset.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Analysis
