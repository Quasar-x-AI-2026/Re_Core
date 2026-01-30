🧠 Core Idea

“There are no right or wrong answers — we observe how you decide, not what you know.”

RECORE transforms micro-signals into:

Learning stability

Exploration vs consolidation behavior

Confidence momentum

Curriculum readiness (CVSC)

Mentorship signals

🏗️ Architecture Overview
Frontend (React)
 ├─ Questionnaire (collects signals)
 ├─ RECORE Engine (pure, deterministic JS engine)
 ├─ Trajectory Visualization (3D Globe)
 └─ Dashboard (Insights, CVSC, Roadmap)

Backend (Flask)
 ├─ User persistence
 ├─ Signal storage
 └─ (WIP) Trajectory persistence APIs


⚠️ Important design choice
The RECORE Engine runs entirely on the frontend.
The backend is intentionally kept lightweight and stores only raw signals and metadata.

📁 Project Structure
backend/
 ├─ app.py                # Flask API (users + signals)
 ├─ instance/
 │   └─ data.db            # SQLite (local only, ignored in git)
 └─ venv/                  # Python virtualenv (ignored)

frontend/
 ├─ src/
 │   ├─ engine/            # Core RECORE intelligence (pure functions)
 │   │   ├─ recoreEngine.js
 │   │   ├─ signalExtractor.js
 │   │   ├─ trajectoryModel.js
 │   │   └─ roadmapBuilder.js
 │   ├─ hooks/
 │   │   └─ useRECORE.js   # React ↔ Engine bridge
 │   ├─ pages/
 │   │   ├─ QuestionnaireFlow.jsx
 │   │   └─ DashboardPage.jsx
 │   └─ components/
 │       └─ TrajectoryGlobe.jsx
 ├─ public/
 └─ package.json

🔬 RECORE Engine (Frontend)

The engine is pure and deterministic:

recorEngine(rawSignals, questionBank, context, existingTrajectory)

Processing Pipeline

Signal Extraction

Timing variance

Confidence variance

Hesitation patterns

Latent Scoring

Exploration

Depth orientation

Application preference

Feature Derivation

Stability index

Exploration index

Self-trust vs guidance

Trajectory Modeling

3D learning space

Momentum + stability

Explainable Insights

Every insight maps to concrete signals

📊 Dashboard Outputs

Learning Stability (%)

Exploration Mode

Confidence Momentum

3D Trajectory Globe

Explainable Insights

CVSC (Curriculum Voluntary Structural Commitment)

Mentorship Recommendation

🧪 Current Status
✅ Working

Questionnaire flow

Signal capture & storage

Frontend RECORE engine

Dashboard visualization

Insight generation

CVSC logic (frontend)

⚠️ Known Limitations

Backend does not yet implement:

/api/trajectory

/api/curriculum/*

Some dashboard values may show NaN when:

Insufficient signals exist

Backend trajectory fetch returns 404

Trajectory persistence is WIP

These are expected in the current phase and tracked intentionally.


🔐 Git & Commit Philosophy

node_modules/, venv/, .env, data.db are never committed

Commits are layered:

Repo structure

Backend persistence

Frontend UI

Engine logic

Fixes & refinements

📌 Roadmap

 Backend trajectory persistence

 Curriculum roadmap storage

 Multi-session trajectory evolution

 Comparative cohort insights

 Mentor matching engine

🧭 Vision

RECORE is not an assessment tool.

It is an intelligence layer that:

Respects uncertainty

Treats exploration as a signal, not noise

Encourages autonomy over prescription
