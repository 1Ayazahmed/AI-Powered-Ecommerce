from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
import random

app = Flask(__name__)
CORS(app)

# logging.basicConfig(level=logging.INFO)

# # Replace with your actual MongoDB URI
# client = MongoClient("")
# db = client["your-db-name"]
# products_collection = db["products"]

# @app.route("/health", methods=["GET"])
# def health_check():
#     return "Flask AI server running!"

# @app.route("/recommend", methods=["POST"])
# def recommend():
#     data = request.get_json()
#     logging.info("Received data: %s", data)

#     product_id = data.get("productId")

#     if not product_id:
#         logging.error("Missing productId")
#         return jsonify({"error": "Missing productId"}), 400

#     # Sample logic: Recommend similar category products
#     product = products_collection.find_one({"_id": {"$eq": ObjectId(product_id)}})
#     if not product:
#         return jsonify([])

#     recommended = list(
#         products_collection.find(
#             {"category": product.get("category"), "_id": {"$ne": product["_id"]}}
#         ).limit(10)
#     )

#     for prod in recommended:
#         prod["_id"] = str(prod["_id"])

#     return jsonify(recommended)

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5001)



from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient("")
db = client["test"]
products_collection = db["products"]
users_collection = db["users"]
orders_collection = db["orders"]

def get_user_purchase_history(user_id):
    """Get user's purchase history"""
    orders = list(orders_collection.find({"user": ObjectId(user_id)}))
    return orders

def get_user_view_history(user_id):
    """Get user's product view history"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user.get('viewed_products', []) if user else []

def calculate_user_preferences(user_id):
    """Calculate user preferences based on purchase and view history"""
    purchases = get_user_purchase_history(user_id)
    views = get_user_view_history(user_id)
    
    # Combine purchase and view data
    preferences = {}
    for order in purchases:
        for item in order.get('orderItems', []):
            product_id = str(item['product'])
            preferences[product_id] = preferences.get(product_id, 0) + 2  # Purchases weighted more
    
    for view in views:
        product_id = str(view)
        preferences[product_id] = preferences.get(product_id, 0) + 1
    
    return preferences

def serialize_objectids(data):
    """Recursively convert ObjectId instances to strings in a dictionary or list."""
    if isinstance(data, dict):
        return {key: serialize_objectids(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_objectids(element) for element in data]
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        product_id = data.get('productId')
        user_id = data.get('userId')

        if not product_id:
            return jsonify({"error": "Missing productId"}), 400

        # Get all products
        all_products = list(products_collection.find({}))
        if not all_products:
            return jsonify([])

        # Get target product
        target_product = next((p for p in all_products if str(p['_id']) == product_id), None)
        if not target_product:
            return jsonify({"error": "Product not found"}), 404

        # Content-based filtering
        descriptions = [p.get('description', '') for p in all_products]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(descriptions)
        
        target_index = all_products.index(target_product)
        content_similarities = cosine_similarity(tfidf_matrix[target_index], tfidf_matrix).flatten()

        # Collaborative filtering (if user_id provided)
        if user_id:
            user_preferences = calculate_user_preferences(user_id)
            collaborative_scores = np.zeros(len(all_products))
            
            for i, product in enumerate(all_products):
                product_id = str(product['_id'])
                if product_id in user_preferences:
                    collaborative_scores[i] = user_preferences[product_id]

            # Combine content and collaborative scores
            final_scores = 0.7 * content_similarities + 0.3 * collaborative_scores
        else:
            final_scores = content_similarities

        # Get top 6 similar products excluding current product
        similar_indices = final_scores.argsort()[-7:][::-1]
        recommended = []
        for i in similar_indices:
            if i != target_index:
                product = all_products[i].copy()  # Create a copy to avoid modifying the original
                serialized_product = serialize_objectids(product) # Recursively serialize ObjectIds
                recommended.append(serialized_product)

        return jsonify(recommended)

    except Exception as e:
        logging.exception("Recommendation error:")
        return jsonify({"error": str(e)}), 500

def serialize_product(product):
    """Serialize MongoDB document to JSON"""
    product['_id'] = str(product['_id'])
    return product

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "message": "Recommendation service is running"
    }), 200

def get_recommendations(recent_orders):
    """
    Generate personalized product recommendations based on user's order history.
    """
    try:
        print("Starting get_recommendations...")
        # If no order history, return popular products
        if not recent_orders:
            print("No recent orders, getting popular products...")
            popular_products = get_popular_products()
            print(f"Found {len(popular_products)} popular products")
            return popular_products
        
        print(f"Processing {len(recent_orders)} recent orders...")
        # Extract categories and price ranges from recent orders
        categories = set()
        price_ranges = []
        
        for order in recent_orders:
            for item in order.get("orderItems", []):
                product = products_collection.find_one({"_id": ObjectId(item.get("product"))})
                if product:
                    categories.add(product.get("category"))
                    price_ranges.append(product.get("price", 0))
        
        print(f"Found categories: {categories}")
        print(f"Price ranges: {price_ranges}")
        
        # Calculate average price range
        avg_price = sum(price_ranges) / len(price_ranges) if price_ranges else 0
        price_min = avg_price * 0.7
        price_max = avg_price * 1.3
        
        print(f"Price range: {price_min} - {price_max}")
        
        # Get recommendations based on categories and price range
        recommendations = list(products_collection.find({
            "category": {"$in": list(categories)},
            "price": {"$gte": price_min, "$lte": price_max}
        }).limit(8))
        
        print(f"Found {len(recommendations)} recommendations based on categories and price")
        
        # If not enough recommendations, add popular products
        if len(recommendations) < 8:
            print("Not enough recommendations, adding popular products...")
            popular_products = get_popular_products()
            recommendations.extend(popular_products[:8 - len(recommendations)])
            print(f"Total recommendations after adding popular products: {len(recommendations)}")
        
        # Serialize ObjectId to string for each recommendation
        serialized_recommendations = []
        for product in recommendations:
            product['_id'] = str(product['_id'])
            serialized_recommendations.append(product)
        
        print(f"Returning {len(serialized_recommendations)} serialized recommendations")
        return serialized_recommendations
        
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        print("Falling back to popular products...")
        popular_products = get_popular_products()
        print(f"Found {len(popular_products)} fallback popular products")
        return popular_products

def get_popular_products():
    """
    Get popular products based on ratings and number of reviews.
    """
    try:
        products = list(products_collection.find({
            "rating": {"$gte": 4.0},
            "numReviews": {"$gte": 10}
        }).sort("rating", -1).limit(8))
        
        # Serialize ObjectId to string for each product
        serialized_products = []
        for product in products:
            product['_id'] = str(product['_id'])
            serialized_products.append(product)
        
        return serialized_products
    except Exception as e:
        print(f"Error in get_popular_products: {str(e)}")
        # Fallback to random products if there's an error
        fallback_products = list(products_collection.find().limit(8))
        # Serialize fallback products too
        serialized_fallback = []
        for product in fallback_products:
            product['_id'] = str(product['_id'])
            serialized_fallback.append(product)
        return serialized_fallback

def get_similar_products(product_id):
    """
    Get similar products based on a specific product.
    """
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            return get_popular_products()
        
        category = product.get("category")
        price = product.get("price", 0)
        
        return list(products_collection.find({
            "_id": {"$ne": ObjectId(product_id)},
            "category": category,
            "price": {"$gte": price * 0.8, "$lte": price * 1.2}
        }).limit(8))
        
    except Exception as e:
        print(f"Error in get_similar_products: {str(e)}")
        return get_popular_products()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
