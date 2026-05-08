import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from '../components/Main';
import Signup from '../components/Login';
import Signup from '../components/Signup';
import Signup_site from '../components/Signup_site';
import Order from '../components/Order';
import Item from '../components/item/Item';

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/singup" element={<Signup/>} />
                <Route path="/singup_site" element={<Signup_site/>} />
                <Route path="/order/:itemId" element={<Order/>} />
                <Route path="/item" element={<Item/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;