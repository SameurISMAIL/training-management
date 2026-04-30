import { Injectable } from '@angular/core';

import { GlobalStats } from './statistique.service';

export interface WhatIfSimulationInputs {
  formations: number;
  averageParticipantsPerFormation: number;
  costPerFormation: number;
  trainers: number;
}

export interface WhatIfMetricResult {
  real: number;
  simulated: number;
  delta: number;
  deltaPercent: number;
}

export interface WhatIfSimulationResult {
  formations: WhatIfMetricResult;
  participants: WhatIfMetricResult;
  formateurs: WhatIfMetricResult;
  budget: WhatIfMetricResult;
}

@Injectable({
  providedIn: 'root'
})
export class WhatIfSimulationService {
  simulate(base: GlobalStats, inputs: WhatIfSimulationInputs): WhatIfSimulationResult {
    const formations = this.normalize(inputs.formations);
    const averageParticipantsPerFormation = this.normalize(inputs.averageParticipantsPerFormation);
    const costPerFormation = this.normalize(inputs.costPerFormation);
    const trainers = this.normalize(inputs.trainers);

    const simulatedParticipants = Math.round(formations * averageParticipantsPerFormation);
    const simulatedBudget = Math.round(formations * costPerFormation);

    return {
      formations: this.compare(base.totalFormations, formations),
      participants: this.compare(base.totalParticipants, simulatedParticipants),
      formateurs: this.compare(base.totalFormateurs, trainers),
      budget: this.compare(base.budgetTotal, simulatedBudget)
    };
  }

  private compare(real: number, simulated: number): WhatIfMetricResult {
    const delta = simulated - real;
    const deltaPercent = real === 0 ? (simulated > 0 ? 100 : 0) : Number(((delta / real) * 100).toFixed(1));

    return {
      real,
      simulated,
      delta,
      deltaPercent
    };
  }

  private normalize(value: number): number {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }
}