import React from 'react'
import Canvas from '../../modules/digit-recognition/Canvas'
import { preprocessImage } from '../../modules/digit-recognition/preprocessing'
import { useTheme } from 'next-themes'
import DefaultLayout from '../../modules/site/DefaultLayout'

const Home: React.FC = () => {
    const { theme } = useTheme()

    const handleSubmit = async (pixels: number[][]) => {
        const preprocessedImage = preprocessImage(pixels)
        const response = await fetch('/api/digit-recognition/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preprocessedImage),
        })

        const predictedDigit = await response.json()
        console.log(`Predicted digit: ${predictedDigit}`)
    }

    return (
        <DefaultLayout title="Digit recognition | David Veszelovszki" description="I like carrots.">
            <header>
                <h1>Digit recognition</h1>
                <p>by David Veszelovszki and GPT-4</p>
            </header>
            <main>
                <Canvas size={28} darkMode={theme === 'dark'} onSubmit={handleSubmit}/>
            </main>
        </DefaultLayout>
    )
}

export default Home
