//<Spring Security - 로그인한 개별 사용자의 정보를 담는 객체 클래스>
package com.cmyk.threeh.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;

public class CustomMemberDetails implements UserDetails, Serializable {

    private static final long serialVersionUID = 1L;

    private final transient Admins admins;
    private final transient Member member;


    //Admins용 생성자
    public CustomMemberDetails(Admins admins) {
        this.admins = admins;
        this.member = null; // 미사용 필드 null 초기화
    }

    //Member용 생성자
    public CustomMemberDetails(Member member) {
        this.member = member;
        this.admins = null; // 미사용 필드 null 초기화
    }


    // 엔티티의 MemberRole을 스프링 시큐리티의 권한으로 변환 (인가(Authorization))
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();  //시큐리티의 권한 목록을 가져옴
        
        // 1. 관리자인 경우
        if(admins != null) {
            // [주의] Admins 엔티티에 Role이 있다면 그 값을, 없다면 하드코딩된 관리자 권한 부여
            // 예: authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorities.add(new SimpleGrantedAuthority(admins.getRole().getKey())); 
        }
        // 2. 일반 멤버인 경우
        else if(member != null) {
            authorities.add(new SimpleGrantedAuthority(member.getRole().getKey()));
        } else {
            throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        }

        return authorities;
    }


    // 비밀번호 반환 (Null 방지 처리)
    @Override
    public String getPassword() {
        if(admins != null) {
            return admins.getPassword();
        } else if(member != null) {
            return member.getPassword();
        }
        return null;
    }


    // 로그인 아이디 반환 (엔티티의 PK인 memberId가 아니라, 로그인용 id)
    @Override
    public String getUsername() {
        if(admins != null) {
            return admins.getAdLoginId();
        } else if(member != null) {
            return member.getId();
        }
        return null;
    }


    // 계정 만료, 잠김 등의 로직 (사용하지 않으면 true 반환)
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }


    // Controller 등에서 원본 Member 객체가 필요할 때 꺼내 쓰기 위한 메서드
    public Admins getAdmins() {
        return admins;
    }

    public Member getMember() {
        return member;
    }

    //코딩 추가_ 오현옥 _ 관리자 리뷰 삭제 기능에 필요한 관리자 여부 확인용.
    //로그인 한 사람이 관리자면 admins가 들어가고, 일반회원이면 member가 들어가니까.
    //admin !=null이면 관리자라고 판단. 
    public boolean isAdmin(){
        return admins !=null;
    }

}