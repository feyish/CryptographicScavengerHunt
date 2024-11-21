class MockNet {
	private markets: Map<number, any> = new Map();
	private userPositions: Map<string, any> = new Map();
	private userBalances: Map<string, number> = new Map();
	private nextMarketId: number = 0;
	private submissions: Map<number, any> = new Map()
	private authorizedParties: Map<string, boolean> = new Map()
	private nextSubmissionId: number = 0
	private huntStarted: boolean = false;
	private huntEnded: boolean = false;
	private stages: Map<number, { clue: string, solutionHash: string, nextStage: number }> = new Map();
	private participantProgress: Map<string, number> = new Map();
	private prize: number = 0;
	
	createClient() {
		return {
			createMarket: this.createMarket.bind(this),
			placeBet: this.placeBet.bind(this),
			resolveMarket: this.resolveMarket.bind(this),
			claimWinnings: this.claimWinnings.bind(this),
			deposit: this.deposit.bind(this),
			withdraw: this.withdraw.bind(this),
			submitWhistleblowerInfo: this.submitWhistleblowerInfo.bind(this),
			addAuthorizedParty: this.addAuthorizedParty.bind(this),
			removeAuthorizedParty: this.removeAuthorizedParty.bind(this),
			isPartyAuthorized: this.isPartyAuthorized.bind(this),
			revealSubmission: this.revealSubmission.bind(this),
			getSubmission: this.getSubmission.bind(this),
			encryptData: this.encryptData.bind(this),
			decryptData: this.decryptData.bind(this),
			startHunt: this.startHunt.bind(this),
			addStage: this.addStage.bind(this),
			setPrize: this.setPrize.bind(this),
			getCurrentClue: this.getCurrentClue.bind(this),
			submitSolution: this.submitSolution.bind(this),
		}
	}
	
	async createMarket(description: string, resolutionTime: number) {
		const marketId = this.nextMarketId++;
		this.markets.set(marketId, {
			description,
			resolutionTime,
			totalYesAmount: 0,
			totalNoAmount: 0,
			resolved: false,
			outcome: null,
		});
		return { success: true, value: marketId };
	}
	
	async placeBet(marketId: number, betOnYes: boolean, amount: number) {
		const market = this.markets.get(marketId);
		if (!market || market.resolved) {
			return { success: false, error: 105 }; // err-market-closed
		}
		if (betOnYes) {
			market.totalYesAmount += amount;
		} else {
			market.totalNoAmount += amount;
		}
		return { success: true };
	}
	
	async resolveMarket(marketId: number, outcome: boolean) {
		const market = this.markets.get(marketId);
		if (!market) {
			return { success: false, error: 101 }; // err-not-found
		}
		market.resolved = true;
		market.outcome = outcome;
		return { success: true };
	}
	
	async claimWinnings(marketId: number) {
		const market = this.markets.get(marketId);
		if (!market || !market.resolved) {
			return { success: false, error: 105 }; // err-market-closed
		}
		// In a real implementation, we would calculate winnings here
		return { success: true, value: 100 }; // Mock winnings
	}
	
	async deposit(amount: number) {
		return { success: true };
	}
	
	async withdraw(amount: number) {
		return { success: true };
	}
	
	async submitWhistleblowerInfo(encryptedContent: string, conditions: string[]) {
		const submissionId = this.nextSubmissionId++
		this.submissions.set(submissionId, {
			encryptedContent,
			conditions,
			revealed: false,
		})
		return { success: true, value: submissionId }
	}
	
	async addAuthorizedParty(party: string) {
		this.authorizedParties.set(party, true)
		return { success: true }
	}
	
	async removeAuthorizedParty(party: string) {
		this.authorizedParties.delete(party)
		return { success: true }
	}
	
	async isPartyAuthorized(party: string) {
		return { success: true, value: this.authorizedParties.get(party) || false }
	}
	
	async revealSubmission(submissionId: number) {
		const submission = this.submissions.get(submissionId)
		if (!submission) {
			return { success: false, error: 101 } // err-not-found
		}
		submission.revealed = true
		return { success: true }
	}
	
	async getSubmission(submissionId: number) {
		const submission = this.submissions.get(submissionId)
		if (!submission) {
			return { success: false, error: 101 } // err-not-found
		}
		return {
			success: true,
			value: {
				revealed: submission.revealed,
				'encrypted-content': submission.encryptedContent,
				conditions: submission.conditions
			}
		}
	}
	
	async encryptData(data: string, publicKey: string) {
		// Simple mock encryption (XOR with public key)
		const result = this.xorBuffers(Buffer.from(data.slice(2), 'hex'), Buffer.from(publicKey.slice(2), 'hex'))
		return { success: true, value: '0x' + result.toString('hex') }
	}
	
	async decryptData(encryptedData: string, privateKey: string) {
		// Simple mock decryption (XOR with private key)
		const result = this.xorBuffers(Buffer.from(encryptedData.slice(2), 'hex'), Buffer.from(privateKey.slice(2), 'hex'))
		return { success: true, value: '0x' + result.toString('hex') }
	}
	
	private xorBuffers(buff1: Buffer, buff2: Buffer): Buffer {
		const result = Buffer.alloc(Math.max(buff1.length, buff2.length))
		for (let i = 0; i < result.length; i++) {
			result[i] = (buff1[i] || 0) ^ (buff2[i] || 0)
		}
		return result
	}
	
	async startHunt(sender: string) {
		if (this.huntStarted) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		this.huntStarted = true;
		return { success: true };
	}
	
	async addStage(sender: string, stageNumber: number, clue: string, solution: string, nextStage: number) {
		if (this.huntStarted) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		this.stages.set(stageNumber, { clue, solutionHash: this.hashSolution(solution), nextStage });
		return { success: true };
	}
	
	async setPrize(sender: string, amount: number) {
		if (this.huntStarted) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		this.prize = amount;
		return { success: true };
	}
	
	async getCurrentClue(sender: string) {
		if (!this.huntStarted || this.huntEnded) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		const participantStage = this.participantProgress.get(sender) || 1;
		const stage = this.stages.get(participantStage);
		if (!stage) {
			return { success: false, error: 101 }; // err-not-found
		}
		return { success: true, value: stage.clue };
	}
	
	async submitSolution(sender: string, stage: number, solution: string) {
		if (!this.huntStarted || this.huntEnded) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		const participantStage = this.participantProgress.get(sender) || 1;
		if (stage !== participantStage) {
			return { success: false, error: 103 }; // err-incorrect-solution
		}
		const stageData = this.stages.get(stage);
		if (!stageData) {
			return { success: false, error: 101 }; // err-not-found
		}
		if (this.hashSolution(solution) !== stageData.solutionHash) {
			return { success: false, error: 103 }; // err-incorrect-solution
		}
		this.participantProgress.set(sender, stageData.nextStage);
		if (stageData.nextStage === 0) {
			this.huntEnded = true;
			return { success: true, value: "Congratulations! You've completed the hunt and won the prize!" };
		}
		const nextStage = this.stages.get(stageData.nextStage);
		return { success: true, value: nextStage ? nextStage.clue : "" };
	}
	
	private hashSolution(solution: string): string {
		return require('crypto').createHash('sha256').update(solution).digest('hex');
	}
	
	getOwner(): string {
		return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
	}
	
	getParticipant(): string {
		return 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
	}
}

export const mockNet = new MockNet()

