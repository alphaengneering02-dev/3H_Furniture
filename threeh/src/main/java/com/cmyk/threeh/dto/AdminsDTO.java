package com.cmyk.threeh.dto;

import com.cmyk.threeh.enums.MemberRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminsDTO {

    private Long adminId;
    private String adLoginId;
    private String password;
    private String adminName;
    private MemberRole role;
    
}