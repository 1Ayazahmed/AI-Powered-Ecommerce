from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import re
import json
import logging
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb+srv://ayazkk616:Ayaz.%40hmed.%401999@mern-commerce-cluster.ntyxp1b.mongodb.net/?retryWrites=true&w=majority&appName=mern-commerce-cluster")
db = client['fyp']
orders_collection = db['orders']
products_collection = db['products']

# Predefined responses for common queries
RESPONSES = {
    "greeting": [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Welcome! How may I assist you?",
    ],
    "farewell": [
        "Goodbye! Have a great day!",
        "See you later! Take care!",
        "Bye! Come back soon!",
    ],
    "thanks": [
        "You're welcome!",
        "Happy to help!",
        "My pleasure!",
    ],
    "help": [
        "I can help you with:\n- Product information\n- Order status\n- Shipping details\n- Returns and refunds\n- General inquiries",
        "Here's what I can do:\n- Find products\n- Track orders\n- Answer questions about shipping\n- Help with returns\n- Provide general assistance",
    ],
    "order_status": [
        "To check your order status, please provide your order number.",
        "I can help you track your order. Could you share your order number?",
    ],
    "shipping": [
        "We offer standard shipping (3-5 business days) and express shipping (1-2 business days).",
        "Shipping typically takes 3-5 business days. Express shipping is available for faster delivery.",
    ],
    "returns": [
        "You can return items within 30 days of delivery. Please ensure the item is in its original condition.",
        "Returns are accepted within 30 days. The item must be unused and in original packaging.",
    ],
    "fallback": [
        "I'm not sure I understand. Could you please rephrase that?",
        "I didn't quite catch that. Can you try asking in a different way?",
        "I'm still learning. Could you try asking that differently?",
    ]
}

# Patterns for intent recognition
PATTERNS = {
    "greeting": r"\b(hi|hello|hey|greetings)\b",
    "farewell": r"\b(bye|goodbye|see you|farewell)\b",
    "thanks": r"\b(thanks|thank you|appreciate it)\b",
    "help": r"\b(help|what can you do|how can you help|assist)\b",
    "order_status": r"\b(order status|track order|where is my order|order tracking)\b",
    "shipping": r"\b(shipping|delivery|how long|when will I get)\b",
    "returns": r"\b(return|refund|exchange|send back)\b",
}

def get_chatbot_response(message):
    """
    Process the user's message and return an appropriate response.
    """
    # Convert message to lowercase for better matching
    message = message.lower()
    
    # Check for time-based greetings
    current_hour = datetime.now().hour
    if re.search(PATTERNS["greeting"], message):
        if 5 <= current_hour < 12:
            return "Good morning! How can I help you today?"
        elif 12 <= current_hour < 17:
            return "Good afternoon! How may I assist you?"
        else:
            return "Good evening! What can I do for you?"
    
    # Check for other patterns and return appropriate response
    for intent, pattern in PATTERNS.items():
        if intent == "greeting":
            continue
        if re.search(pattern, message):
            return random.choice(RESPONSES[intent])
    
    # If no pattern matches, return a fallback response
    return random.choice(RESPONSES["fallback"])

def detect_intent(message):
    """Detect the intent of the user's message"""
    message = message.lower()
    for intent, pattern in PATTERNS.items():
        if re.search(pattern, message):
            return intent
    return 'default'

def get_order_status(order_id):
    """Get the status of an order"""
    try:
        order = orders_collection.find_one({"_id": ObjectId(order_id)})
        if order:
            return {
                'status': order.get('status', 'Unknown'),
                'tracking_number': order.get('trackingNumber', 'Not available'),
                'estimated_delivery': order.get('estimatedDelivery', 'Not available')
            }
        return None
    except Exception as e:
        logging.error(f"Error getting order status: {str(e)}")
        return None

def get_product_info(product_id):
    """Get information about a product"""
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if product:
            return {
                'name': product.get('name'),
                'description': product.get('description'),
                'price': product.get('price'),
                'in_stock': product.get('countInStock', 0) > 0
            }
        return None
    except Exception as e:
        logging.error(f"Error getting product info: {str(e)}")
        return None

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        user_id = data.get('userId')
        context = data.get('context', {})

        if not message:
            return jsonify({"error": "No message provided"}), 400

        # Detect intent
        intent = detect_intent(message)
        response = get_chatbot_response(message)

        # Handle specific intents
        if intent == 'order_status' and 'order_id' in context:
            order_status = get_order_status(context['order_id'])
            if order_status:
                response = f"Your order status is: {order_status['status']}. "
                if order_status['tracking_number'] != 'Not available':
                    response += f"Tracking number: {order_status['tracking_number']}. "
                if order_status['estimated_delivery'] != 'Not available':
                    response += f"Estimated delivery: {order_status['estimated_delivery']}."

        elif intent == 'product_info' and 'product_id' in context:
            product_info = get_product_info(context['product_id'])
            if product_info:
                response = f"Product: {product_info['name']}\n"
                response += f"Description: {product_info['description']}\n"
                response += f"Price: ${product_info['price']}\n"
                response += f"Stock: {'In stock' if product_info['in_stock'] else 'Out of stock'}"

        return jsonify({
            'response': response,
            'intent': intent,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logging.exception("Chat error:")
        return jsonify({"error": str(e)}), 500

@app.route('/chat/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "message": "Chatbot service is running"
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
