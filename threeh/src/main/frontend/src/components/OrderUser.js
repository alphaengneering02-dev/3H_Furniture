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

            <label>이름</label>

            <div>
                <input type='text' placeholder='이름'
                value={member ? member.memberName : ''}
                readOnly/>
            </div>
            
            
        </div>
    );
}

export default OrderUser;