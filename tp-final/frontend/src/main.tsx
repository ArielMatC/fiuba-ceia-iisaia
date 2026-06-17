import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import UploadPage from './pages/UploadPage.tsx'
import WelcomePage from './pages/WelcomePage.tsx'
import WellsPage from './pages/WellsPage.tsx'
import WellDetailPage from './pages/WellDetailPage.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <WelcomePage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'wells', element: <WellsPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'wells/:wellId', element: <WellDetailPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
