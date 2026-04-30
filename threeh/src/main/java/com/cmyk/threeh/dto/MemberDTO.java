package com.cmyk.threeh.dto;

import com.cmyk.threeh.enums.MemberRole;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MemberDTO {

    private Long memberId;

    private String id;

    private String password;

    private String name;

    private String email;

    private String phone;

    private MemberRole role;

    private String regNo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
