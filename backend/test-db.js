import connectDB from './config/db.js';
import Product from './models/productModel.js';

const testDBConnectionAndQuery = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully!');

    const products = await Product.find({}).limit(5);
    console.log('Fetched products:', products);

    if (products.length === 0) {
      console.log('No products found in the database.');
    }

  } catch (error) {
    console.error('Error connecting to database or fetching products:', error);
  }
};

testDBConnectionAndQuery(); 