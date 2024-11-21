# Cryptographic Scavenger Hunt Smart Contract

## Overview
This Stacks blockchain smart contract implements a multi-stage cryptographic scavenger hunt where participants solve clues to progress through stages and win a prize.

## Features
- Multi-stage puzzle mechanism
- Owner-controlled hunt initialization and management
- Secure solution verification
- Prize distribution upon successful hunt completion

## Contract Functions

### Owner Functions
- `start-hunt()`: Begins the scavenger hunt
- `end-hunt()`: Terminates the hunt
- `add-stage()`: Creates puzzle stages with clues and solutions
- `set-prize()`: Sets the total prize amount for the hunt

### Participant Functions
- `submit-solution()`: Submit solutions to progress through stages
- `get-current-clue()`: Retrieve the current stage's clue

### Read-Only Functions
- `get-participant-progress()`: Check a participant's current stage
- `is-hunt-active()`: Verify if the hunt is currently running

## Error Handling
The contract includes specific error codes for various scenarios:
- `err-owner-only` (u100): Unauthorized owner action
- `err-not-found` (u101): Stage not found
- `err-already-solved` (u102): Stage already completed
- `err-incorrect-solution` (u103): Incorrect solution submitted
- `err-hunt-not-started` (u104): Hunt hasn't begun
- `err-hunt-ended` (u105): Hunt has concluded

## Contract State Variables
- `hunt-started`: Boolean tracking hunt initialization
- `hunt-ended`: Boolean tracking hunt completion
- `current-stage`: Current stage number
- `prize`: Total prize amount in STX

## Maps
- `stages`: Stores stage details (clue, solution, next stage)
- `participant-progress`: Tracks each participant's current stage

## Usage Flow
1. Contract owner sets up stages
2. Owner starts the hunt
3. Participants solve clues sequentially
4. Final stage completion awards the prize
5. Owner can end the hunt

## Security Considerations
- Only contract owner can initialize/modify hunt
- Strict stage progression verification
- Prevents out-of-order solution submissions

## Requirements
- Stacks blockchain
- Compatible Stacks wallet

## Deployment
Deploy via Stacks blockchain development tools like Clarinet or sCrypt

## License
[Specify your license here]

## Contributing
[Add contribution guidelines]
