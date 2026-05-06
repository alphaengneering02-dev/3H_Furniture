package com.cmyk.threeh.dto;


import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberAddressDTO {

    private Long addrid;    //배송지 식별 번호 (수정/삭제 시 활용)
    private Long memberid;  //주소 소유 회원 번호

    private String city; //도시 정보
    private String street; //도로명 주소
    private String zipcode; //우편번호

    //DB의 ADDR 컬럼에 저장된 전체 주소
    private String addr;

    //상세 주소 (동, 호수 등 사용자 입력 정보)
    private String addrdetail;

    //기본 배송지 설정 여부 (Y/N)
    private String isdefault;

    private String addressName; //배송지 별칭
    private String receiverName;//수령인 이름
    private String receiverPhone;//수령인 연락처
    
}