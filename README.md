# SehatBridge AI

## AI Clinical Copilot for Rural Health Workers

SehatBridge AI does not replace rural doctors. It makes rural healthcare workers more capable and remote doctors more effective by turning patient information into a structured, safety-first clinical handoff.

### The Problem
A rural health worker is physically present but lacks immediate access to clinical expertise. 
The remote doctor lacks structured, reliable patient information to make safe decisions quickly.

### The Innovation
AI converts unstructured patient information (text or voice) into a structured, safety-first, doctor-ready case brief. 
The deterministic safety engine ensures urgent cases are immediately flagged for priority review.

### Features
- **AI-Assisted Intake:** Collect symptoms, vitals, and history via voice or text.
- **Safety-First Triage:** Deterministic rules flag HIGH_FEVER, LOW_SPO2, and urgent symptoms.
- **Doctor-Ready Case Brief:** Generates a structured summary for the remote doctor.
- **Remote Consultation:** WebRTC-ready consultation flow.
- **Digital Patient History:** Continuous longitudinal records for patients.
- **Doctor Decision:** Securely records the doctor's final care plan.

### Tech Stack
- Next.js 14+ (App Router)
- React & Tailwind CSS
- MongoDB Atlas & Mongoose
- Clerk Authentication
- OpenAI API (Structured Outputs & Case Summary)
- Cloudinary (Document/Image Uploads)

### Setup & Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   MONGODB_URI=
   MONGODB_DB_NAME=sehatbridge
   OPENAI_API_KEY=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

3. Seed demo data (creates Ravi Kumar and Sunita Devi demo cases):
   ```bash
   npm run seed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Responsible AI
- AI performs extraction and summarization, **not diagnosis**.
- AI suggestions are constrained by deterministic safety rules.
- The **doctor** remains the final clinical decision maker.
