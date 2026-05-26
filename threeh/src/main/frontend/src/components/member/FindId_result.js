import React from 'react';
import { useNavigate } from 'react-router-dom';

//FindId 전용 CSS 임포트
import '../../css/memberPageCss/findId.css';

const FindId_result = ({resultId}) => {

    const navigate = useNavigate();


    return (
        <div className="find-id-result-box">
            <h3 className="find-id-result-title">아이디 찾기가 완료되었습니다.</h3>

            {/* 사용자 ID를 하단 굵은 보더 라인으로 강조하여 표시 */}
            <input 
                type='text' 
                value={resultId} id='resultId' name='resultId' 
                placeholder='사용자 ID'
                readOnly 
                className="find-id-result-field"
            />
            <div id="resultDiv"></div>


            {/* 하단 나란히 정렬된 버튼군 */}
            <article className="find-id-result-actions">
                <button 
                    className="find-id-btn-primary"
                    onClick={() => navigate("/login")}
                > 
                    로그인 
                </button>
                <button 
                className="find-id-btn-secondary"
                onClick={() => navigate("/changePw")}
                >
                    비밀번호 찾기 
                </button>
            </article>
        </div>
    );
};

export default FindId_result;