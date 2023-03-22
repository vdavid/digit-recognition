import React from 'react';
import Canvas from '../../modules/digit-recognition/Canvas';
import { preprocessImage } from '../../modules/digit-recognition/preprocessing';

const Home: React.FC = () => {
    const handleSubmit = (pixels: number[][]) => {
        const preprocessedImage = preprocessImage(pixels);
        console.log(preprocessedImage);
    };

    return (
        <div>
            <h1>Handwritten Digit Recognition</h1>
            <Canvas onSubmit={handleSubmit}/>
        </div>
    );
};

export default Home;
