import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from "./context/AppContext";
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
    <AppProvider>
      <App />
    </AppProvider>
    </ThemeProvider>
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);