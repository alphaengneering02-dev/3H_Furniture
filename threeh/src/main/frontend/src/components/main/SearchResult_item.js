import React from 'react';

const SearchResult_item = ({item}) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <td>상품번호</td>
                        <td>카테고리</td>
                        <td>상품명</td>
                        <td>설명</td>
                        <td>판매여부</td>
                        <td>색상</td>
                        <td>원가격</td>
                        <td>할인가격</td>
                        <td>총가격</td>
                        <td>화폐</td>
                        <td>재고</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{width: 100}}>{item.itemId}</td>
                        <td style={{width: 100}}>{item.itemCategory}</td>
                        <td style={{width: 250}}>{item.itemName}</td>
                        <td style={{width: 300}}>{item.itemDetail}</td>
                        <td style={{width: 70}}>{item.itemSellStatus}</td>
                        <td style={{width: 70}}>{item.itemColor}</td>
                        <td style={{width: 70}}>{item.itemPrice}</td>
                        <td style={{width: 70}}>{item.itemDiscountPrice}</td>
                        <td style={{width: 70}}>{item.itemPrice-item.itemDiscountPrice}</td>
                        <td style={{width: 70}}>{item.itemPriceCurrency}</td>
                        <td style={{width: 70}}>{item.itemStock}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default SearchResult_item;