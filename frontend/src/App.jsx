import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import EditorPage from './EditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="pricing" element={<PricingPage />} />
      </Route>
      {/* Editor Page is outside layout to retain its full-screen interactive vibe */}
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
