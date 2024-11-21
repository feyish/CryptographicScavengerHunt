class MockNet {
	private huntStarted: boolean = false;
	private huntEnded: boolean = false;
	private stages: Map<number, { clue: string, solution: string, nextStage: number }> = new Map();
	private participantProgress: Map<string, number> = new Map();
	private prize: number = 0;
	
	createClient() {
		return {
			startHunt: this.startHunt.bind(this),
			addStage: this.addStage.bind(this),
			setPrize: this.setPrize.bind(this),
			getCurrentClue: this.getCurrentClue.bind(this),
			submitSolution: this.submitSolution.bind(this),
		}
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
		this.stages.set(stageNumber, { clue, solution, nextStage });
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
		if (!this.huntStarted) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		if (this.huntEnded) {
			return { success: false, error: 105 }; // err-hunt-ended
		}
		const participantStage = this.participantProgress.get(sender) || 1;
		const stage = this.stages.get(participantStage);
		if (!stage) {
			return { success: false, error: 101 }; // err-not-found
		}
		return { success: true, value: stage.clue };
	}
	
	async submitSolution(sender: string, stage: number, solution: string) {
		if (!this.huntStarted) {
			return { success: false, error: 104 }; // err-hunt-not-started
		}
		if (this.huntEnded) {
			return { success: false, error: 105 }; // err-hunt-ended
		}
		const participantStage = this.participantProgress.get(sender) || 1;
		if (stage !== participantStage) {
			return { success: false, error: 103 }; // err-incorrect-solution
		}
		const stageData = this.stages.get(stage);
		if (!stageData) {
			return { success: false, error: 101 }; // err-not-found
		}
		if (solution !== stageData.solution) {
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
	
	getOwner(): string {
		return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
	}
	
	getParticipant(): string {
		return 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
	}
}

export const mockNet = new MockNet();
