# E-Government Investment & Company Establishment Portal

This project is a comprehensive full-stack solution designed for university presentation and demonstration. It implements a fully functional e-government workflow for investors to submit investment requests, which then undergo parallel verification, risk evaluation, and official approval.

## 🏗️ Architecture

The project utilizes a clean, professional architecture separating concerns across three main layers:

- **Frontend (`/frontend`)**: React.js application initialized with Vite. Features a premium UI with custom CSS, routing, and asynchronous API calls via Axios.
- **Backend (`/backend`)**: Node.js/Express REST API. Connects to MongoDB via Mongoose for persistent data storage. Implements Kafka producers and consumers for event-driven asynchronous communication (e.g., email notifications).
- **Workflow (`/workflow`)**: Contains the business process logic (BPMN) that outlines the jBPM execution flow.

### Tech Stack
- **Frontend**: React (Vite), Axios, Lucide React (Icons), Vanilla CSS
- **Backend**: Node.js, Express, Mongoose, KafkaJS, Nodemailer
- **Database**: MongoDB (via Docker)
- **Message Broker**: Apache Kafka & Zookeeper (via Docker)
- **Workflow Engine**: jBPM (represented via BPMN and REST API integration architecture)

---

## 🚀 Setup Instructions

Follow these step-by-step instructions to get the application running locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for MongoDB and Kafka)
- [Git](https://git-scm.com/)

### 2. Start Infrastructure (MongoDB & Kafka)
Open a terminal in the root directory and run:
\`\`\`bash
docker-compose up -d
\`\`\`
*Wait about 30 seconds for Kafka to fully initialize.*

### 3. Start the Backend
Open a new terminal, navigate to the \`backend\` folder, install dependencies, and start the server:
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
*The backend server will start on \`http://localhost:5000\`. You should see messages confirming MongoDB and Kafka Consumer connections.*

### 4. Start the Frontend
Open another terminal, navigate to the \`frontend\` folder, install dependencies, and start the React app:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*The frontend application will run on \`http://localhost:3000\`.*

---

## 🎭 University Presentation: End-to-End Demo Scenario

This scenario is designed to showcase the complete workflow of the application during a presentation.

### **Phase 1: The Investor Journey**
1. **Context**: Explain that an investor wants to start a new company and needs government approval.
2. **Action**: Open the frontend (\`http://localhost:3000\`) and click on **"New Request"** in the sidebar.
3. **Execution**: Fill out the submission form with sample data:
   - *Company Name*: TechNova Solutions
   - *Investment Amount*: 1,500,000
   - *Description*: AI Research Facility
   - *National ID*: 12345678901234
   - *Tax ID*: TAX-98765
4. **Result**: Submit the form. The system redirects to the Status Dashboard showing the request as **"PENDING"**.
   - *Explanation*: Emphasize that in the background, the Node.js API received the request and mocked parallel calls to external APIs (National ID Verification and Tax Clearance) before saving it to MongoDB.

### **Phase 2: The Official Approval Workflow**
1. **Context**: Switch roles. You are now the Government Official reviewing applications.
2. **Action**: Navigate to the **"Approvals (Official)"** tab.
3. **Execution**: You will see the "TechNova Solutions" request in the pending list. Notice the "Verified" and "Cleared" badges resulting from the mock external API calls.
4. **Result**: Click the green **"Approve"** button. Add a brief comment like *"All documents verified, high-value investment."*

### **Phase 3: Asynchronous Communication (The Magic)**
1. **Context**: Explain what happens *after* you click approve. This is where you highlight the microservices architecture.
2. **Show the Logs**: Open your backend terminal. Show the audience the logs:
   - \`Message sent to topic notifications...\` (The Express controller published a Kafka event).
   - \`Received notification payload...\` (The Kafka Consumer running asynchronously picked up the event).
   - \`Email sent...\` (The Nodemailer service was triggered to send the approval email).
3. **Action**: Go back to the **"Status Dashboard"** on the frontend. Click Refresh.
4. **Result**: The status is now beautifully updated to **"APPROVED"** with a green badge.

---

## 🧠 jBPM vs. Node.js Architecture Guidance

For your presentation, it is crucial to explain the separation of concerns between your Node.js application and the jBPM workflow engine.

### What Stays in Node.js?
Node.js acts as the **Integration & Presentation Layer**:
- Serving REST APIs to the React frontend.
- Connecting to the MongoDB database (CRUD operations).
- Acting as a Kafka Producer (publishing events when user actions occur).
- Acting as a Kafka Consumer (listening for events to send emails).
- Connecting to external systems (or mocking them, like National ID verification).

### What Stays in jBPM?
jBPM acts as the **Business Logic & Orchestration Layer**:
- **Process Definitions**: The visual BPMN flow (like parallel gateways for verification).
- **State Management**: Keeping track of exactly where a request is in the workflow (e.g., waiting for risk evaluation).
- **Business Rules**: Executing DMN (Decision Model and Notation) tables to calculate the "Risk Score" based on the investment amount.

### How do they Communicate?
The architecture relies on **Asynchronous REST and Messaging**:
1. When Node.js receives the frontend submission, it calls the **jBPM REST API** (\`/server/containers/{containerId}/processes/{processId}/instances\`) to start a new process instance.
2. jBPM reaches a "Service Task" in the BPMN flow (e.g., "Verify National ID"). It makes a REST call *back* to your Node.js API to perform the work.
3. Once jBPM completes the entire flow (or reaches an approval gate), it can publish a message to **Kafka**.
4. Your Node.js Kafka Consumer listens to that topic, updates the MongoDB status, and emails the investor.

---

## 📊 Contribution Summary

If asked about the project status and contributions, frame it as follows:

- **Already Completed**: Initial boilerplate, basic Mongoose schemas, and generic role-based routing.
- **Your Personal Contribution (The Implementation Phase)**: 
  - Designed and developed the **Kafka Event-Driven Architecture** (Producer/Consumer setup).
  - Integrated **Nodemailer** for automated asynchronous emails.
  - Built the **Mock External APIs** for ID and Tax verification to simulate real-world e-government integrations.
  - Developed the **Premium React Dashboards** (Status Page & Approval Workflow) utilizing modern UI/UX principles.
  - Finalized the **Express REST APIs** and structured the complete MVC architecture.
  - Containerized the infrastructure using **Docker Compose**.
