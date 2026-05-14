//<Spring Security 로그인>
package com.cmyk.threeh.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
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
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.CustomMemberDetails;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.OAuth2DTO;
import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberSecurityService implements UserDetailsService, OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    
    private final AdminsRepository adminsRepository;
    private final MemberRepository memberRepository;

    
	
    //===================사이트 회원 로그인===================
	//DB의 회원정보를 가져오는 메소드
	@Override
	public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {

		//디버깅 메세지
		System.out.println("로그인 시도 ID: [" + id + "]");
		System.out.println("DB 전체 회원 수(어드민+일반 멤버): " 
			+ adminsRepository.count()
			+ memberRepository.count()
		);
		System.out.println("DB에 있는 아이디: [");
		adminsRepository.findAll().forEach(a -> System.out.println(a.getAdLoginId()));
		memberRepository.findAll().forEach(m -> System.out.println(m.getId()));
		System.out.println("]");

		
		// 엔티티의 컬럼명 id를 기준으로 회원을 찾습니다. (Admin, Member 테이블)
		UserDetails userDetails;  //시큐리티에 반환할 CustomMemberDetails 객체
		SessionMember user;  //세션에 담을 용도

		// 1. 관리자(Admins) 테이블에서 먼저 조회
        Optional<Admins> searchAdmin = adminsRepository.findByAdLoginId(id);
        if (searchAdmin.isPresent()) {
            Admins admins = searchAdmin.get();
			user = new SessionMember(admins);
			userDetails = new CustomMemberDetails(admins);

        } else {
            // 2. 관리자가 없다면 일반 멤버(Member) 테이블에서 조회
            Optional<Member> searchMember = memberRepository.findById(id);
            if (searchMember.isPresent()) {
                Member member = searchMember.get();
                user = new SessionMember(member);
				userDetails = new CustomMemberDetails(member);

            } else {
                // 3. 두 테이블 모두 존재하지 않으면 예외 던지기
                throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + id);
            }
        }
		

       // 찾은 엔티티를 CustomUserDetails에 담아서 시큐리티에 넘겨줍니다.
        return userDetails;
        
	}




    //===================OAUTH2 소셜 로그인/회원가입===================
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {  //userRequest(소셜 사용자 정보)

		try {

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
			Member authUser = saveOrUpdate(attributes);


			//프론트엔드 세션에 넘겨주기 위해, DB에 실제로 저장된 진짜 ID를 Map에 끼워 넣음
			Map<String, Object> customAttributes = new HashMap<>(attributes.getAttributes());
			customAttributes.put("db_id", authUser.getId());
			

			return new DefaultOAuth2User(
				Collections.singleton(new SimpleGrantedAuthority(authUser.getRole().getKey())), 
				customAttributes,  //원본 Map 대신, 진짜 ID가 포함된 새로운 Map을 시큐리티로 넘김(authentication)
				attributes.getNameAttributeKey());

		} catch (Exception e) {
			//소셜 로그인 과정에서 발생하는 모든 에러를, 시큐리티가 이해할 수 있는 예외로 던짐
			throw new OAuth2AuthenticationException(new OAuth2Error("oauth2_error"), e.getMessage());
		}
		
	}
	
	

	
	//최초 사용자 등록 or 사용자 정보 업데이트
	private Member saveOrUpdate(OAuth2DTO attributes) {

		//이메일이 없는 경우 예외 처리나 기본값 할당
		if (attributes.getEmail() == null || attributes.getEmail().isEmpty()) {
			throw new OAuth2AuthenticationException(new OAuth2Error("email_not_found"), "이메일 제공 동의가 필요합니다.");
		}
		
		try {
			Member authUser = memberRepository.findByEmail(attributes.getEmail())
				.map(entity -> update(entity, attributes))  //과거의 정보, 새로운 정보
				.orElse(attributes.toEntity());
			
			return memberRepository.save(authUser);
		} catch (Exception e) {
			throw new RuntimeException("OAuth2 소셜로그인 회원 저장 중 오류 발생", e);
		}

	}


    //사용자 정보 업데이트
    private Member update(Member entity, OAuth2DTO dto) {
        entity.setName(dto.getName());
        
        return entity;
    }

}
