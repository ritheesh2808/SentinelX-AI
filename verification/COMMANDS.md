# Verification Commands Log — SentinelX AI

This file logs all terminal commands executed during the QA audit, verification, and testing of SentinelX AI.

## 1. Repository Cleanliness & Status
To check the git index status and active changes:
```bash
git status
```

To review recent commits:
```bash
git log -n 5
```

## 2. Compilation and Packaging
To build the backend API service:
```bash
cd backend
npm run build
```

To build the frontend React/Vite client:
```bash
cd frontend
npm run build
```

## 3. Dependency Security Auditing
To audit the backend packages for known security issues:
```bash
cd backend
npm audit
```

To audit the frontend packages:
```bash
cd frontend
npm audit
```

## 4. Static Code Quality & Linting
To check the frontend codebase for formatting and TypeScript compliance issues:
```bash
cd frontend
npm run lint
```

## 5. Backend Server API Tests
To authenticate as a QA analyst:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa_analyst@sentinelx.ai","password":"SecurePassword123!"}'
```

To run the root service check:
```bash
curl -s http://localhost:5000/
```

To run the AI module health check:
```bash
curl -s http://localhost:5000/ai/health
```

To test the main SOC Correlation AI endpoint (returns correlated network topologies, vulnerability priorities, and playbooks):
```bash
curl -s -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/ai/soc-analysis
```

To check the board SOC PDF report download:
```bash
curl -s -o test-board.pdf -D headers.txt \
  -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/ai/soc-analysis/download
```

To test the SOC assistant chatbot:
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message":"What should I patch first?"}' \
  http://localhost:5000/ai/chat
```
