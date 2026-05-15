package com.cmyk.threeh.form;

import javax.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class MemberAddressForm {

    @NotEmpty(message = "우편번호는 필수입니다.")
    private String zipcode;

    @NotEmpty(message = "도시/지역을 입력하세요")
    private String city;

    @NotEmpty(message = "도로명 주소를 입력하세요")
    private String street;

    @NotEmpty(message = "상세 주소는 필수입니다.")
    private String addrDetail;

    //추가된 배송지 정보
    private String addressName;
    private String receiverName;
    private String receiverPhone;

    //기본 배송지 설정 여부s
    private String isDefault;

}
