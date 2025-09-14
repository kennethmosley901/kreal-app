import requests
import sys
import json
from datetime import datetime

class KingShitAPITester:
    def __init__(self, base_url="https://crown-checkout.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, params=None, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            print(f"Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse JSON response
                try:
                    json_response = response.json()
                    print(f"Response preview: {json.dumps(json_response, indent=2)[:500]}...")
                    return True, json_response
                except:
                    print(f"Response text: {response.text[:200]}...")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        success1, _ = self.run_test(
            "Root Health Check",
            "GET",
            "api/",
            200
        )
        
        # Test health endpoint
        success2, response = self.run_test(
            "Health Check",
            "GET", 
            "api/health",
            200
        )
        
        if success2 and isinstance(response, dict):
            print(f"API Status: {response.get('status', 'unknown')}")
            print(f"TMDB Key Status: {response.get('api_keys', {}).get('tmdb', 'unknown')}")
        
        return success1 and success2

    def test_platforms_endpoint(self):
        """Test platforms endpoint"""
        print("\n" + "="*50)
        print("TESTING PLATFORMS ENDPOINT")
        print("="*50)
        
        success, response = self.run_test(
            "Get Supported Platforms",
            "GET",
            "api/platforms",
            200
        )
        
        if success and isinstance(response, dict):
            platforms = response.get('platforms', {})
            print(f"Number of platforms: {len(platforms)}")
            print(f"Platform names: {list(platforms.keys())}")
        
        return success

    def test_trending_endpoint(self):
        """Test trending movies endpoint"""
        print("\n" + "="*50)
        print("TESTING TRENDING MOVIES ENDPOINT")
        print("="*50)
        
        success, response = self.run_test(
            "Get Trending Movies",
            "GET",
            "api/trending",
            200
        )
        
        if success and isinstance(response, dict):
            results = response.get('results', [])
            print(f"Number of trending movies: {len(results)}")
            if results:
                first_movie = results[0]
                print(f"First movie: {first_movie.get('title', 'Unknown')}")
                print(f"Rating: {first_movie.get('vote_average', 0)}")
                print(f"Platforms: {len(first_movie.get('platforms', []))}")
        
        return success

    def test_search_endpoint(self):
        """Test search functionality"""
        print("\n" + "="*50)
        print("TESTING SEARCH ENDPOINT")
        print("="*50)
        
        # Test search with "matrix" query
        success1, response1 = self.run_test(
            "Search Movies - Matrix",
            "GET",
            "api/search",
            200,
            params={"q": "matrix"}
        )
        
        if success1 and isinstance(response1, dict):
            results = response1.get('results', [])
            print(f"Matrix search results: {len(results)}")
            if results:
                first_result = results[0]
                print(f"First result: {first_result.get('title', 'Unknown')}")
        
        # Test search with "batman" query
        success2, response2 = self.run_test(
            "Search Movies - Batman",
            "GET",
            "api/search",
            200,
            params={"q": "batman"}
        )
        
        # Test search with pagination
        success3, response3 = self.run_test(
            "Search Movies - With Pagination",
            "GET",
            "api/search",
            200,
            params={"q": "action", "page": 1}
        )
        
        # Test search with empty query (should fail)
        success4, _ = self.run_test(
            "Search Movies - Empty Query (Should Fail)",
            "GET",
            "api/search",
            422,  # FastAPI validation error
            params={}
        )
        
        return success1 and success2 and success3 and success4

    def test_cors_headers(self):
        """Test CORS headers"""
        print("\n" + "="*50)
        print("TESTING CORS HEADERS")
        print("="*50)
        
        try:
            response = requests.options(f"{self.base_url}/api/", timeout=10)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print("CORS Headers:")
            for header, value in cors_headers.items():
                print(f"  {header}: {value}")
            
            return True
        except Exception as e:
            print(f"❌ CORS test failed: {e}")
            return False

def main():
    print("🎬 KingShit.fu API Testing Suite")
    print("=" * 60)
    
    tester = KingShitAPITester()
    
    # Run all tests
    health_ok = tester.test_health_endpoints()
    platforms_ok = tester.test_platforms_endpoint()
    trending_ok = tester.test_trending_endpoint()
    search_ok = tester.test_search_endpoint()
    cors_ok = tester.test_cors_headers()
    
    # Print final results
    print("\n" + "="*60)
    print("FINAL TEST RESULTS")
    print("="*60)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"🏥 Health endpoints: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"🎭 Platforms endpoint: {'✅ PASS' if platforms_ok else '❌ FAIL'}")
    print(f"🔥 Trending endpoint: {'✅ PASS' if trending_ok else '❌ FAIL'}")
    print(f"🔍 Search endpoint: {'✅ PASS' if search_ok else '❌ FAIL'}")
    print(f"🌐 CORS headers: {'✅ PASS' if cors_ok else '❌ FAIL'}")
    
    overall_success = all([health_ok, platforms_ok, trending_ok, search_ok, cors_ok])
    print(f"\n🎯 Overall API Status: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
    
    return 0 if overall_success else 1

if __name__ == "__main__":
    sys.exit(main())