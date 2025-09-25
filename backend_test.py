#!/usr/bin/env python3
"""
Backend API Testing for UU AI Sales Dictionary
Tests all backend endpoints with Turkish and English sales questions
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sales-query-hub.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = None
        self.test_session_id = str(uuid.uuid4())
        self.results = {
            'health_check': False,
            'search_turkish': False,
            'search_english': False,
            'search_mixed': False,
            'recent_searches': False,
            'popular_searches': False,
            'error_handling': False,
            'database_storage': False
        }
        self.errors = []

    async def setup(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()

    async def cleanup(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()

    async def test_health_check(self):
        """Test GET /api/ health check endpoint"""
        print("🔍 Testing health check endpoint...")
        try:
            async with self.session.get(f"{API_BASE_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "UU AI Satış Sözlüğü API is running" in data.get('message', ''):
                        print("✅ Health check passed")
                        self.results['health_check'] = True
                        return True
                    else:
                        self.errors.append(f"Health check: Unexpected message: {data}")
                else:
                    self.errors.append(f"Health check: HTTP {response.status}")
        except Exception as e:
            self.errors.append(f"Health check error: {str(e)}")
        
        print("❌ Health check failed")
        return False

    async def test_search_endpoint(self, question, language_type, expected_language):
        """Test POST /api/search endpoint with different questions"""
        print(f"🔍 Testing search endpoint with {language_type} question: '{question}'")
        
        try:
            payload = {
                "question": question,
                "sessionId": self.test_session_id
            }
            
            async with self.session.post(
                f"{API_BASE_URL}/search",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ['sessionId', 'question', 'answer', 'examples', 'relatedTerms', 'language', 'timestamp']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.errors.append(f"Search {language_type}: Missing fields: {missing_fields}")
                        return False
                    
                    # Validate data types
                    if not isinstance(data['examples'], list):
                        self.errors.append(f"Search {language_type}: 'examples' should be a list")
                        return False
                    
                    if not isinstance(data['relatedTerms'], list):
                        self.errors.append(f"Search {language_type}: 'relatedTerms' should be a list")
                        return False
                    
                    # Validate session ID matches
                    if data['sessionId'] != self.test_session_id:
                        self.errors.append(f"Search {language_type}: Session ID mismatch")
                        return False
                    
                    # Validate question matches
                    if data['question'] != question:
                        self.errors.append(f"Search {language_type}: Question mismatch")
                        return False
                    
                    # Validate language detection
                    if data['language'] != expected_language:
                        print(f"⚠️  Language detection: Expected {expected_language}, got {data['language']}")
                    
                    # Validate answer is not empty
                    if not data['answer'] or len(data['answer'].strip()) == 0:
                        self.errors.append(f"Search {language_type}: Empty answer")
                        return False
                    
                    print(f"✅ Search {language_type} passed")
                    print(f"   Answer length: {len(data['answer'])} chars")
                    print(f"   Examples count: {len(data['examples'])}")
                    print(f"   Related terms count: {len(data['relatedTerms'])}")
                    print(f"   Detected language: {data['language']}")
                    
                    return True
                    
                else:
                    error_text = await response.text()
                    self.errors.append(f"Search {language_type}: HTTP {response.status} - {error_text}")
                    
        except Exception as e:
            self.errors.append(f"Search {language_type} error: {str(e)}")
        
        print(f"❌ Search {language_type} failed")
        return False

    async def test_recent_searches(self):
        """Test GET /api/search/recent/{session_id} endpoint"""
        print(f"🔍 Testing recent searches endpoint for session: {self.test_session_id}")
        
        try:
            async with self.session.get(f"{API_BASE_URL}/search/recent/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not isinstance(data, list):
                        self.errors.append("Recent searches: Response should be a list")
                        return False
                    
                    # Should have at least one search from previous tests
                    if len(data) == 0:
                        self.errors.append("Recent searches: No search history found (database storage issue)")
                        return False
                    
                    # Validate structure of first item
                    if data:
                        first_item = data[0]
                        required_fields = ['sessionId', 'question', 'answer', 'examples', 'relatedTerms', 'language', 'timestamp', 'createdAt']
                        missing_fields = [field for field in required_fields if field not in first_item]
                        
                        if missing_fields:
                            self.errors.append(f"Recent searches: Missing fields in history item: {missing_fields}")
                            return False
                        
                        # Validate session ID
                        if first_item['sessionId'] != self.test_session_id:
                            self.errors.append("Recent searches: Session ID mismatch in history")
                            return False
                    
                    print(f"✅ Recent searches passed - Found {len(data)} searches")
                    self.results['recent_searches'] = True
                    self.results['database_storage'] = True  # If we can retrieve, storage works
                    return True
                    
                else:
                    error_text = await response.text()
                    self.errors.append(f"Recent searches: HTTP {response.status} - {error_text}")
                    
        except Exception as e:
            self.errors.append(f"Recent searches error: {str(e)}")
        
        print("❌ Recent searches failed")
        return False

    async def test_popular_searches(self):
        """Test GET /api/search/popular endpoint"""
        print("🔍 Testing popular searches endpoint...")
        
        try:
            async with self.session.get(f"{API_BASE_URL}/search/popular") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not isinstance(data, list):
                        self.errors.append("Popular searches: Response should be a list")
                        return False
                    
                    # Validate structure if there are items
                    if data:
                        first_item = data[0]
                        required_fields = ['question', 'count', 'lastSearched']
                        missing_fields = [field for field in required_fields if field not in first_item]
                        
                        if missing_fields:
                            self.errors.append(f"Popular searches: Missing fields: {missing_fields}")
                            return False
                        
                        # Validate count is a number
                        if not isinstance(first_item['count'], int) or first_item['count'] < 1:
                            self.errors.append("Popular searches: Invalid count value")
                            return False
                    
                    print(f"✅ Popular searches passed - Found {len(data)} popular searches")
                    self.results['popular_searches'] = True
                    return True
                    
                else:
                    error_text = await response.text()
                    self.errors.append(f"Popular searches: HTTP {response.status} - {error_text}")
                    
        except Exception as e:
            self.errors.append(f"Popular searches error: {str(e)}")
        
        print("❌ Popular searches failed")
        return False

    async def test_error_handling(self):
        """Test error handling with invalid requests"""
        print("🔍 Testing error handling...")
        
        try:
            # Test empty question
            payload = {"question": "", "sessionId": self.test_session_id}
            async with self.session.post(
                f"{API_BASE_URL}/search",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status not in [400, 422, 500]:
                    self.errors.append(f"Error handling: Expected error status for empty question, got {response.status}")
                    return False
            
            # Test invalid session ID format for recent searches
            async with self.session.get(f"{API_BASE_URL}/search/recent/invalid-session") as response:
                # Should still work but return empty list or handle gracefully
                if response.status not in [200, 404]:
                    self.errors.append(f"Error handling: Unexpected status for invalid session: {response.status}")
                    return False
            
            print("✅ Error handling passed")
            self.results['error_handling'] = True
            return True
            
        except Exception as e:
            self.errors.append(f"Error handling test error: {str(e)}")
        
        print("❌ Error handling failed")
        return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting UU AI Sales Dictionary Backend Tests")
        print(f"📍 Testing against: {API_BASE_URL}")
        print("=" * 60)
        
        await self.setup()
        
        try:
            # Test 1: Health check
            await self.test_health_check()
            
            # Test 2-4: Search endpoints with different languages
            if await self.test_search_endpoint("KPI nedir?", "Turkish", "tr"):
                self.results['search_turkish'] = True
            
            if await self.test_search_endpoint("What is lead generation?", "English", "en"):
                self.results['search_english'] = True
            
            if await self.test_search_endpoint("Sales funnel nasıl çalışır?", "Mixed", "tr"):
                self.results['search_mixed'] = True
            
            # Small delay to ensure database writes complete
            await asyncio.sleep(1)
            
            # Test 5: Recent searches (tests database storage)
            await self.test_recent_searches()
            
            # Test 6: Popular searches
            await self.test_popular_searches()
            
            # Test 7: Error handling
            await self.test_error_handling()
            
        finally:
            await self.cleanup()
        
        # Print results
        self.print_results()

    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.results.values() if result)
        total = len(self.results)
        
        for test_name, result in self.results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title():<25} {status}")
        
        print("-" * 60)
        print(f"Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if self.errors:
            print("\n🚨 ERRORS ENCOUNTERED:")
            for i, error in enumerate(self.errors, 1):
                print(f"{i}. {error}")
        
        print("\n" + "=" * 60)
        
        # Critical issues check
        critical_failures = []
        if not self.results['health_check']:
            critical_failures.append("Health check endpoint not responding")
        if not self.results['search_turkish'] and not self.results['search_english']:
            critical_failures.append("AI search functionality completely broken")
        if not self.results['database_storage']:
            critical_failures.append("Database storage not working")
        
        if critical_failures:
            print("🚨 CRITICAL ISSUES FOUND:")
            for issue in critical_failures:
                print(f"   • {issue}")
        else:
            print("✅ No critical issues found")

async def main():
    """Main test runner"""
    tester = BackendTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())