import { describe, it, expect } from 'vitest'
import { loadMNIST } from '@/modules/mnist'
import { Buffer } from 'buffer'

describe('MNIST Data Loading', () => {
    it('should throw error for invalid image file magic number', async () => {
        const invalidBuffer = Buffer.alloc(16)
        invalidBuffer.writeInt32BE(1234, 0) // Invalid magic number
        await expect(loadMNIST('')).rejects.toThrow('Invalid image file magic number')
    })

    it('should throw error for invalid label file magic number', async () => {
        const invalidBuffer = Buffer.alloc(8)
        invalidBuffer.writeInt32BE(1234, 0) // Invalid magic number
        await expect(loadMNIST('')).rejects.toThrow('Invalid label file magic number')
    })

    it('should handle network errors gracefully', async () => {
        // This test assumes the S3 URL is invalid or unreachable
        await expect(loadMNIST('')).rejects.toThrow('Failed to download the file')
    })
}) 