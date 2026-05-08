// import React, { use, useState } from 'react';
// import DaumPostCode from 'react-daum-postcode';

// function AdrdressInput(props) {
//     const [zipCode, setZipcode] = useState('');
//     const [address, setAddress] = useState('');
//     const [isOpne, setIsOpen] = useState(false);
//     const [detailedAddress, setDetailedAddress] = useState('');

//     const completeHandler = (data) => {
//         const { address, zipCode } = data;
//         setZipcode(zipCode);
//         setAddress(address);
//     };

//     const closeHandler = (state) => {
//         if (state === "FORCE_CLOSE") {
//             setIsOpen(false);
//         } else if(state === "COMPETE_CLOSE") {
//             setIsOpen(false);
//         }
//     };

//     const toggleHandler = () => {
//         setIsOpen((prevOpenState)  => !prevOpenState);
//     };

//     const inputChangeHandler = (event) => {
//         setDetailedAddress(event.target.value);
//     };




//     return (
//         <div>
            
//             <div>
//                 <div>
//                     <div>{zipCode}</div>
//                     <button 
//                         type='button'
//                         onClick={toggleHandler}
//                         >
//                             주소 찾기
//                     </button>
//                 </div>
//                 {isOpne && (
//                     <div>
//                         <DaumPostCode 
//                             onComplete={completeHandler}
//                             onClose={closeHandler}
//                         />
//                     </div>
//                 )}
//                 <div>{address}</div>
//                 상세주소
//                 <input
//                  value={detailedAddress}
//                  onChange={inputChangeHandler}
//                  />
//             </div>
            
//         </div>
//     );
// }

// export default AdrdressInput;