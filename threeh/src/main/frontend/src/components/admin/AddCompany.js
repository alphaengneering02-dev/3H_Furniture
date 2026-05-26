import React, { useState } from 'react';
import * as XLSX from "xlsx";
import axios from "axios";

const AddCompany = ({ onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // 파일 선택
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
    };

    // 업로드 실행
    const handleExcelUpload = async () => {
        if (!selectedFile) {
            alert("파일을 선택해주세요.");
            return;
        }

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, {
                    defval: ""
                });

                // ⭐ await를 붙여서 비동기 통신이 끝난 뒤 다음 로직이 실행되도록 수정했습니다.
                await axios.post("/admin/delivery/bulk", jsonData);

                alert("엑셀 등록 완료!");
                setSelectedFile(null);
                
                // 파일 선택창 리셋을 위한 우회 처리
                if (document.getElementById("excel-file-input")) {
                    document.getElementById("excel-file-input").value = "";
                }

                if (onSuccess) onSuccess();

            } catch (err) {
                console.error("엑셀 업로드 실패:", err);
                if (err.response) {
                    console.log("응답 데이터:", err.response.data);
                    console.log("상태 코드:", err.response.status);
                    alert(`등록 실패: ${err.response.data}`);
                } else {
                    alert("서버 연결 실패");
                }
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        <div className="admin-excel-uploader-container">
            {/* 파일 선택 커스텀 디자인을 위해 label 구조 활용 */}
            <label htmlFor="excel-file-input" className="excel-file-label">
                파일 선택
            </label>
            <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="excel-hidden-input"
            />

            {/* 파일명 표시 (선택되었을 때만 텍스트 노출) */}
            <span className="excel-filename-display">
                {selectedFile ? selectedFile.name : '선택된 파일 없음'}
            </span>

            {/* 등록 버튼 */}
            <button
                onClick={handleExcelUpload}
                disabled={loading || !selectedFile}
                className={`excel-upload-submit-btn ${loading ? 'is-loading' : ''}`}
            >
                {loading ? '등록중...' : '등록하기'}
            </button>
        </div>
    );
};

export default AddCompany;