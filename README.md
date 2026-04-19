# 🩺 Curalink Medical Assistant

[![Live Frontend](https://img.shields.io/badge/Live-Frontend-success?style=for-the-badge)](https://curalink-theta.vercel.app/)
[![Live Backend API](https://img.shields.io/badge/Live-Backend_API-blue?style=for-the-badge)](https://curalink-odoe.onrender.com)

**Curalink** is an AI‑powered medical research assistant designed to empower patients, healthcare professionals, and researchers with rapid access to medical publications, clinical trials, and actionable insights. Simply provide the context—such as disease of interest, intent, and location—and Curalink's conversational AI will comprehensively guide you through the latest research.

## ✨ Key Features
- **Conversational Medical Assistant:** Converse with an AI that contextualizes medical queries based on specific patient data.
- **Publication Research:** Automatically retrieves recent, highly-relevant medical publications related to specific diseases and treatments.
- **Clinical Trials Discovery:** Finds context-aware, active clinical trials tailored by condition and geographical location.
- **Dynamic Interface:** A responsive, engaging chat UI crafted with React to beautifully handle complex, multi-step backend operations (fetching trials, parsing publications, and generating AI summarization). 

## 🌐 Live Demo
The application is fully deployed and accessible here:
- **Frontend App (Vercel):** [https://curalink-theta.vercel.app/](https://curalink-theta.vercel.app/)
- **Backend API Server (Render):** [https://curalink-odoe.onrender.com](https://curalink-odoe.onrender.com)

## 🛠 Technology Stack
### Frontend
- **Framework Core:** React 19 / Vite
- **Styling:** CSS3

### Backend
- **Server:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Generative AI:** Ollama (for AI inference and responses)
- **Data Integrations:** Axios, xml2js (for fetching and parsing complex clinical trial xml datasets)

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via MongoDB Atlas URI)
- [Ollama](https://ollama.com/) installed and running (for local AI inference)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/Curalink-Medical-Assistant.git
cd Curalink-Medical-Assistant
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory mapping your variables:
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/curalink
FRONTEND_URL=http://localhost:5173
```

Run the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal session.
```bash
cd frontend
npm install
```

Run the Vite development server:
```bash
npm run dev
```

The application is now operational. Access it by navigating to `http://localhost:5173` in your browser.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
