import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from '../components/main/Main';
import Login from '../components/member/Login';
import Signup from '../components/member/Signup';
import Signup_site from '../components/member/Signup_site';
import Order from '../components/Order/Order';
import Item from '../components/item/Item';
import Mypage from '../components/mypage/Mypage';


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
                <Route path="/mypage" element={<Mypage/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;