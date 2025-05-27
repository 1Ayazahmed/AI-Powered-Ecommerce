from flask import request, jsonify
from bson import ObjectId
from pymongo import MongoClient

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    product_id = data.get("productId")

    print("📥 Received productId:", product_id)

    try:
        obj_id = ObjectId(product_id)
    except Exception as e:
        print("❌ Invalid ObjectId:", e)
        return jsonify([])

    # Just return 5 random products for now to test
    products = list(db.products.find().limit(5))
    print("✅ Returning dummy products:", products)
    return dumps(products)
