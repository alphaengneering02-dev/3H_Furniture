//<Member(회원정보) 세션>
package com.cmyk.threeh.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.enums.MemberRole;

import lombok.Getter;

@Getter
public class SessionMember implements Serializable {

    private Long memberId;

    private String id;

    private String password;

    private String name;

    private String email;

    private String phone;

    // private String picture;  //사진도 업데이트 한다면 추가

    private MemberRole role;

    private String regNo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

	
	
	public SessionMember(Member member) {
		this.name = member.getName();
		this.email = member.getEmail();
		// this.picture = member.getPicture();
	}  //=> 세션 상에 업로드

    
}
