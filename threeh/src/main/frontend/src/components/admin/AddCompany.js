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

                axios.post("/admin/delivery/bulk", jsonData);

                alert("엑셀 등록 완료!");

                setSelectedFile(null);

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
}

             finally {

                setLoading(false);

            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    return (

        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>

            {/* 파일 선택 */}
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
            />

            {/* 파일명 표시 */}
            {selectedFile && (
                <span style={{
                    fontSize: '14px',
                    color: '#555'
                }}>
                    {selectedFile.name}
                </span>
            )}

            {/* 등록 버튼 */}
            <button
                onClick={handleExcelUpload}
                disabled={loading}
                style={{
                    padding: '6px 12px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {loading ? '등록중...' : '등록하기'}
            </button>

        </div>
    );
};

export default AddCompany;