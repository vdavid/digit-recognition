# Digit recognition app

A web application for recognizing handwritten digits using the MNIST dataset and enhanced K-Nearest
Neighbors algorithm with user contribution capabilities.

## Features

- Interactive canvas for drawing digits with real-time predictions
- Enhanced KNN classifier with adaptive image preprocessing
- Confidence scoring for predictions
- User contribution system for improving the model
- Dataset analysis and visualization
- Combined training with user-contributed digits

## Project structure

```
digit-recognition/
├── modules/               # Core application modules
│   ├── knn.ts             # KNN classifier implementation
│   ├── mnist.ts           # MNIST dataset loading and processing
│   ├── Canvas.tsx         # Drawing canvas component
│   └── ...                # UI components and utilities
├── pages/                 # Next.js pages
│   ├── index.tsx          # Main drawing and prediction page
│   ├── analysis.tsx       # Dataset analysis and visualization
│   └── api/               # API endpoints
│       └── digit-recognition/
│           ├── classify.ts    # Digit classification endpoint
│           ├── save.ts        # Save user-drawn digits
│           ├── analyze.ts     # Dataset distribution analysis
│           ├── train.ts       # Train with user contributions
│           └── ...
├── public/                # Static assets
└── data/                  # Data storage (created at runtime)
    ├── digit-recognition/ # MNIST dataset cache
    └── user-digits/       # User contributed digits
```

## Tech stack

- **Framework**: Next.js, React, TypeScript
- **Styling**: SCSS Modules
- **Testing**: Vitest
- **Dataset**: MNIST handwritten digits
- **Algorithm**: Enhanced K-Nearest Neighbors with adaptive preprocessing

## Getting started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (v8+ recommended)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How it works

### Drawing and recognition

The application allows users to draw digits on a canvas. When a digit is submitted, it's processed
using several enhancement steps:

1. **Preprocessing**: Centers the digit and applies smoothing
2. **Adaptive thresholding**: Adjusts based on image density
3. **Enhanced KNN**: Uses a combined distance metric with weighted voting
4. **Confidence scoring**: Provides a confidence percentage for predictions

### User contributions

Users can save their drawn digits with correct labels to help improve the model:

1. Draw a digit
2. Label it correctly using the input field
3. Save it for training
4. Visit the Analysis page to see dataset distribution
5. Train the model with user contributions

### Dataset management

- MNIST dataset files are cached locally for improved performance
- User-contributed digits are saved in a structured format
- Combined training data can be created from both sources

## Available commands

- `pnpm dev` - Start development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality checks
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests with Vitest
- `pnpm test:coverage` - Run tests with coverage report

## Project improvements

Recent improvements include:

- Enhanced preprocessing with adaptive thresholding
- Improved KNN algorithm with combined distance metrics
- Confidence scoring to indicate prediction reliability
- User contribution system for continuous improvement
- Dataset analysis and visualization tools
- Support for training with user-contributed digits

## License

MIT
