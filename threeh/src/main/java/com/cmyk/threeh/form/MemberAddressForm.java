package com.cmyk.threeh.form;

import javax.validation.constraints.NotEmpty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberAddressForm {

    @NotEmpty(message = "우편번호를 적으세요")
    private String zipcode;

    @NotEmpty(message = "주소를 입력하세요")
    private String addr;

    @NotEmpty(message = "상세 주소를 입력하세요")
    private String addrDetail;

}
