import axios from 'axios';
import React, { useEffect, useState } from 'react';

function OrderUser({ itemId }) {

    const [member, setMember] = useState([])

    useEffect(() => {
        axios.get('/order/${itemId}')
        .then(res => setMember=(res.data))
        .catch(error => console.log(error))
    }, [])


    return (
        <div>


            <div>
                <label>이름</label>

                <input type='text' placeholder='이름'
                value={member ? member.memberName : ''}
                readOnly/>
            </div>

            <div>
                <label>전화번호</label>

                <input type='text'
                value={member? member.phone : ''}
                />
            </div>

            <div>
                <label>배송 설치 날짜</label>
            </div>
            
            
        </div>
    );
}

export default OrderUser;