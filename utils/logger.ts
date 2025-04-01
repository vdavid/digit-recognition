import chalk from 'chalk'
import { getConfig } from './config'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
}

const LOG_COLORS: Record<LogLevel, (text: string) => string> = {
    debug: chalk.gray,
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
}

let currentLogLevel: LogLevel = getConfig().logLevel

function setLogLevel(level: LogLevel) {
    currentLogLevel = level
}

function getLogLevel(): LogLevel {
    return currentLogLevel
}

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]
}

function formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const color = LOG_COLORS[level]
    return `[${timestamp}] [${level.toUpperCase()}] ${color(message)}`
}

export const logger = {
    setLogLevel,
    getLogLevel,
    debug(message: string, ...args: unknown[]) {
        if (shouldLog('debug')) {
            console.log(formatMessage('debug', message), ...args)
        }
    },
    info(message: string, ...args: unknown[]) {
        if (shouldLog('info')) {
            console.log(formatMessage('info', message), ...args)
        }
    },
    warn(message: string, ...args: unknown[]) {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message), ...args)
        }
    },
    error(message: string, ...args: unknown[]) {
        if (shouldLog('error')) {
            console.error(formatMessage('error', message), ...args)
        }
    },
} 