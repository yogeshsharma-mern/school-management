import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import './index.css'
import App from './App.jsx'
import Loader from './components/Loading.jsx';


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <BrowserRouter>
    <Suspense fallback={<Loader/>}>
      <App />
      </Suspense>
    </BrowserRouter>
  </Provider>
  // </StrictMode>,
)
