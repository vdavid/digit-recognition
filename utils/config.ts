import type { LogLevel } from './logger'

interface Config {
    logLevel: LogLevel
}

// Default configuration
const defaultConfig: Config = {
    logLevel: 'info' // Default to 'info' level in production
}

let config = { ...defaultConfig }

// Load environment-specific config
if (process.env.NODE_ENV === 'development') {
    config.logLevel = 'debug' // Use 'debug' level in development
}

export function getConfig(): Config {
    return config
}

export function setConfig(newConfig: Partial<Config>): void {
    config = { ...config, ...newConfig }
} 