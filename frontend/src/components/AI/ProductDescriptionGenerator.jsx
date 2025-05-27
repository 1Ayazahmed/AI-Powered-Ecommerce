import React, { useState } from 'react';
import axios from 'axios';
import { Button, Card, Input, message, Spin, Typography } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ProductDescriptionGenerator = ({ product, onDescriptionUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState(product?.description || '');

  const generateDescription = async () => {
    try {
      setLoading(true);
      console.log('Sending product ID:', product._id);
      const response = await axios.post('http://localhost:5002/generate-description', {
        productId: product._id
      });

      console.log('Response from backend:', response.data);
      if (response.data.success) {
        setGeneratedDescription(response.data.new_description);
        message.success('Description generated successfully!');
      } else {
        // Log the backend error response for debugging
        console.error('Backend error response:', response.data);
        message.error('Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      message.error('Error generating description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Update the product description in your main database
      await axios.put(`/api/products/${product._id}/details`, {
        description: generatedDescription
      });

      if (onDescriptionUpdate) {
        onDescriptionUpdate(generatedDescription);
      }
      message.success('Description updated successfully!');
    } catch (error) {
      console.error('Error saving description:', error);
      message.error('Error saving description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 bg-gray-800 text-white border-gray-700">
      <Title level={4} className="text-white">AI Product Description Generator</Title>
      
      <div className="mb-4">
        <Text strong className="text-white">Original Description:</Text>
        <TextArea
          value={originalDescription}
          disabled
          rows={4}
          className="mt-2 bg-gray-700 text-gray-300 border-gray-600"
        />
      </div>

      <Button
        type="primary"
        icon={<SyncOutlined spin={loading} />}
        onClick={generateDescription}
        loading={loading}
        className="mb-4 bg-blue-600 hover:bg-blue-700"
      >
        Generate AI Description
      </Button>

      {generatedDescription && (
        <div className="mb-4">
          <Text strong className="text-white">Generated Description:</Text>
          <TextArea
            value={generatedDescription}
            onChange={(e) => setGeneratedDescription(e.target.value)}
            rows={6}
            className="mt-2 bg-gray-700 text-gray-300 border-gray-600"
          />
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            Save New Description
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProductDescriptionGenerator; 