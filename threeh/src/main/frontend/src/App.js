import './App.css';
import{ BrowserRouter, Routes, Route } from 'react-router-dom'
import FindId from './components/FindId';
import Signup from './components/Signup';
import Signup_site from './components/Signup_site';
import ChangePw from './components/ChangePW';
import Order from './components/Order';
import Main from './components/main';

function App() {
  return (
    <div className="App">
      <p>Test</p>

      <BrowserRouter>
        <Routes>
          <Route path = "/" element={<Main/>} />
          <Route path = "/order/:itemId" element={<Order/>} />
          <Route path = "/singup" element={<Signup/>} />
          <Route path = "/singup_site" element={ <Signup_site/>} />
        </Routes>      
      </BrowserRouter>

     

    </div>
  );
}

export default App;
