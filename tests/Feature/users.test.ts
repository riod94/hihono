import { describe, expect, test } from 'bun:test'

describe('users_feature', () => {
    test('Should return 200 response', async () => {
        const url = `${process.env.APP_URL}/${process.env.COMPANY}/api/users`
        const response = await fetch(url)
        expect(response.status).toBe(200)
    })
})