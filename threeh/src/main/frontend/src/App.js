import './App.css';
import{ BrowserRouter, Routes, Route } from 'react-router-dom'
import FindId from './components/FindId';
import Signup from './components/Signup';
import Signup_site from './components/Signup_site';
import ChangePw from './components/ChangePW';
//import Order from './components/Order';

import Login from './components/Login';
import AddDelivery from './components/AddDelivery';
import AdminDashboard from './components/AdminDashboard';
import AddProduct from './components/AddProduct';
import AdminDashboardCopy from './components/AdminDashboardCopy';



function App() {
  return (
    <div className="App">

      <BrowserRouter>
        <Routes>
        {/*  <Route path = "/" element={<Main/>} />*/}
          <Route path = "/singup" element={<Signup/>} />
          <Route path = "/singup_site" element={ <Signup_site/>} />
          {/* <Route path = "/order/:itemId" element={<Order/>} />*/}
          <Route path = "/delivery" element={<AddDelivery/>} />
          <Route path = "/admin" element={<AdminDashboard/>} />
          <Route path = "/admin/pro" element={<AddProduct/>} />
        </Routes>      
      </BrowserRouter> 
      {/* <Login/>
 <Signup_site/>*/}


     

    </div>
  );
}

export default App;
