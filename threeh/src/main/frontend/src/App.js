import './App.css';
import{ BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './components/Signup';
import Signup_site from './components/Signup_site';
import Order from './components/Order';
import Main from './components/Main';
import Login from './components/Login';
import Item from './components/item/Item';



function App() {
  return (
    <div className="App">

      <BrowserRouter>
        <Routes>
          <Route path = "/" element={<Main/>} />
          <Route path = "/singup" element={<Signup/>} />
          <Route path = "/singup_site" element={ <Signup_site/>} />
          <Route path = "/order/:itemId" element={<Order/>} />
          <Route path="/item" element={<Item/>}/>
        </Routes>      
      </BrowserRouter>


      <Login/>
      <Signup_site/>
      <Item/>
     

    </div>
  );
}

export default App;
