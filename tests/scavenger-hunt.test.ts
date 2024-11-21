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
  
  it('adds stages successfully', async () => {
    const result = await client.addStage(owner, 1, "First clue", "solution1", 2)
    expect(result.success).toBe(true)
  })
  
  it('sets prize successfully', async () => {
    const result = await client.setPrize(owner, 1000)
    expect(result.success).toBe(true)
  })
  
  it('gets current clue successfully', async () => {
    await client.startHunt(owner)
    await client.addStage(owner, 1, "First clue", "solution1", 2)
    const result = await client.getCurrentClue(participant)
    expect(result.success).toBe(true)
    expect(result.value).toBe("First clue")
  })
  
  it('submits solution successfully', async () => {
    await client.startHunt(owner)
    await client.addStage(owner, 1, "First clue", "solution1", 2)
    await client.addStage(owner, 2, "Second clue", "solution2", 0)
    await client.setPrize(owner, 1000)
    const result = await client.submitSolution(participant, 1, "solution1")
    expect(result.success).toBe(true)
    expect(result.value).toBe("Second clue")
  })
  
  it('completes the hunt and awards prize', async () => {
    await client.startHunt(owner)
    await client.addStage(owner, 1, "First clue", "solution1", 2)
    await client.addStage(owner, 2, "Second clue", "solution2", 0)
    await client.setPrize(owner, 1000)
    await client.submitSolution(participant, 1, "solution1")
    const result = await client.submitSolution(participant, 2, "solution2")
    expect(result.success).toBe(true)
    expect(result.value).toBe("Congratulations! You've completed the hunt and won the prize!")
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
  
  it('fails to submit incorrect solution', async () => {
    await client.startHunt(owner)
    await client.addStage(owner, 1, "First clue", "solution1", 2)
    const result = await client.submitSolution(participant, 1, "wrong-solution")
    expect(result.success).toBe(false)
    expect(result.error).toBe(103) // err-incorrect-solution
  })
})

