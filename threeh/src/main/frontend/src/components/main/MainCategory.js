import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import livingroom_sub from '../../assets/livingroom_sub.png';
import bedroom_sub from '../../assets/bedroom_sub.jfif';
import kitchen_sub from '../../assets/kitchen_sub.jfif';
import toilet_sub from '../../assets/toilet_sub.jfif';

function MainCategory(props) {

    //현재 활성화된 슬라이드 인덱스 상태 (0, 1, 2, 3)
    const [currentIndex, setCurrentIndex] = useState(0)

    //슬라이드 데이터 배열로 관리
    const slides = [
        {id:'s1', src:livingroom_sub, title:'거실', alt:'거실 배너', describe:'미드센츄리 모던디자인 거실가구', link:'#'}, //# 자리에 링크 주소를 넣어주시면 됩니다 
        {id:'s2', src:bedroom_sub, title:'침실', alt:'침실 배너', describe:'미드센츄리 모던디자인 거실가구', link:'#'},
        {id:'s3', src:kitchen_sub, title:'주방', alt:'주방 배너', describe:'미드센츄리 모던디자인 거실가구', link:'#'},
        {id:'s4', src:toilet_sub, title:'욕실', alt:'욕실 배너', describe:'미드센츄리 모던디자인 거실가구', link:'#'},
    ];

    //슬라이드가 자동으로 넘어가는 함수
    useEffect(() => {
        setInterval(handleNext, 6000)
    }, [])

    const handleNext = () => {
        setCurrentIndex(prexIndex => 
            prexIndex===slides.length-1 ? 0 : prexIndex+1
        )
    }



    return (
        <section className='main-category-imgsection'>
            <h2>상품 카테고리</h2>
            
            {/* 크기 조정은 css로  */}
            <div className='main-category-imgsection-contents'>
                <div className='main-category-imgsection-box'>
                    <Link className='livingroom'>
                        <h3>거실</h3>
                        <p>미드센츄리 모던디자인 거실가구</p>
                    </Link>
                    <Link className='bedroom'>
                        <h3>침실</h3>
                        <p>미드센츄리 모던디자인 거실가구</p>
                    </Link>
                </div>


                {/* 카테고리 배너 */}
                <div className='main-category-imgsection-banner'>
                    {/* <Link>배너 자리</Link> */}
                    {/* 인덱스에 따라 슬라이드가 넘어가게 적용 */}
                    <ul className="slide"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                            transition: 'transform 2s ease-in-out',
                            display: 'flex',
                            listStyle: 'none',
                            height: '100%',
                        }}
                    >
                        {slides.map((slide, index) => (
                            <li 
                                key={slide.id} 
                                className={slide.id}
                                style={{
                                    position: 'relative',
                                    minWidth: '100%', height: '100%',
                                    boxSizing: 'border-box'
                                }}
                            > 
                                <Link to={slide.link}>
                                    <div className='slide-text'
                                        style={{
                                            position: 'absolute',
                                            top: '40px', left: '40px',
                                            color: '#fff'
                                        }}>
                                        <h3>{slide.title}</h3>
                                        <p>{slide.describe}</p>
                                    </div>
                                    <img src={slide.src} alt={slide.alt} 
                                        style={{
                                            display: 'block',
                                            width: '100%', height: '100%', 
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className='main-category-imgsection-box'>
                    <Link className='kitchen'>
                        <h3>주방</h3>
                        <p>미드센츄리 모던디자인 거실가구</p>
                    </Link>
                    <Link className='toilet'>
                        <h3>욕실</h3>
                        <p>미드센츄리 모던디자인 거실가구</p>
                    </Link>
                </div>
            </div>
            
        </section>
    );
}

export default MainCategory;