//<Spring Security 로그인>
package com.cmyk.threeh.service;

import java.util.Collections;
import java.util.Optional;

import javax.servlet.http.HttpSession;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.CustomMemberDetails;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.OAuth2DTO;
import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberSecurityService implements UserDetailsService, OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    
    private final MemberRepository memberRepository;
    private final HttpSession httpSession;

    
	
    //===================사이트 회원 로그인===================
	//DB의 회원정보를 가져오는 메소드
	@Override
	public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {

		// 엔티티의 컬럼명 id를 기준으로 회원을 찾습니다.
		Optional<Member> searchMember = memberRepository.findById(id);
		
		//사용자명에 해당하는 데이터가 없을 경우
		if(!searchMember.isPresent()) {
			throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + id);
		}
		//사용자명에 해당하는 데이터가 있을 경우
		Member member = searchMember.get();


		//===================================================================
		//디버깅 메세지
		System.out.println("로그인 시도 ID: [" + id + "]");
		System.out.println("DB 전체 회원 수: " + memberRepository.count());
		memberRepository.findAll().forEach(m -> System.out.println("DB에 있는 아이디: [" + m.getId() + "]"));
    	System.out.println("DB에서 가져온 비밀번호: [" + member.getPassword() + "]");
		//===================================================================


        //세션에 사용자 정보를 올림
		httpSession.setAttribute("member", new SessionMember(member));
		

       // 찾은 엔티티를 CustomUserDetails에 담아서 시큐리티에 넘겨줍니다.
        return new CustomMemberDetails(member);
        
	}




    //===================OAUTH2 소셜 로그인/회원가입===================
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {  //userRequest(소셜 사용자 정보)
		
		OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2MemberService = new DefaultOAuth2UserService();
	
		//userRequest --> oAuth2UserService로 넘김(load)
		OAuth2User oAuth2Member = oAuth2MemberService.loadUser(userRequest);
		
		//플랫폼 고유 코드 (google, 네이버, 카카오)
		String registrationId = userRequest.getClientRegistration().getRegistrationId();
		
		//사용자 고유 PK == nameAttributeKey
		String userNameAttributeName = 
            userRequest.getClientRegistration().getProviderDetails()
            .getUserInfoEndpoint().getUserNameAttributeName();  //sub(Google), response(네이버), id(카카오)
		
		System.out.println("필드명 확인: " + userNameAttributeName);  //PK 필드명 확인
		
		
		//-------------------------------------------------------------
		
		//플랫폼에서 가져온 원시 사용자 데이터 get
		OAuth2DTO attributes = 
				OAuth2DTO.of(registrationId, userNameAttributeName, oAuth2Member.getAttributes());  //플랫폼, 사용자 PK, 사용자 정보
		
		System.out.println(attributes.getAttributes());  //응답받은 데이터 확인(Json 형태로 넘어옴)
		

		//원시 데이터(OAuth2DTO) -> 엔티티 Member에 넣음
		Member authMember = saveOrUpdate(attributes);
		
        
        //세션에 사용자 정보를 올림
		httpSession.setAttribute("member", new SessionMember(authMember));
		

		return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority(authMember.getRole().getKey())), 
            attributes.getAttributes(), 
            attributes.getNameAttributeKey());
		
	}
	
	

	
	//최초 사용자 등록 or 사용자 정보 업데이트
	private Member saveOrUpdate(OAuth2DTO attributes) {
		
		Member authMember = memberRepository.findByEmail(attributes.getEmail())
            .map(entity -> update(entity, attributes))  //과거의 정보, 새로운 정보
            .orElse(attributes.toEntity());
		
		return memberRepository.save(authMember);
		
	}


    //사용자 정보 업데이트
    private Member update(Member entity, OAuth2DTO dto) {
        entity.setName(dto.getName());
        // entity.setPicture(attributes.getPicture()); //사진도 업데이트 한다면 추가
        
        return entity;
    }
	


}
