import { BrowserRouter, Routes, Route } from 'react-router-dom';

//유소은
import Main from '../components/main/Main';
import Login from '../components/member/Login';
import Signup from '../components/member/Signup';
import Signup_site from '../components/member/Signup_site';
import FindId from '../components/member/FindId';
import ChangePW from '../components/member/ChangePW';
import OAuth2Success from '../components/member/OAuth2Success';
import SearchResult from '../components/member/SearchResult';

//오현옥
import Item from '../components/item/Item';
import ItemDetail from '../components/item/ItemDetail';
import ItemCreate from '../components/item/ItemCreate';
import ItemUpdate from '../components/item/ItemUpdate';

//김승우
import Order from '../components/Order/Order';
import PaymentSuccess from '../components/payment/PaymentSuccess';

//김태양
import AdminDashboard from '../components/admin/AdminDashboard';
import AddDelivery from '../components/admin/AddDelivery';
import EditDelivery from '../components/admin/EditDelivery';
import Refund from '../components/mypage/Refund'; 
import MemberAddressUpdate from '../components/mypage/MemberAddressUpdate';
import DriverPage from '../components/admin/DriverPage';

//김인호
import Mypage from '../components/mypage/Mypage';
import Cart from '../components/mypage/Cart';



const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main/>} />
                <Route path="/searchResult/:searchKey/:searchValue" element={<SearchResult/>} />
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
                <Route path="/member/update/:id" element={<MemberAddressUpdate />} />

                
                <Route path="/admin" element={<AdminDashboard/>} />
                <Route path="/admin/delivery" element={<AddDelivery/>} />
                <Route path="/admin/delivery/:deliveryId" element={<EditDelivery/>} />
                <Route path="/admin/driver" element={<DriverPage/>} />
                
                <Route path="/payment/toss/success" element={<PaymentSuccess/>} />
                <Route path="/order/:itemId" element={<Order/>} />
             
                
            </Routes>
        </BrowserRouter>
    );
};

export default Router;

