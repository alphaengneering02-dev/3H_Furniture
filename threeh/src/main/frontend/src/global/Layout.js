import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/main/Header';
import Footer from '../components/main/Footer';

function Layout(props) {
    return (
        <div>
            <div className='main-header'>
                <Header/>
            </div>
            
          
            <main>
                <Outlet />
            </main>
            
            <div className='main-footer-content'>
                <Footer/>
            </div>
        </div>
    );
}

export default Layout;