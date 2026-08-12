import openai from './client';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export const PatientExtractionSchema = z.object({
  chiefComplaint: z.string(),
  symptoms: z.array(z.string()),
  duration: z.string().nullable(),
  relevantHistory: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),
  missingInformation: z.array(z.string())
});

export type PatientExtractionResult = z.infer<typeof PatientExtractionSchema>;

export async function extractPatientInfo(rawText: string): Promise<PatientExtractionResult> {
  const prompt = `
You are an AI assistant supporting a trained health worker in a rural clinic.
Your task is to extract structured patient information from the provided raw text.

Raw text may be an unstructured note or a voice transcript from a health worker.

Extract the information into the required JSON structure.
If important information is missing (like duration of symptoms when symptoms are severe), state what is missing in the missingInformation array.

Do not claim to be a doctor.
Do not provide a definitive diagnosis.
Do not independently prescribe medication.
Do not override configured safety rules.

Raw Text:
"""
${rawText}
"""
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a clinical data extraction assistant. Always respond with JSON." },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(PatientExtractionSchema, "patient_extraction"),
  });

  const parsedText = completion.choices[0].message.content;
  if (!parsedText) {
    throw new Error("Failed to parse patient extraction output");
  }

  return JSON.parse(parsedText) as PatientExtractionResult;
}
