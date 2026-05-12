//<Member(회원정보) 세션>
package com.cmyk.threeh.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.enums.MemberRole;

import lombok.Getter;

@Getter
public class SessionMember implements Serializable {

    private static final long serialVersionUID = 1L;

    //------------Admins 추가 정보------------
    private Long adminId;

    private String adLoginId;

    private String adminName;

    private String memberAddress;



    //------------Member 정보------------
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


	
	//Admins용 생성자
	public SessionMember(Admins admins) {
		this.adminId = admins.getAdminId();
		this.adLoginId = admins.getAdLoginId();
		this.password = admins.getPassword();
		this.adminName = admins.getAdminName();
		this.createdAt = admins.getCreatedAt();
		this.role = admins.getRole();
		this.memberAddress = admins.getMemberAddress();
	}  //=> 세션 상에 업로드


    //Member용 생성자
	public SessionMember(Member member) {
		this.memberId = member.getMemberId();
		this.id = member.getId();
		this.name = member.getName();
		this.email = member.getEmail();
		this.phone = member.getPhone();
		this.role = member.getRole();
		this.regNo = member.getRegNo();
		this.createdAt = member.getCreatedAt();
		this.updatedAt = member.getUpdatedAt();
	}  //=> 세션 상에 업로드

    
}
