import requests
import json

def test_recommendation():
    url = "http://localhost:5001/recommend"
    payload = {
        "productId": "1",
        "products": [
            {"id": "1", "name": "Red Shirt", "category": "clothing", "description": "A bright red cotton shirt"},
            {"id": "2", "name": "Blue Jeans", "category": "clothing", "description": "Comfortable blue jeans"},
            {"id": "3", "name": "Laptop", "category": "electronics", "description": "Gaming laptop with RTX 3060"},
            {"id": "4", "name": "Headphones", "category": "electronics", "description": "Noise-cancelling headphones"}
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        print("Status Code:", response.status_code)
        print("Response:", json.dumps(response.json(), indent=2))
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the Flask server is running on port 5001")

if __name__ == "__main__":
    test_recommendation() 