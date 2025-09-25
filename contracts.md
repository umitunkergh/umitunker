# UU AI Satış Sözlüğü - API Contracts

## Backend Implementation Plan

### 1. API Endpoints

#### POST /api/search
- **Purpose**: Process sales questions using OpenAI API
- **Input**: 
  ```json
  {
    "question": "string",
    "sessionId": "string (optional)"
  }
  ```
- **Output**:
  ```json
  {
    "question": "string",
    "answer": "string",
    "examples": ["string"],
    "relatedTerms": ["string"],
    "language": "string",
    "timestamp": "datetime"
  }
  ```

#### GET /api/search/recent/{sessionId}
- **Purpose**: Get recent search history for a session
- **Output**: Array of recent searches

### 2. Database Models

#### SearchHistory Collection
```javascript
{
  _id: ObjectId,
  sessionId: String,
  question: String,
  answer: String,
  examples: [String],
  relatedTerms: [String],
  language: String,
  timestamp: Date,
  createdAt: Date
}
```

### 3. Frontend Integration Changes

#### Remove Mock Data Integration
- Replace `mockData` import with API calls
- Update `handleSearch` function to call backend API
- Add session management for search history
- Implement proper error handling

#### API Service Layer
```javascript
// services/api.js
const searchAPI = async (question, sessionId) => {
  const response = await axios.post(`${BACKEND_URL}/api/search`, {
    question,
    sessionId
  });
  return response.data;
};
```

### 4. OpenAI Integration Details

#### System Prompt (Multi-language)
```
Sen Türkiye'nin en iyi satış uzmanısın. Satış ile ilgili her türlü soruyu cevaplayabilirsin.

Önemli kurallar:
1. Soruyu hangi dilde sorulursa, aynı dilde cevap ver
2. Her zaman praktik örnekler ve senaryolar ekle
3. İlgili terimleri de öner
4. Cevapları yapılandırılmış şekilde ver

Yanıt formatı:
- Ana açıklama (detaylı ve anlaşılır)
- En az 3 pratik örnek
- İlgili 3-5 terim önerisi
```

#### Model Configuration
- Model: gpt-4o (latest OpenAI model)
- Max tokens: 1500
- Temperature: 0.7
- Use Emergent LLM Key

### 5. Implementation Steps

1. **Install Dependencies**: emergentintegrations
2. **Setup Environment**: Add EMERGENT_LLM_KEY to .env
3. **Create Models**: SearchHistory MongoDB model
4. **Create API Routes**: /search endpoints
5. **OpenAI Integration**: LlmChat setup with Turkish sales expert prompt
6. **Frontend Integration**: Replace mock with real API calls
7. **Session Management**: UUID-based session tracking
8. **Error Handling**: Comprehensive error responses

### 6. Features to Implement

- ✅ Multi-language support (auto-detect and respond in same language)
- ✅ Structured AI responses with examples
- ✅ Search history storage and retrieval
- ✅ Related terms suggestions
- ✅ Session-based conversation tracking
- ✅ Real-time responses with loading states

### 7. Mock Data Removal

Current mock.js will be completely replaced with:
- Real OpenAI API responses
- Dynamic examples based on AI generation
- Language-appropriate responses
- Contextual related terms