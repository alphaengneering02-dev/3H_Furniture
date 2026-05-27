import React, { useState } from 'react';
import * as XLSX from "xlsx";
import axios from "axios";

const AddCompany = ({ onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
    };

    const handleExcelUpload = async () => {
        if (!selectedFile) {
            alert("파일을 선택해주세요.");
            return;
        }

        setLoading(true);

        // 💡 실질적인 엑셀 파일 읽기 및 파싱 로직 구현
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 첫 번째 시트 이름 가져오기
                const firstSheetName = workbook.SheetNames[0];
                // 첫 번째 시트를 JSON 배열로 변환
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                console.log("파싱된 엑셀 데이터:", jsonData);

                if (jsonData.length === 0) {
                    alert("엑셀 파일에 등록할 데이터가 없습니다.");
                    setLoading(false);
                    return;
                }

                // 백엔드 기사 단체 등록 API 엔드포인트로 전송 (주소는 프로젝트 설계에 맞게 수정하세요)
                const response = await axios.post('/admin/delivery/bulk', jsonData, {
                withCredentials: true
            });
                alert("단체 등록이 완료되었습니다.");
                
                // 파일 선택 초기화
                setSelectedFile(null);
                document.getElementById("excel-file-input").value = "";

                // 대시보드 리스트 새로고침 함수 호출
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            } catch (error) {
                console.error("엑셀 업로드 실패:", error);
                alert(`등록 중 오류가 발생했습니다: ${error.response?.data || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        <div className="admin-excel-uploader-container">
            <label htmlFor="excel-file-input" className="admin-excel-file-label">
                파일 선택
            </label>
            
            <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="admin-excel-hidden-input"
            />

            <span className="admin-excel-filename-display">
                {selectedFile ? selectedFile.name : '선택된 파일 없음'}
            </span>

            <button
                onClick={handleExcelUpload}
                disabled={loading || !selectedFile}
                className={`admin-excel-upload-submit-btn ${loading ? 'is-loading' : ''}`}
                style={{ cursor: loading || !selectedFile ? 'not-allowed' : 'pointer' }}
            >
                {loading ? '등록중...' : '등록하기'}
            </button>
        </div>
    );
};

export default AddCompany;