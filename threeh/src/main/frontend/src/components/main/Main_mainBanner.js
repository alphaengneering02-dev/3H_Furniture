import React, { useEffect, useState } from 'react';
import banner_main1 from '../../assets/banner_main1.png';
import banner_main2 from '../../assets/banner_main2.png';
import banner_main3 from '../../assets/banner_main3.png';
import icon_prev from '../../assets/icon_prev.png';
import icon_next from '../../assets/icon_next.png';
import { Link } from 'react-router-dom';

const Main_mainBanner = () => {
    //1. 현재 활성화된 슬라이드 인덱스 상태 (0, 1, 2)
    const [currentIndex, setCurrentIndex] = useState(0)

    //슬라이드 데이터 배열로 관리
    const slides = [
        {id: 's1', src: banner_main1, alt: '메인배너1', link: '#'},
        {id: 's2', src: banner_main2, alt: '메인배너2', link: '#'},
        {id: 's3', src: banner_main3, alt: '메인배너3', link: '#'},
    ];

    //슬라이드가 자동으로 넘어가는 함수
    useEffect(() => {
        setInterval(handleNext, 6000)
    }, [])


    //2. 이전 버튼 기능 (첫 번째 슬라이드에서 누르면 마지막 슬라이드로 이동)
    const handlePrev = () => {
        setCurrentIndex(prexIndex => 
            prexIndex===0 ? slides.length-1 : prexIndex-1
        );
    };

    //3. 다음 버튼 기능 (마지막 슬라이드에서 누르면 첫 번째 슬라이드로 이동)
    const handleNext = () => {
        setCurrentIndex(prexIndex => 
            prexIndex===slides.length-1 ? 0 : prexIndex+1
        )
    }

    //4. 특정 인디케이터 클릭 기능
    const handleSelect = (index) => {
        setCurrentIndex(index);
    }


    return (
        <section className="main-banner main-banner-mainSlide">
            {/* 5. 인덱스에 따라 슬라이드가 넘어가게 적용 */}
            <ul className="slide"
                style={{ 
                    transform: `translateX(-${currentIndex * 100}%)`,
                    transition: 'transform 2s ease-in-out',
                    display: 'flex',
                    padding: 0,
                    margin: 0,
                    listStyle: 'none'
                }}
            >
                {slides.map((slide, index) => (
                    <li 
                        key={slide.id} 
                        className={slide.id}
                        style={{minWidth: '100%', boxSizing: 'border-box'}}
                    > 
                        <Link to={slide.link}>
                            <img src={slide.src} alt={slide.alt} style={{width: '100%', display: 'block'}} />
                        </Link>
                    </li>
                ))}
            </ul>

            {/* 이전/다음 버튼 */}
            <div className="main-banner-btn-once">
                <button id="prev" name="prev" className="prev" onClick={handlePrev}>
                    <img src={icon_prev} alt='이전으로'/>
                </button>
                <button id="next" name="next" className="next" onClick={handleNext}>
                    <img src={icon_next} alt='다음으로'/>
                </button>
            </div>

            {/* 하단 인디케이터 버튼 */}
            <ul className="main-banner-btn-indicater">
                {slides.map((_, index) => (
                    <li 
                        key={index}
                        className={currentIndex===index ? 'active' : ''} 
                        onClick={() => handleSelect(index)}
                    ></li>
                ))}
            </ul>
        </section>
    );
};

export default Main_mainBanner;