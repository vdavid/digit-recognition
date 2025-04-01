# Digit recognition app

A web application for recognizing handwritten digits using the MNIST dataset
and K-Nearest Neighbors algorithm.
It doesn't really work right now :D

## Features

- Draw digits on a canvas and get real-time predictions
- KNN classifier implementation for digit recognition
- Caching of MNIST dataset files for improved performance

## Tech Stack

- **Frontend**: Next.js, React 19, TypeScript
- **Styling**: SCSS
- **Testing**: Vitest
- **Dataset**: MNIST handwritten digits

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- pnpm

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

## How It Works

The application allows users to draw digits on a canvas. When a digit is submitted, it's sent to the API endpoint which uses a K-Nearest Neighbors algorithm to compare it against the MNIST dataset and predict which digit it represents.

The MNIST dataset files are cached in the `/data/digit-recognition` directory to avoid unnecessary downloads and improve performance.

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage report

## License

MIT 