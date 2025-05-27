import requests
import json
from datetime import datetime

# Test configuration
BASE_URLS = {
    'recommendation': 'http://localhost:5001',
    'predictive': 'http://localhost:5002',
    'chatbot': 'http://localhost:5003'
}

def test_recommendation_service():
    print("\n=== Testing Recommendation Service ===")
    try:
        # Test health endpoint
        response = requests.get(f"{BASE_URLS['recommendation']}/health")
        print(f"Health check: {response.json()}")

        # Test recommendation endpoint
        test_data = {
            "productId": "683087554dc1911b667540a8",  # Replace with a real product ID
            "userId": "67e8f4203e5db7d4e84567a7"      # Replace with a real user ID
        }
        response = requests.post(
            f"{BASE_URLS['recommendation']}/recommend",
            json=test_data
        )
        print(f"Recommendation response: {response.json()}")
    except Exception as e:
        print(f"Error testing recommendation service: {str(e)}")

def test_predictive_analytics():
    print("\n=== Testing Predictive Analytics Service ===")
    try:
        # Test prediction endpoint
        test_data = {
            "userId": "65f0a1234567890123456789"  # Replace with a real user ID
        }
        response = requests.post(
            f"{BASE_URLS['predictive']}/predict",
            json=test_data
        )
        print(f"Prediction response: {response.json()}")

        # Test seller analytics
        seller_id = "65f0a1234567890123456789"  # Replace with a real seller ID
        response = requests.get(f"{BASE_URLS['predictive']}/analytics/seller/{seller_id}")
        print(f"Seller analytics response: {response.json()}")
    except Exception as e:
        print(f"Error testing predictive analytics: {str(e)}")

def test_chatbot():
    print("\n=== Testing Chatbot Service ===")
    try:
        # Test health endpoint
        response = requests.get(f"{BASE_URLS['chatbot']}/chat/health")
        print(f"Health check: {response.json()}")

        # Test chat endpoint with different intents
        test_messages = [
            {
                "message": "Where is my order?",
                "userId": "65f0a1234567890123456789",
                "context": {"order_id": "65f0a1234567890123456789"}
            },
            {
                "message": "Tell me about this product",
                "userId": "65f0a1234567890123456789",
                "context": {"product_id": "65f0a1234567890123456789"}
            },
            {
                "message": "What's your return policy?",
                "userId": "65f0a1234567890123456789"
            }
        ]

        for test_data in test_messages:
            response = requests.post(
                f"{BASE_URLS['chatbot']}/chat",
                json=test_data
            )
            print(f"\nChat response for '{test_data['message']}':")
            print(response.json())
    except Exception as e:
        print(f"Error testing chatbot: {str(e)}")

if __name__ == "__main__":
    print("Starting AI Services Test Suite...")
    print(f"Test started at: {datetime.now()}")
    
    # Test each service
    test_recommendation_service()
    test_predictive_analytics()
    test_chatbot()
    
    print(f"\nTest completed at: {datetime.now()}") 