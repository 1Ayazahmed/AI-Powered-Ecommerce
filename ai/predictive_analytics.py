from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from datetime import datetime, timedelta
import logging
import random

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb+srv://ayazkk616:Ayaz.%40hmed.%401999@mern-commerce-cluster.ntyxp1b.mongodb.net/?retryWrites=true&w=majority&appName=mern-commerce-cluster")
db = client['fyp']
orders_collection = db['orders']
users_collection = db['users']
products_collection = db['products']

def get_user_features(user_id):
    """Extract features for user behavior analysis"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None

    # Get user's order history
    orders = list(orders_collection.find({"user": ObjectId(user_id)}))
    
    features = {
        'total_orders': len(orders),
        'total_spent': sum(order.get('totalPrice', 0) for order in orders),
        'avg_order_value': sum(order.get('totalPrice', 0) for order in orders) / len(orders) if orders else 0,
        'days_since_last_order': (datetime.now() - orders[-1]['createdAt']).days if orders else 365,
        'unique_categories': len(set(item.get('category') for order in orders for item in order.get('orderItems', []))),
        'preferred_payment_method': max(set(order.get('paymentMethod') for order in orders), key=lambda x: list(order.get('paymentMethod') for order in orders).count(x)) if orders else None
    }
    
    return features

def predict_next_purchase(user_id):
    """Predict next purchase category and timing"""
    features = get_user_features(user_id)
    if not features:
        return None

    # Get historical purchase patterns
    orders = list(orders_collection.find({"user": ObjectId(user_id)}))
    if not orders:
        return None

    # Calculate purchase frequency
    order_dates = [order['createdAt'] for order in orders]
    order_dates.sort()
    time_diffs = [(order_dates[i] - order_dates[i-1]).days for i in range(1, len(order_dates))]
    avg_purchase_frequency = sum(time_diffs) / len(time_diffs) if time_diffs else 30

    # Predict next purchase date
    last_order_date = order_dates[-1]
    predicted_next_purchase = last_order_date + timedelta(days=avg_purchase_frequency)

    # Predict category
    category_counts = {}
    for order in orders:
        for item in order.get('orderItems', []):
            category = item.get('category')
            if category:
                category_counts[category] = category_counts.get(category, 0) + 1

    predicted_category = max(category_counts.items(), key=lambda x: x[1])[0] if category_counts else None

    return {
        'predicted_next_purchase_date': predicted_next_purchase.isoformat(),
        'predicted_category': predicted_category,
        'confidence_score': 0.8 if len(orders) > 5 else 0.6
    }

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        user_id = data.get('userId')

        if not user_id:
            return jsonify({"error": "Missing userId"}), 400

        prediction = predict_next_purchase(user_id)
        if not prediction:
            return jsonify({"error": "Insufficient data for prediction"}), 400

        return jsonify(prediction)

    except Exception as e:
        logging.exception("Prediction error:")
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/seller/<seller_id>', methods=['GET'])
def seller_analytics(seller_id):
    """Get analytics for a seller"""
    try:
        # Get seller's products
        products = list(products_collection.find({"seller": ObjectId(seller_id)}))
        if not products:
            return jsonify({"error": "No products found for seller"}), 404

        # Get orders containing seller's products
        product_ids = [p['_id'] for p in products]
        orders = list(orders_collection.find({
            "orderItems.product": {"$in": product_ids}
        }))

        # Calculate metrics
        total_sales = sum(order['totalPrice'] for order in orders)
        total_orders = len(orders)
        avg_order_value = total_sales / total_orders if total_orders > 0 else 0

        # Product performance
        product_performance = {}
        for product in products:
            product_orders = [order for order in orders if any(
                item['product'] == product['_id'] for item in order.get('orderItems', [])
            )]
            product_performance[str(product['_id'])] = {
                'name': product['name'],
                'total_sales': sum(order['totalPrice'] for order in product_orders),
                'order_count': len(product_orders)
            }

        return jsonify({
            'total_sales': total_sales,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value,
            'product_performance': product_performance
        })

    except Exception as e:
        logging.exception("Seller analytics error:")
        return jsonify({"error": str(e)}), 500

def get_analytics(time_range):
    """
    Generate analytics data for the specified time range.
    """
    try:
        # Calculate date range
        end_date = datetime.now()
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
        else:  # year
            start_date = end_date - timedelta(days=365)
        
        # Get orders within date range
        orders = list(orders_collection.find({
            "createdAt": {"$gte": start_date, "$lte": end_date}
        }))
        
        # Calculate total sales
        total_sales = sum(order.get("totalPrice", 0) for order in orders)
        
        # Calculate customer growth
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
        
        # Get popular categories
        category_sales = {}
        for order in orders:
            for item in order.get("orderItems", []):
                product = products_collection.find_one({"_id": item.get("product")})
                if product:
                    category = product.get("category")
                    category_sales[category] = category_sales.get(category, 0) + item.get("price", 0)
        
        # Calculate category percentages
        total_category_sales = sum(category_sales.values())
        popular_categories = [
            {"name": category, "percentage": round((sales / total_category_sales) * 100)}
            for category, sales in sorted(category_sales.items(), key=lambda x: x[1], reverse=True)
        ][:5]
        
        # Generate sales trend
        sales_trend = random.uniform(-10, 20)  # Simulated trend between -10% and 20%
        
        return {
            "totalSales": total_sales,
            "customerGrowth": round(customer_growth, 2),
            "salesTrend": round(sales_trend, 2),
            "popularCategories": popular_categories
        }
        
    except Exception as e:
        print(f"Error in get_analytics: {str(e)}")
        # Return default values if there's an error
        return {
            "totalSales": 0,
            "customerGrowth": 0,
            "salesTrend": 0,
            "popularCategories": []
        }

def get_sales_forecast(time_range):
    """
    Generate sales forecast for the specified time range.
    """
    try:
        # Get historical sales data
        end_date = datetime.now()
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
            forecast_days = 7
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
            forecast_days = 30
        else:  # year
            start_date = end_date - timedelta(days=365)
            forecast_days = 365
        
        # Get historical sales
        historical_sales = list(orders_collection.find({
            "createdAt": {"$gte": start_date, "$lte": end_date}
        }))
        
        # Calculate average daily sales
        daily_sales = {}
        for order in historical_sales:
            date = order["createdAt"].date()
            daily_sales[date] = daily_sales.get(date, 0) + order.get("totalPrice", 0)
        
        avg_daily_sales = sum(daily_sales.values()) / len(daily_sales) if daily_sales else 0
        
        # Generate forecast
        forecast = []
        for i in range(forecast_days):
            date = end_date + timedelta(days=i+1)
            # Add some randomness to the forecast
            forecast_sales = avg_daily_sales * (1 + random.uniform(-0.1, 0.1))
            forecast.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted": round(forecast_sales, 2)
            })
        
        return forecast
        
    except Exception as e:
        print(f"Error in get_sales_forecast: {str(e)}")
        return []

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
