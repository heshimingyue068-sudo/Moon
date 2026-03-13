/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Brands } from './pages/Brands';
import { BrandDetails } from './pages/BrandDetails';
import { SOPs } from './pages/SOPs';
import { Chatbot } from './pages/Chatbot';
import { ImageGenerator } from './pages/ImageGenerator';
import { OperatorWorkspace } from './pages/OperatorWorkspace';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="brands" element={<Brands />} />
            <Route path="brands/:id" element={<BrandDetails />} />
            <Route path="workspace" element={<OperatorWorkspace />} />
            <Route path="sops" element={<SOPs />} />
            <Route path="chat" element={<Chatbot />} />
            <Route path="image-gen" element={<ImageGenerator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
