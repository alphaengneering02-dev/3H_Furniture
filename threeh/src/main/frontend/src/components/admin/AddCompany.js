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
        // ... 기존 업로드 및 Axios 로직 유지 ...
    };

    return (
        <div className="admin-excel-uploader-container">
            <label htmlFor="excel-file-input" className="excel-file-label">
                파일 선택
            </label>
            
            {/* 💡 바로 이 부분의 accept 속성을 확장해 줍니다! */}
            <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="excel-hidden-input"
            />

            <span className="excel-filename-display">
                {selectedFile ? selectedFile.name : '선택된 파일 없음'}
            </span>

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