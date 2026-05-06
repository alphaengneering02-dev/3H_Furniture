import React, { useState } from 'react';

const FindId_result = () => {

    const [resultId, setResultId] = useState()


    // //call 함수
    // const result = () => {
    //     sendRequest("FindId_result.js", null, displayResult, "GET");
    // }


    // //callback 함수
    // const displayResult = () => {
    //     if(xmlHttp.readyState==4) {  //DONE (숫자 4) : 요청한 데이터의 처리가 완료되어 응답할 준비가 완료됨.
    //         if(xmlHttp.status==200) {  //200: 통신 성공
    //             var resultStr = xmlHttp.responseText;  //받아온 결과(json, HTML)
    //             alert(resultStr);
                
    //             //eval: 변수의 내용을 객체화
    //             var resultObject = window.eval('(' + resultStr + ')');
                
    //             //alert(resultObject.title[2].publisher);
                
    //             if(resultObject.length > 0) {  //데이터가 하나라도 존재하면
    //                 var html = "<ol>";
                    
    //                 for(var i=0; i<resultObject.member_id.length; i++) {
    //                     var idStr = resultObject.id[i];
                        
    //                     //alert(idStr);
    //                     html += "<li>" + idStr + "</li>";
    //                 }
                    
    //                 html += "</ol>";
                    
    //                 var resultDiv = document.getElementById("resultDiv");
    //                 resultDiv.innerHTML = html;
                    
    //             }
                
    //         }
    //     }
        
    // }
    

    // window.onload = function() {
    //     result();
    // }


    return (
        <div>
            <h3>아이디 찾기가 완료되었습니다.</h3>

            <input type='text' value={resultId} id='resultId' name='resultId' placeholder='사용자 ID'/>
            <div id="resultDiv"></div>


            <article>
                <button>로그인</button>
                <button>비밀번호 찾기</button>
            </article>
        </div>
    );
};

export default FindId_result;