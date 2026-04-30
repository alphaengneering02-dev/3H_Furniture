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

    private Long addrid;    
    private Long memberid;
    private String zipcode;
    private String addr;
    private String addrdetail;
    private String isdefault;
    
}