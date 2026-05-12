import React from 'react';
import * as XLSX from "xlsx";
import axios from "axios";

const AddCompany = ({ onSuccess }) => {

    const handleExcelUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);

            const workbook = XLSX.read(data, { type: "array" });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            try {
                await axios.post("/admin/delivery/bulk", jsonData);
                alert("엑셀 등록 완료!");

                if (onSuccess) onSuccess(); // 리스트 새로고침 콜백
            } catch (err) {
                alert("등록 실패");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            

            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
            />
        </div>
    );
};

export default AddCompany;