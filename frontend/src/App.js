import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Chatbot from './components/Chatbot';
import AIFeatures from './pages/AIFeatures';
import Header from './components/Header.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AppRoutes />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App; 