from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import traceback
import random
from datetime import datetime, timedelta
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', "mongodb+srv://ayazkk616:Ayaz.%40hmed.%401999@mern-commerce-cluster.ntyxp1b.mongodb.net/?retryWrites=true&w=majority&appName=mern-commerce-cluster"))
    db = client["test"]
    products_collection = db["products"]
    orders_collection = db["orders"]
    users_collection = db["users"]
    print("✅ MongoDB connection successful")
except Exception as e:
    print(f"❌ MongoDB connection error: {str(e)}")
    raise

# Chatbot patterns and responses
PATTERNS = {
    "greeting": r"\b(hi|hello|hey|greetings)\b",
    "farewell": r"\b(bye|goodbye|see you|farewell)\b",
    "thanks": r"\b(thanks|thank you|appreciate it)\b",
    "help": r"\b(help|what can you do|how can you help|assist)\b",
    "order_status": r"\b(order status|track order|where is my order|order tracking)\b",
    "shipping": r"\b(shipping|delivery|how long|when will I get)\b",
    "returns": r"\b(return|refund|exchange|send back)\b",
}

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

def get_chatbot_response(message):
    """Process the user's message and return an appropriate response."""
    message = message.lower()
    
    # Check for time-based greetings
    current_hour = datetime.now().hour
    if re.search(r"\b(hi|hello|hey|greetings)\b", message):
        if 5 <= current_hour < 12:
            return "Good morning! How can I help you today?"
        elif 12 <= current_hour < 17:
            return "Good afternoon! How may I assist you?"
        else:
            return "Good evening! What can I do for you?"
    
    # Check for patterns and return appropriate response
    for intent, pattern in PATTERNS.items():
        if re.search(pattern, message):
            return random.choice(RESPONSES[intent])
    
    return random.choice(RESPONSES["fallback"])

def get_recommendations(recent_orders):
    """Generate personalized product recommendations."""
    try:
        if not recent_orders:
            return get_popular_products()
        
        categories = set()
        price_ranges = []
        
        for order in recent_orders:
            for item in order.get("orderItems", []):
                product = products_collection.find_one({"_id": ObjectId(item.get("product"))})
                if product:
                    categories.add(product.get("category"))
                    price_ranges.append(product.get("price", 0))
        
        avg_price = sum(price_ranges) / len(price_ranges) if price_ranges else 0
        price_min = avg_price * 0.7
        price_max = avg_price * 1.3
        
        recommendations = list(products_collection.find({
            "category": {"$in": list(categories)},
            "price": {"$gte": price_min, "$lte": price_max}
        }).limit(8))
        
        if len(recommendations) < 8:
            popular_products = get_popular_products()
            recommendations.extend(popular_products[:8 - len(recommendations)])
        
        return recommendations
        
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        return get_popular_products()

def get_popular_products():
    """Get popular products based on ratings."""
    try:
        return list(products_collection.find({
            "rating": {"$gte": 4.0},
            "numReviews": {"$gte": 10}
        }).sort("rating", -1).limit(8))
    except Exception as e:
        print(f"Error in get_popular_products: {str(e)}")
        return list(products_collection.find().limit(8))

def get_analytics(time_range):
    """Generate analytics data for the specified time range."""
    try:
        end_date = datetime.now()
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
        else:  # year
            start_date = end_date - timedelta(days=365)
        
        orders = list(orders_collection.find({
            "createdAt": {"$gte": start_date, "$lte": end_date}
        }))
        
        total_sales = sum(order.get("totalPrice", 0) for order in orders)
        
        unique_customers = len(set(order.get("user") for order in orders))
        previous_period_customers = len(set(
            order.get("user") for order in orders_collection.find({
                "createdAt": {
                    "$gte": start_date - (end_date - start_date),
                    "$lt": start_date
                }
            })
        ))
        
        customer_growth = (
            ((unique_customers - previous_period_customers) / previous_period_customers * 100)
            if previous_period_customers > 0 else 0
        )
        
        category_sales = {}
        for order in orders:
            for item in order.get("orderItems", []):
                product = products_collection.find_one({"_id": item.get("product")})
                if product:
                    category = product.get("category")
                    category_sales[category] = category_sales.get(category, 0) + item.get("price", 0)
        
        total_category_sales = sum(category_sales.values())
        popular_categories = [
            {"name": category, "percentage": round((sales / total_category_sales) * 100)}
            for category, sales in sorted(category_sales.items(), key=lambda x: x[1], reverse=True)
        ][:5]
        
        sales_trend = random.uniform(-10, 20)
        
        return {
            "totalSales": total_sales,
            "customerGrowth": round(customer_growth, 2),
            "salesTrend": round(sales_trend, 2),
            "popularCategories": popular_categories
        }
        
    except Exception as e:
        print(f"Error in get_analytics: {str(e)}")
        return {
            "totalSales": 0,
            "customerGrowth": 0,
            "salesTrend": 0,
            "popularCategories": []
        }

# API Routes
@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    try:
        data = request.get_json()
        message = data.get("message")
        
        if not message:
            return jsonify({"error": "No message provided"}), 400

        response = get_chatbot_response(message)
        return jsonify({"response": response})

    except Exception as e:
        print("🔥 ERROR during chatbot response:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/recommendations", methods=["GET"])
def get_product_recommendations():
    try:
        recent_orders = list(orders_collection.find().limit(5))
        recommendations = get_recommendations(recent_orders)
        
        formatted_recommendations = []
        for product in recommendations:
            formatted_recommendations.append({
                "id": str(product["_id"]),
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "image": product["image"],
                "rating": product.get("rating", 4.5),
                "reviews": product.get("numReviews", random.randint(10, 100))
            })

        return jsonify({"recommendations": formatted_recommendations})

    except Exception as e:
        print("🔥 ERROR during recommendations:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics", methods=["GET"])
def get_predictive_analytics():
    try:
        time_range = request.args.get("timeRange", "week")
        analytics_data = get_analytics(time_range)
        
        dates = []
        actual_sales = []
        predicted_sales = []
        
        if time_range == "week":
            days = 7
        elif time_range == "month":
            days = 30
        else:  # year
            days = 365
            
        base_date = datetime.now()
        for i in range(days):
            date = base_date - timedelta(days=days-i-1)
            dates.append(date.strftime("%Y-%m-%d"))
            actual = random.randint(1000, 5000)
            predicted = actual + random.randint(-500, 500)
            actual_sales.append(actual)
            predicted_sales.append(predicted)
            
        sales_data = [
            {"date": date, "actual": actual, "predicted": predicted}
            for date, actual, predicted in zip(dates, actual_sales, predicted_sales)
        ]
        
        response = {
            "predictedSales": sum(predicted_sales),
            "salesTrend": analytics_data["salesTrend"],
            "customerGrowth": analytics_data["customerGrowth"],
            "popularCategories": analytics_data["popularCategories"],
            "salesData": sales_data
        }
        
        return jsonify(response)

    except Exception as e:
        print("🔥 ERROR during analytics:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
