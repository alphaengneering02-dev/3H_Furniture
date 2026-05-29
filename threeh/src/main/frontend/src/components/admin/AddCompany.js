import React, { useState } from 'react';
import * as XLSX from "xlsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
            toast.error("파일을 선택해주세요.");
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast.error("엑셀 파일에 등록할 데이터가 없습니다.");
                    setLoading(false);
                    return;
                }

                const response = await axios.post('/admin/delivery/bulk', jsonData, {
                    withCredentials: true
                });
                
                toast.success("전체 등록 성공!");
                setSelectedFile(null);
                document.getElementById("excel-file-input").value = "";

                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            } catch (error) {
                console.error("❌ 엑셀 업로드 처리 중 오류/실패 발생:", error);

                // 백엔드가 400 에러와 함께 실패 리스트(배열)를 보낸 경우
                if (error.response && error.response.status === 400 && Array.isArray(error.response.data)) {
                    const failedData = error.response.data;
                    
                    toast.warn(`일부 데이터 등록 실패 (${failedData.length}건). 실패 목록 엑셀을 다운로드합니다.`);

                    // 💡 실패한 데이터들만 모아서 다시 엑셀 파일로 만들어 다운로드 트리거
                    const failedWorksheet = XLSX.utils.json_to_sheet(failedData);
                    const failedWorkbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(failedWorkbook, failedWorksheet, "실패목록");
                    
                    // 파일 다운로드 실행
                    XLSX.writeFile(failedWorkbook, `등록_실패_목록_${Date.now()}.xlsx`);

                } else {
                    // 그 외 진짜 서버 에러나 권한 에러 처리 (403 등)
                    const errorMsg = typeof error.response?.data === 'string' 
                        ? error.response.data 
                        : "등록 중 오류가 발생했습니다.";
                    toast.error(errorMsg);
                }
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    return (
       <div className="admin-excel-uploader-container">
            <div className="admin-excel-top-row">
                <label htmlFor="excel-file-input" className="admin-excel-file-label">파일 선택</label>
                <input
                    id="excel-file-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="admin-excel-hidden-input"
                />
                <span className="admin-excel-filename-display">
                    {selectedFile ? selectedFile.name : '선택된 파일 없음'}
                </span>
            </div>
            <button
                onClick={handleExcelUpload}
                disabled={loading || !selectedFile}
                className={`admin-excel-upload-submit-btn ${loading ? 'is-loading' : ''}`}>
                {loading ? '등록중...' : '등록하기'}
            </button>
            <ToastContainer />
        </div>
    );
};

export default AddCompany;