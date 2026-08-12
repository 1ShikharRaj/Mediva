export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface PatientData {
  age: number;
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  symptoms: string[];
  duration?: string;
  chiefComplaint: string;
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  flags: string[];
  reasons: string[];
  requiresDoctorReview: boolean;
  requiresEmergencyReferral: boolean;
}

// Deterministic rules
export function assessRisk(data: PatientData): RiskAssessment {
  const flags: string[] = [];
  const reasons: string[] = [];
  let riskLevel: string = 'GREEN';
  let requiresDoctorReview = false;
  let requiresEmergencyReferral = false;

  // 1. Vitals Check
  if (data.vitals) {
    // Temperature check (Fahrenheit assumed for demo, e.g., 102F)
    if (data.vitals.temperature && data.vitals.temperature > 103) {
      flags.push('HIGH_FEVER');
      reasons.push('Temperature over 103°F');
      riskLevel = 'RED';
    } else if (data.vitals.temperature && data.vitals.temperature >= 101) {
      flags.push('ELEVATED_TEMPERATURE');
      reasons.push('Elevated temperature');
      if (riskLevel !== 'RED') riskLevel = 'YELLOW';
    }

    // Oxygen Saturation check
    if (data.vitals.oxygenSaturation && data.vitals.oxygenSaturation < 92) {
      flags.push('LOW_SPO2_CRITICAL');
      reasons.push('Oxygen saturation below 92%');
      riskLevel = 'RED';
    } else if (data.vitals.oxygenSaturation && data.vitals.oxygenSaturation < 95) {
      flags.push('LOW_SPO2');
      reasons.push('Oxygen saturation below 95%');
      if (riskLevel !== 'RED') riskLevel = 'YELLOW';
    }

    // Pulse check
    if (data.vitals.pulse && (data.vitals.pulse > 120 || data.vitals.pulse < 50)) {
      flags.push('ABNORMAL_PULSE');
      reasons.push('Resting heart rate outside normal range (50-120)');
      if (riskLevel !== 'RED') riskLevel = 'YELLOW';
    }
  }

  // 2. Symptom keyword matching (Basic deterministic matching)
  const urgentKeywords = ['chest pain', 'breathing difficulty', 'unconscious', 'seizure', 'severe bleeding'];
  const reviewKeywords = ['persistent', 'weakness', 'dizzy', 'vomiting', 'pain', 'fever'];

  const allText = (data.chiefComplaint + ' ' + data.symptoms.join(' ')).toLowerCase();

  for (const keyword of urgentKeywords) {
    if (allText.includes(keyword)) {
      flags.push('URGENT_SYMPTOM');
      reasons.push(`Reported potentially urgent symptom: ${keyword}`);
      riskLevel = 'RED';
    }
  }

  if (riskLevel !== 'RED') {
    for (const keyword of reviewKeywords) {
      if (allText.includes(keyword)) {
        flags.push('REVIEW_SYMPTOM');
        reasons.push(`Reported symptom requires review: ${keyword}`);
        riskLevel = 'YELLOW';
      }
    }
  }

  // 3. Duration logic
  if (data.duration) {
    const durLower = data.duration.toLowerCase();
    if (durLower.includes('week') || durLower.includes('month') || parseInt(durLower) > 5) {
      flags.push('PERSISTENT_SYMPTOMS');
      reasons.push('Symptoms persist for extended duration');
      if (riskLevel !== 'RED') riskLevel = 'YELLOW';
    }
  }

  // Final Assessment Output
  if (riskLevel === 'RED') {
    requiresEmergencyReferral = true;
    requiresDoctorReview = true;
  } else if (riskLevel === 'YELLOW') {
    requiresDoctorReview = true;
  }

  if (riskLevel === 'GREEN' && flags.length === 0) {
    reasons.push('No configured red flags detected. Routine case.');
  }

  return {
    riskLevel: riskLevel as RiskLevel,
    requiresDoctorReview,
    requiresEmergencyReferral,
    reasons,
    flags
  };
}
