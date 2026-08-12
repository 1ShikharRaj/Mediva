import openai from './client';

export interface CaseDataForSummary {
  patient: {
    name: string;
    age: number;
    sex?: string;
  };
  complaint: string;
  symptoms: string[];
  duration?: string;
  vitals?: any;
  history: string[];
  medications: string[];
  allergies: string[];
  riskAssessment: {
    level: string;
    reasons: string[];
  };
  documentFindings?: string[];
}

export async function generateCaseSummary(data: CaseDataForSummary): Promise<string> {
  const prompt = `
You are an AI assistant supporting a trained health worker.
Your task is to generate a Doctor-Ready AI Case Brief from the provided structured data.

Do not claim to be a doctor.
Do not provide a definitive diagnosis.
Do not independently prescribe medication.
Do not override configured safety rules.
Always append this disclaimer at the end: "AI-generated information. Not a diagnosis. Doctor review is required where clinically appropriate."

Format the brief cleanly using Markdown. Ensure sections like Patient Info, Chief Complaint, Vitals, Relevant History, and AI Safety Status are clearly separated.

Patient Data:
${JSON.stringify(data, null, 2)}
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a clinical summarization assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content || 'Failed to generate summary.';
}
