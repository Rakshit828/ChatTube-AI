import { createRoot } from 'react-dom/client'
import './index.css'
import {store} from "./app/store.js"
import App from './App.jsx'
import { Provider } from 'react-redux'

console.log("accessToken", localStorage.getItem("accessToken"))
console.log("refreshToken", localStorage.getItem("refreshToken"))

// localStorage.setItem("accessToken", "")
// localStorage.setItem("refreshToken", "")

// console.log("accessToken", localStorage.getItem("accessToken"))
// console.log("refreshToken", localStorage.getItem("refreshToken"))


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
