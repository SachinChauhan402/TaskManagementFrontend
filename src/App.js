import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Analytics from './pages/Analytics';

const App = () => (
  <Router>
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  </Router>
);

export default App;
