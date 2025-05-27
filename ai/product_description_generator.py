from flask import Flask, request, jsonify
from flask_cors import CORS
# import openai # Removing OpenAI import
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
from bson.objectid import ObjectId
import requests # Import requests library

# Load environment variables
load_dotenv()

# Configure OpenAI - This section is no longer needed for Gemini
# openai.api_key = os.getenv('OPENAI_API_KEY')

# Use the provided Gemini API Key
GEMINI_API_KEY = "AIzaSyDYkETyTMPXDT2-tM4jgGAZsbUXw41-MV0"

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['test']
products_collection = db['products']

def generate_product_description(product_data):
    """
    Generate an AI-enhanced product description using Google Gemini API
    """
    try:
        # Create a prompt for the AI
        prompt_text = f"""
Create a compelling product description for the following product:
Name: {product_data.get('name', '')}
Category: {product_data.get('category', '')}
Current Description: {product_data.get('description', '')}
Price: ${product_data.get('price', 0)}

Generate a new description that:
1. Is engaging and persuasive
2. Highlights key features and benefits
3. Uses SEO-friendly keywords
4. Is between 100-150 words
5. Maintains a professional tone
"""

        # Gemini API Endpoint
        gemini_api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

        # Request payload for Gemini API
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt_text
                        }
                    ]
                }
            ]
        }

        # Call Gemini API using requests
        response = requests.post(gemini_api_url, json=payload)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

        # Extract the generated description from the response
        response_data = response.json()
        # Assuming the response structure is like the documentation
        new_description = response_data['candidates'][0]['content']['parts'][0]['text']

        return new_description

    except requests.exceptions.RequestException as req_err:
        logger.error(f"Error calling Gemini API: {req_err}")
        return None
    except KeyError as key_err:
        logger.error(f"Error parsing Gemini API response (missing key): {key_err}")
        logger.error(f"Full response: {response_data}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        return None

@app.route('/generate-description', methods=['POST'])
def generate_description():
    """
    API endpoint to generate AI-enhanced product descriptions
    """
    try:
        data = request.get_json()
        product_id = data.get('productId')
        logger.info(f"Received request data: {data}")

        if not product_id:
            return jsonify({"error": "Product ID is required"}), 400

        # Get product data from MongoDB
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        logger.info(f"Retrieved product data: {product}")
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Generate new description
        new_description = generate_product_description(product)
        if not new_description:
            return jsonify({"error": "Failed to generate description"}), 500

        # Update product in database
        products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"ai_enhanced_description": new_description}}
        )

        return jsonify({
            "success": True,
            "product_id": str(product_id),
            "new_description": new_description
        })

    except Exception as e:
        logger.error(f"Error in generate_description endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/batch-generate-descriptions', methods=['POST'])
def batch_generate_descriptions():
    """
    API endpoint to generate AI-enhanced descriptions for multiple products
    """
    try:
        data = request.get_json()
        product_ids = data.get('productIds', [])

        if not product_ids:
            return jsonify({"error": "Product IDs are required"}), 400

        results = []
        for product_id in product_ids:
            # Ensure product_id is an ObjectId for MongoDB query
            try:
                product_obj_id = ObjectId(product_id)
            except Exception:
                results.append({
                    "product_id": str(product_id),
                    "success": False,
                    "error": "Invalid Product ID format"
                })
                continue

            product = products_collection.find_one({"_id": product_obj_id})
            if product:
                new_description = generate_product_description(product)
                if new_description:
                    products_collection.update_one(
                        {"_id": product_obj_id},
                        {"$set": {"ai_enhanced_description": new_description}}
                    )
                    results.append({
                        "product_id": str(product_id),
                        "success": True,
                        "new_description": new_description
                    })
                else:
                    results.append({
                        "product_id": str(product_id),
                        "success": False,
                        "error": "Failed to generate description using AI"
                    })
            else:
                 results.append({
                    "product_id": str(product_id),
                    "success": False,
                    "error": "Product not found in database"
                })

        return jsonify({
            "success": True,
            "results": results
        })

    except Exception as e:
        logger.error(f"Error in batch_generate_descriptions endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "service": "AI Product Description Generator"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
