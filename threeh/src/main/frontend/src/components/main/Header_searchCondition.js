import React from 'react';

const Header_searchCondition = () => {
    return (
         <section className='list'>
            <article>
                <h3>검색 조건</h3>
                <button>전체 삭제</button>
            </article>


            <article>
                {/* 사용공간 */}
                <div>
                    <select>
                        <option selected disabled>사용공간</option>
                    </select>
                </div>

                {/* 종류 */}
                <div>
                    <select>
                        <option selected disabled>종류</option>
                    </select>
                </div>

                {/* 브랜드 */}
                <div>
                    <select>
                        <option selected disabled>브랜드</option>
                    </select>
                </div>

                {/* 소재 */}
                <div>
                    <select>
                        <option selected disabled>소재</option>
                    </select>
                </div>

                {/* 사이즈 */}
                <div>
                    <h4>사이즈</h4>
                    <input type='range'/>
                </div>

                {/* 가격대 */}
                <div>
                    <h4>가격대</h4>
                    <input type='range'/>
                </div>
            </article>
        </section>
    );
};

export default Header_searchCondition;