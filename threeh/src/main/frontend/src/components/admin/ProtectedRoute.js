import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const savedUser = sessionStorage.getItem("user");
    
    // 1. 로그인 정보가 아예 없는 경우
    if (!savedUser) {
        alert("로그인이 필요한 서비스입니다.");
        return <Navigate to="/login" replace />;
    }

    const userObj = JSON.parse(savedUser);
    const now = new Date().getTime();

    // 2. 세션이 만료된 경우
    if (userObj.expiry && now > userObj.expiry) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        sessionStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }

    // 3. 관리자 권한 체크
    // 로그인한 유저 객체에 adminName이나 adLoginId가 없다면 관리자가 아니므로 메인으로 튕겨냅니다.
    if (!userObj.adminName && !userObj.adLoginId) {
        alert("관리자만 접근할 수 있는 페이지입니다.");
        return <Navigate to="/" replace />;
    }

    // 권한이 확인되면 원래 보여주려던 컴포넌트 통과
    return children;
};

export default ProtectedRoute;