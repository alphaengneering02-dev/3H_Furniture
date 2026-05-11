import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from '../components/main/Main';
import Login from '../components/member/Login';
import Signup from '../components/member/Signup';
import Signup_site from '../components/member/Signup_site';
import Order from '../components/Order/Order';
import Item from '../components/item/Item';
import Mypage from '../components/mypage/Mypage';
import AdminDashboard from '../components/admin/AdminDashboard';
import AddProduct from '../components/admin/AddProduct';
import AddDelivery from '../components/admin/AddDelivery';
import PaymentSuccess from '../components/payment/PaymentSuccess';
import OrderComplete from '../components/Order/OrderComplete';
import ItemDetail from '../components/item/ItemDetail';


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
                <Route path="/item/:itemId" element={<ItemDetail/>} />
                <Route path="/mypage" element={<Mypage/>} />
                <Route path="/admin" element={<AdminDashboard/>} />
                <Route path="/admin/AP" element={<AddProduct/>} />
                <Route path="/admin/AD" element={<AddDelivery/>} />
                <Route path="/payment/toss/success" element={<PaymentSuccess/>} />
                <Route path='/order/complete' element={<OrderComplete/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;