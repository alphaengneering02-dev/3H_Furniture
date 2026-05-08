//<Spring Security - 로그인한 개별 사용자의 정보를 담는 객체 클래스>
package com.cmyk.threeh.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.cmyk.threeh.dto.SessionMember;

public class CustomMemberDetails implements UserDetails, Serializable {

    private static final long serialVersionUID = 1L;


    //생성자
    private final SessionMember sessionMember;

    public CustomMemberDetails(Member member) {
        this.sessionMember = new SessionMember(member);
    }


    // 엔티티의 MemberRole을 스프링 시큐리티의 권한으로 변환 (인가(Authorization))
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();  //시큐리티의 권한 목록을 가져옴
        authorities.add(new SimpleGrantedAuthority(sessionMember.getRole().getKey()));

        return authorities;
    }


    // 비밀번호 반환
    @Override
    public String getPassword() {
        return sessionMember.getPassword();
    }


    // 로그인 아이디 반환 (엔티티의 PK인 memberId가 아니라, 로그인용 id)
    @Override
    public String getUsername() {
        return sessionMember.getId();
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
    public SessionMember getSessionMember() {
        return sessionMember;
    }

    
}





