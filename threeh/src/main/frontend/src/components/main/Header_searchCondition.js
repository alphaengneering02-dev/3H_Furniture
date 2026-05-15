import React, { useEffect, useState } from 'react';
import { Slider } from "@mui/material";

const Header_searchCondition = ({searchKey, setSearchKey}) => {

    //검색조건 선택 (multiple select 가능)
    useEffect(() => {
        resetSearchKey()
    }, [])


    //예: { space: ['livingroom', 'bedroom', ...] }
    const changeOption = (evt) => {
        const {name, value, options} = evt.target;
        
        //선택된 option value들의 배열
        const selectedValues = Array.from(options)
                                    .filter(option => option.selected)  //선택된 option들만
                                    .map(option => option.value)  //value 추출
        
        setSearchKey({
            ...searchKey,
            [name]: selectedValues
        })
    }


    const resetSearchKey = () => {
        setSearchKey({
            "space": ["all"],
            "kind": ["all"],
            "brand": ["all"],
            "material": ["all"],
            "size": [0, 0],
            "price": [0, 0]
        })
    }



    //Range Slider - 사이즈(size)
    const [sizeMin, setSizeMin] = useState(0)
    const [sizeMax, setSizeMax] = useState(100)

    const changeSize = (evt) => {
        const numValue = Number(evt.target.value)  //input에서 넘어온 값(String)을 숫자로 변환

        setSearchKey({
            ...searchKey,
            size: numValue
        }) 
    }




    return (
         <section className='list'>
            <article>
                <h3>검색 조건</h3>
                <button>전체 삭제</button>
            </article>


            <p>* 다중선택을 하려면 Ctrl 또는 Cmd키를 누르고 클릭하세요.</p>


            <article>
                {/* 사용공간 */}
                <div>
                    <p>사용공간</p>
                    <select id="space" name="space" value={searchKey.space} multiple onChange={changeOption}>  
                        <option value="all" selected>전체</option>
                        <option value="livingroom">거실</option>
                        <option value="bedroom">침실</option>
                        <option value="kitchen">주방</option>
                    </select>
                </div>

                {/* 종류 */}
                <div>
                    <p>종류</p>
                    <select id="kind" name="kind" value={searchKey.kind} multiple onChange={changeOption}>  
                        <option value="all" selected>전체</option>
                        <option value="desk">책상</option>
                        <option value="chair">의자</option>
                        <option value="bookshelf">책꽃이</option>
                    </select>
                </div>

                {/* 브랜드 */}
                <div>
                    <p>브랜드</p>
                    <select id="brand" name="brand" value={searchKey.brand} multiple onChange={changeOption}>  
                        <option value="all" selected>전체</option>
                        <option value="livart">리바트</option>
                        <option value="hanssem">한샘</option>
                        <option value="hermanMiller">허먼 밀러</option>
                    </select>
                </div>

                {/* 소재 */}
                <div>
                    <p>소재</p>
                    <select id="material" name="material" value={searchKey.material} multiple onChange={changeOption}>  
                        <option value="all" selected>전체</option>
                        <option value="fabric">페브릭</option>
                        <option value="wood">원목</option>
                        <option value="metal">메탈</option>
                    </select>
                </div>

                {/* 사이즈 */}
                <div>
                    <h4>사이즈</h4>
                    <Slider
                        getAriaLabel={() => 'Minimum distance shift'}
                        value={searchKey.size}
                        onChange={changeSize}
                        valueLabelDisplay="auto"
                        disableSwap
                    />
                </div>

                {/* 가격대 */}
                <div>
                    <h4>가격대</h4>
                    <div>
                        <input type='range' id='priceMin' name='price'/>
                        <input type='range' id='priceMax' name='price'/>
                        <div class="track"
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'red'
                            }}>
                            <div class="progress"></div>
                        </div>
                    </div>
                </div>
            </article>
        </section>
    );
};

export default Header_searchCondition;