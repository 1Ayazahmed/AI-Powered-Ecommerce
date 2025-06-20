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
import requests # Import requests to fetch exchange rates
from recommendation_model import get_recommendations as get_personalized_recommendations_python
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import logging

# Import the actual prediction function
from predictive_analytics import predict_next_purchase

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', "your mongodb url"))
    db = client["test"]
    products_collection = db["products"]
    orders_collection = db["orders"]
    users_collection = db["users"]
    print("✅ MongoDB connection successful")
except Exception as e:
    print(f"❌ MongoDB connection error: {str(e)}")
    raise

# Function to fetch exchange rates
def get_exchange_rate(from_currency, to_currency):
    try:
        # Using the same API as frontend, relative to PKR
        response = requests.get('https://open.er-api.com/v6/latest/PKR')
        data = response.json()
        if data['result'] == 'success' and to_currency in data['rates'] and from_currency in data['rates']:
            # Convert from_currency to PKR, then PKR to to_currency
            # To convert from USD to PKR, we need 1 / rate_for_USD_in_PKR
            if data['rates'].get(from_currency, 0) == 0:
                 print(f"Warning: Exchange rate for {from_currency} is 0.")
                 return None # Cannot divide by zero
            rate_from_pkr = data['rates'][from_currency]
            # Conversion rate from FROM to TO currency is (Rate of TO relative to PKR) / (Rate of FROM relative to PKR)
            # We need FROM=USD, TO=PKR. So Rate is 1 / Rate of USD relative to PKR
            conversion_rate = 1 / rate_from_pkr
            print(f"Fetched exchange rate: 1 {from_currency} = {conversion_rate} {to_currency}")
            return conversion_rate
        else:
            print(f"Error fetching exchange rates or currencies not found: {data}")
            return None
    except Exception as e:
        print(f"Error fetching exchange rates: {e}")
        return None

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
        # Modified to return the first 8 products found
        print("Fetching first 8 products as popular fallback...")
        return list(products_collection.find().limit(8))
    except Exception as e:
        print(f"Error in get_popular_products: {str(e)}")
        # Fallback to an empty list if even this fails
        return []

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
        # This endpoint can remain for default recommendations if needed elsewhere
        # It will now return prices in PKR
        recent_orders = list(orders_collection.find().limit(5)) # Example: maybe use some criteria for default?
        recommendations_usd = get_personalized_recommendations_python([]) # Assuming this returns prices in USD
        
        # Convert prices from USD to PKR
        usd_to_pkr_rate = get_exchange_rate('USD', 'PKR')
        
        formatted_recommendations = []
        for product in recommendations_usd:
            # Ensure product has an _id and price before attempting to convert
            if "_id" in product and "price" in product and usd_to_pkr_rate is not None:
                price_pkr = product['price'] * usd_to_pkr_rate
                formatted_recommendations.append({
                    "id": str(product["_id"]),
                    "name": product["name"],
                    "description": product["description"],
                    "price": round(price_pkr, 2), # Round to 2 decimal places
                    "image": product["image"],
                    "rating": product.get("rating", 4.5),
                    "reviews": product.get("numReviews", random.randint(10, 100)),
                    "currency": 'PKR' # Indicate currency is now PKR
                })
            elif "_id" in product:
                 # If conversion fails, still include product but log warning
                 print(f"Warning: Could not convert price for product {product.get('name', '')}. Returning original price in USD.")
                 formatted_recommendations.append({
                    "id": str(product["_id"]),
                    "name": product["name"],
                    "description": product["description"],
                    "price": product.get('price', 0), # Return original price
                    "image": product["image"],
                    "rating": product.get("rating", 4.5),
                    "reviews": product.get("numReviews", random.randint(10, 100)),
                    "currency": 'USD' # Indicate original currency
                 })
            else:
                 print("Skipping product without _id:", product);


        print('Returning recommendations from /api/recommendations (likely default) in PKR:', len(formatted_recommendations));
        return jsonify({ "recommendations": formatted_recommendations });

    except Exception as e:
        print("🔥 ERROR during default recommendations:")
        traceback.print_exc()
        # Fallback to simpler default on error, returning prices in USD if conversion fails
        try:
            simple_default = list(products_collection.find().limit(8))
            formatted_default = []
            for product in simple_default:
                 if "_id" in product:
                    formatted_default.append({
                        "id": str(product["_id"]),
                        "name": product["name"],
                        "description": product["description"],
                        "price": product.get('price', 0), # Assume original is USD
                        "image": product["image"],
                        "rating": product.get("rating", 4.0),
                        "reviews": product.get("numReviews", 5),
                        "currency": 'USD' # Indicate original currency is USD
                    })
                 else:
                    print("Skipping fallback product without _id:", product);

            return jsonify({ "error": str(e), "recommendations": formatted_default }), 500
        except Exception as e:
            print("🔥 ERROR during simple default fallback:", e)
            return jsonify({ "error": "Failed to fetch recommendations" }), 500

# New endpoint for personalized recommendations called by Node.js backend
@app.route("/get-personalized-recommendations", methods=["POST"])
def get_personalized_recommendations_endpoint():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        order_history = data.get("orderHistory")

        # Get exchange rate for USD to PKR
        usd_to_pkr_rate = get_exchange_rate('USD', 'PKR')

        if not user_id or not order_history:
            print("Missing userId or orderHistory for personalized recommendations. Falling back to popular products.")
            # Fallback to getting popular products if user data is missing
            # These popular products are assumed to have prices in USD from the database
            popular_products_usd = get_popular_products() # Use the imported function with empty data
            print(f"Number of popular products returned by get_popular_products: {len(popular_products_usd)}")

            formatted_recommendations = []
            for product in popular_products_usd:
                 # Ensure product has an _id before processing
                if "_id" in product:
                    # Convert prices from USD to PKR if rate is available
                    if "price" in product and usd_to_pkr_rate is not None:
                        price_pkr = product['price'] * usd_to_pkr_rate
                        formatted_recommendations.append({
                            "id": str(product["_id"]),
                            "name": product["name"],
                            "description": product["description"],
                            "price": round(price_pkr, 2), # Round to 2 decimal places
                            "image": product["image"],
                            "rating": product.get("rating", 4.0),
                            "reviews": product.get("numReviews", 5),
                            "currency": 'PKR' # Indicate currency is now PKR
                        })
                    # If conversion fails but _id exists, return original price
                    elif "price" in product:
                         print(f"Warning: Could not convert price for fallback product {product.get('name', '')}. Returning original price in USD.")
                         formatted_recommendations.append({
                            "id": str(product["_id"]),
                            "name": product["name"],
                            "description": product["description"],
                            "price": product.get('price', 0), # Return original price
                            "image": product["image"],
                            "rating": product.get("rating", 4.0),
                            "reviews": product.get("numReviews", 5),
                            "currency": 'USD' # Indicate original currency
                        })
                    else:
                         print("Skipping fallback product without price but with _id:", product);
                else:
                    print("Skipping fallback product without _id:", product);

            print(f"Number of formatted recommendations after fallback: {len(formatted_recommendations)}")
            print('Returning popular products from /get-personalized-recommendations (due to missing user data) in PKR (if converted):', len(formatted_recommendations))
            return jsonify({ "recommendations": formatted_recommendations });


        print(f"Received personalized recommendations request for user: {user_id}");
        # Assuming orderHistory is already processed by Node.js backend
        recommendations_usd = get_personalized_recommendations_python(order_history) # Call the imported function (assuming it returns USD)
        print(f"Number of personalized recommendations returned by get_personalized_recommendations_python: {len(recommendations_usd)}")

        formatted_recommendations = []
        for product in recommendations_usd:
            # Ensure product has an _id before processing
            if "_id" in product:
                # Attempt to convert price if rate is available
                if "price" in product and usd_to_pkr_rate is not None:
                    price_pkr = product['price'] * usd_to_pkr_rate
                    formatted_recommendations.append({
                        "id": str(product["_id"]),
                        "name": product["name"],
                        "description": product["description"],
                        "price": round(price_pkr, 2), # Round to 2 decimal places
                        "image": product["image"],
                        "rating": product.get("rating", 4.5),
                        "reviews": product.get("numReviews", random.randint(10, 100)),
                        "currency": 'PKR' # Indicate currency is now PKR
                    })
                # If conversion fails but _id exists, return original price
                elif "price" in product:
                    print(f"Warning: Could not convert price for product {product.get('name', '')}. Returning original price in USD.")
                    formatted_recommendations.append({
                        "id": str(product["_id"]),
                        "name": product["name"],
                        "description": product["description"],
                        "price": product.get('price', 0), # Return original price
                        "image": product["image"],
                        "rating": product.get("rating", 4.5),
                        "reviews": product.get("numReviews", random.randint(10, 100)),
                        "currency": 'USD' # Indicate original currency
                    })
                else:
                    print("Skipping product without price but with _id:", product);
            else:
                print("Skipping product without _id:", product);

        print(f"Number of formatted personalized recommendations: {len(formatted_recommendations)}")
        print('Returning personalized recommendations in PKR (if converted):', len(formatted_recommendations))
        return jsonify({ "recommendations": formatted_recommendations });

    except Exception as e:
        print("🔥 ERROR during personalized recommendations:")
        traceback.print_exc()
        # Fallback to returning popular products on error
        try:
            popular_products_usd = get_popular_products() # Use the imported function for fallback (assuming it returns USD)

            formatted_recommendations = []
            for product in popular_products_usd:
                # Ensure product has an _id before processing
                if "_id" in product:
                    # Convert prices from USD to PKR if rate is available
                    if "price" in product and usd_to_pkr_rate is not None:
                        price_pkr = product['price'] * usd_to_pkr_rate
                        formatted_recommendations.append({
                            "id": str(product["_id"]),
                            "name": product["name"],
                            "description": product["description"],
                            "price": round(price_pkr, 2), # Round to 2 decimal places
                            "image": product["image"],
                            "rating": product.get("rating", 4.0),
                            "reviews": product.get("numReviews", 5),
                            "currency": 'PKR' # Indicate currency is now PKR
                        })
                    # If conversion fails but _id exists, return original price
                    elif "price" in product:
                        print(f"Warning: Could not convert price for fallback product {product.get('name', '')}. Returning original price in USD.")
                        formatted_recommendations.append({
                            "id": str(product["_id"]),
                            "name": product["name"],
                            "description": product["description"],
                            "price": product.get('price', 0), # Return original price
                            "image": product["image"],
                            "rating": product.get("rating", 4.0),
                            "reviews": product.get("reviews", 5),
                            "currency": 'USD' # Indicate original currency
                        })
                    else:
                         print("Skipping fallback product without price but with _id:", product);
                else:
                    print("Skipping fallback product without _id:", product);

            return jsonify({ "error": str(e), "recommendations": formatted_recommendations }), 500
        except Exception as e:
            print("🔥 ERROR during personalized recommendations fallback:", e)
            return jsonify({ "error": "Failed to fetch personalized recommendations" }), 500

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

@app.route("/api/users", methods=["GET"])
def list_users():
    try:
        users = list(users_collection.find())
        for user in users:
            user['id'] = str(user['_id'])
            del user['_id']
        print("Returning users from /api/users:", users)
        return jsonify(users)
    except Exception as e:
        print("🔥 ERROR during listing users:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/debug-users", methods=["GET"])
def debug_users():
    try:
        users = list(users_collection.find().limit(5))
        # Convert ObjectId to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
        print("Debug users endpoint hit. Returning:", users)
        return jsonify(users)
    except Exception as e:
        print("🔥 ERROR during debug user listing:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Predictive Analytics Endpoint
@app.route("/predict", methods=["POST", "OPTIONS"])
def predict_next_purchase_endpoint():
    if request.method == 'OPTIONS':
        # Respond to CORS preflight request
        return '', 200

    # Only attempt to get JSON data for POST requests
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get("userId")

            if not user_id:
                return jsonify({"error": "User ID not provided"}), 400

            # Call the actual prediction function
            prediction_result = predict_next_purchase(user_id)

            if not prediction_result:
                 return jsonify({"error": "Could not generate prediction, insufficient data"}), 400

            print("Returning prediction data:", prediction_result)
            return jsonify(prediction_result)

        except Exception as e:
            print("🔥 ERROR during prediction POST request processing:")
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500

    # If not OPTIONS or POST, return Method Not Allowed
    return jsonify({"error": "Method not allowed"}), 405

if __name__ == '__main__':
    app.run(debug=True, port=5004)
