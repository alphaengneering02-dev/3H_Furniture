import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MemberAddressUpdate = () => {
    const navigate = useNavigate();
    const {id} = useParams();

    //조원의 백엔드 수신 양식
    const [fromData, setFormData] = useState({
        id: id || '',
        name: '',
        email: '',
        password1: '', //조원 코드 비밀번호 누락 방지용
        password2: ''
    });

     // [최초 로드] 조원의 GET API(/api/member/{id})를 호출하여 기존 회원정보 세팅
    useEffect(() => {
        if(!id) {
            alert("잘못된 접근입니다");
            navigate('/mypage');
            return;
        }
    });

        
    //     axios.get(`http://localhost:8080/api/member/${id}`, {withCredentials:true})
    //     .then(res => {
    //         setFormData({
    //             id: res.data.id || '',
    //             name: res.data.name || '',
    //             phone: res.data.phone || '',
    //             email: res.data.email || '',
    //             password1: res.data.password1 || '', //기본 패스워드 동기화
    //             password2: res.data.password2 || '',
    //         })
    //     })
    //     .catch
    // })
}


export default MemberAddressUpdate;