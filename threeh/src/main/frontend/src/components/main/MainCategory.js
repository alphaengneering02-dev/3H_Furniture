import React from 'react';
import { Link } from 'react-router-dom';
import banner_main1 from '../../assets/banner_main1.png';

function MainCategory(props) {
    return (
        <section>
            <h2>상품 카테고리</h2>
            
            {/* 크기 조정은 css로  */}
            <div className='main-category-imgsection'>
                <Link><img src={banner_main1} alt=''/></Link>
                <Link><img src={banner_main1} alt=''/></Link>
                <Link><img src={banner_main1} alt=''/></Link>
                <Link><img src={banner_main1} alt=''/></Link>
            </div>
            
        </section>
    );
}

export default MainCategory;