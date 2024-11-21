import { describe, it, expect, beforeEach } from 'vitest'
import { mockNet } from './mocks'

describe('scavenger-hunt', () => {
  let client: any
  let owner: string
  let participant: string
  
  beforeEach(() => {
    client = mockNet.createClient()
    owner = mockNet.getOwner()
    participant = mockNet.getParticipant()
  })
  
  it('starts the hunt successfully', async () => {
    const result = await client.startHunt(owner)
    expect(result.success).toBe(true)
  })
  
  it('fails to start hunt twice', async () => {
    await client.startHunt(owner)
    const result = await client.startHunt(owner)
    expect(result.success).toBe(false)
    expect(result.error).toBe(104) // err-hunt-not-started
  })
  
  it('fails to add stage after hunt starts', async () => {
    await client.startHunt(owner)
    const result = await client.addStage(owner, 1, "First clue", "solution1", 2)
    expect(result.success).toBe(false)
    expect(result.error).toBe(104) // err-hunt-not-started
  })
})

