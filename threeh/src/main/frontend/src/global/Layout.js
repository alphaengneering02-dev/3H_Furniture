import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/main/Header';
import Footer from '../components/main/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Layout(props) {
    return (
        <div>
            {/* <div className='main-header'>
                <Header/>
            </div>*/}
            
          
            <main>
                <Outlet />
            </main>
            
            {/*
            <div className='main-footer-content'>
                <Footer/>
            </div> */}

            <ToastContainer
                position='top-center'
                autoClose={1800}
                hideProgress={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
            />
        </div>
    );
}

export default Layout;