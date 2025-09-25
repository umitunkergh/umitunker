import os
import json
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv


load_dotenv()


class AIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY environment variable is required")
    
    def _get_system_prompt(self) -> str:
        return """Sen Türkiye'nin en deneyimli satış uzmanısın. Satış ile ilgili her türlü soruyu profesyonel şekilde cevaplayabilirsin.

ÖNEMLI KURALLAR:
1. Soruyu hangi dilde sorulursa, aynı dilde cevap ver (Türkçe, İngilizce, vb.)
2. Her zaman pratik örnekler ve gerçek senaryolar ekle  
3. İlgili terimleri de öner
4. Cevapları yapılandırılmış şekilde ver
5. Türkiye pazarına uygun örnekler kullan

YANIT FORMATI (JSON formatında döndür):
{
    "answer": "Ana açıklama - detaylı ve anlaşılır şekilde",
    "examples": [
        "Pratik örnek 1 - gerçek senaryolarla",
        "Pratik örnek 2 - sayısal verilerle", 
        "Pratik örnek 3 - sektörel örneklerle"
    ],
    "relatedTerms": [
        "İlgili terim 1",
        "İlgili terim 2", 
        "İlgili terim 3",
        "İlgili terim 4"
    ]
}

Eğer sorulan soru satış ile ilgili değilse, kibarca sadece satış konularında yardımcı olabileceğini belirt."""

    async def get_sales_answer(self, question: str, session_id: str) -> dict:
        """
        Get AI-powered answer for sales questions
        """
        try:
            # Initialize chat with system prompt
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=self._get_system_prompt()
            ).with_model("openai", "gpt-4o")
            
            # Create user message
            user_message = UserMessage(
                text=f"Satış sorusu: {question}"
            )
            
            # Get AI response
            response = await chat.send_message(user_message)
            
            # Try to parse JSON response
            try:
                # Clean the response text and extract JSON
                response_text = response.strip()
                
                # Remove markdown code blocks if present
                if response_text.startswith('```json'):
                    response_text = response_text[7:-3]
                elif response_text.startswith('```'):
                    response_text = response_text[3:-3]
                
                # Parse JSON
                parsed_response = json.loads(response_text)
                
                # Validate required fields
                if not isinstance(parsed_response, dict):
                    raise ValueError("Response is not a valid JSON object")
                
                # Ensure required fields exist
                answer = parsed_response.get('answer', response_text)
                examples = parsed_response.get('examples', [])
                related_terms = parsed_response.get('relatedTerms', [])
                
                # Ensure examples and related_terms are lists
                if not isinstance(examples, list):
                    examples = []
                if not isinstance(related_terms, list):
                    related_terms = []
                
                return {
                    'answer': answer,
                    'examples': examples,
                    'relatedTerms': related_terms
                }
                
            except (json.JSONDecodeError, ValueError) as e:
                # Fallback: use raw response
                return {
                    'answer': response,
                    'examples': [],
                    'relatedTerms': []
                }
                
        except Exception as e:
            print(f"AI Service Error: {str(e)}")
            # Fallback response
            return {
                'answer': f'"{question}" hakkında detaylı bilgi sağlayamadım. Lütfen sorunuzu yeniden ifade edin veya başka bir satış terimi deneyin.',
                'examples': [
                    'Teknik bir sorun yaşandı',
                    'Lütfen daha sonra tekrar deneyin'
                ],
                'relatedTerms': ['Satış Stratejisi', 'Müşteri İlişkileri', 'Performans Metrikleri']
            }
    
    def detect_language(self, text: str) -> str:
        """
        Simple language detection based on Turkish characters and common words
        """
        turkish_chars = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü']
        turkish_words = ['nedir', 'nasıl', 'ne', 'için', 'olan', 've', 'ile', 'bir', 'bu', 'şu']
        
        # Check for Turkish characters
        if any(char in text for char in turkish_chars):
            return 'tr'
        
        # Check for Turkish words
        if any(word in text.lower() for word in turkish_words):
            return 'tr'
        
        # Default to English for other languages
        return 'en'