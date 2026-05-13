import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from '../components/main/Main';
import Login from '../components/member/Login';
import Signup from '../components/member/Signup';
import Signup_site from '../components/member/Signup_site';
import FindId from '../components/member/FindId';
import ChangePW from '../components/member/ChangePW';
import Order from '../components/Order/Order';
import Item from '../components/item/Item';
import Mypage from '../components/mypage/Mypage';
import AdminDashboard from '../components/admin/AdminDashboard';
import AddDelivery from '../components/admin/AddDelivery';
import PaymentSuccess from '../components/payment/PaymentSuccess';
import OrderComplete from '../components/Order/OrderComplete';
import ItemDetail from '../components/item/ItemDetail';
import Cart from '../components/mypage/Cart';
import ItemCreate from '../components/item/ItemCreate';
import EditDelivery from '../components/admin/EditDelivery';
import ItemUpdate from '../components/item/ItemUpdate';
import OAuth2Success from '../components/member/OAuth2Success';
import Refund from '../components/mypage/Refund'; 



const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/oauth/success" element={<OAuth2Success/>} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/signup_site" element={<Signup_site/>} />
                <Route path="/findId" element={<FindId/>} />
                <Route path="/ChangePw" element={<ChangePW/>} />
                
                <Route path="/item" element={<Item/>} />
                <Route path="/item/:itemId" element={<ItemDetail/>} />
                <Route path="/item/create" element={<ItemCreate/>} />
                <Route path="/item/update/:itemId" element={<ItemUpdate/>} />

                <Route path="/mypage" element={<Mypage/>} />
                <Route path='/cart' element={<Cart/>}/>
                <Route path="/cart/return" element={<Refund />} />
                
                <Route path="/admin" element={<AdminDashboard/>} />
                <Route path="/admin/delivery" element={<AddDelivery/>} />
                <Route path="/admin/delivery/:deliveryId" element={<EditDelivery/>} />
                
                <Route path="/payment/toss/success" element={<PaymentSuccess/>} />
                <Route path="/order/:itemId" element={<Order/>} />
                <Route path='/order/complete' element={<OrderComplete/>} />
                
            </Routes>
        </BrowserRouter>
    );
};

export default Router;

