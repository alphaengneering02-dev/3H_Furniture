//<OAuth2 소셜 로그인 - Google/Kakao/Naver가 제공하는 사용자 정보의 DTO>
package com.cmyk.threeh.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.enums.MemberRole;

import lombok.Builder;
import lombok.Getter;

@Getter
public class OAuth2DTO {

  private String registrationId;
	private Map<String, Object> attributes;  //원시 사용자 데이터 (Map<key, value> 형태)
	private String nameAttributeKey;  //사용자 PK(=동일인 식별정보) == userNameAttributeName
	private String name;
	private String email;
	

	@Builder
	public OAuth2DTO(String registrationId, Map<String, Object> attributes, String nameAttributeKey, String name, String email) {

    this.registrationId = registrationId;
		this.attributes = attributes;
		this.nameAttributeKey = nameAttributeKey;
		this.name = name;
		this.email = email;
		
	}
	
	

	//데이터의 플랫폼을 구분하는 로직
	public static OAuth2DTO of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
		
		/* <파라미터 설명>
		- registrationId: 플랫폼 코드 (google, Naver, Kakao)
		- userNameAttributeName: 사용자 PK 필드 (== nameAttributeKey) : sub(Google, Kakao), response/id(Naver)
		- attributes: 원시 사용자 데이터
		*/

		if(registrationId.equals("kakao")) {
			return ofKakao(registrationId, userNameAttributeName, attributes);
		} else if(registrationId.equals("naver")) {
			return ofNaver(registrationId, "id", attributes);  //[주의]userNameAttributeName을 쓰면, response 자체가 넘어옴
		}
		
		return ofGoogle(registrationId, userNameAttributeName, attributes);
		
	}
	
	
	//Google 사용자 데이터를 추출
	private static OAuth2DTO ofGoogle(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
		
		//데이터를 풀어서, OAuth2DTO 객체에 삽입
		return OAuth2DTO.builder()
            .registrationId(registrationId)
            .name((String)attributes.get("name"))
            .email((String)attributes.get("email"))
            .attributes(attributes)  //사용자 정보
            .nameAttributeKey(userNameAttributeName)  //사용자 PK
            .build();

	}
	
	
	//Kakao 사용자 데이터를 추출
	private static OAuth2DTO ofKakao(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {

		// 1. 카카오가 kakao_account(중첩) 형태로 데이터를 줄 때
		Map<String, Object> kakaoAccount = (Map<String, Object>)attributes.get("kakao_account");
		Map<String, Object> profile = 
			(kakaoAccount != null) 
			? (Map<String, Object>)kakaoAccount.get("profile")
			: null
		;

		String nickname = 
			(profile != null) 
			? (String) profile.get("nickname") 
			: "default"  // 2. 카카오가 OIDC(평면) 형태로 데이터를 줄 때 (코드 아래의 샘플 데이터 형태)
		;
		String email = 
			(kakaoAccount != null) 
			? (String) kakaoAccount.get("email") 
			: "default"
		;

				
		return OAuth2DTO.builder()
			.registrationId(registrationId)
			.name(nickname)
			.email(email)  //*이메일 : 카카오에서 제공하지 않음, 직접 입력해야함
			.attributes(attributes)  //사용자 정보
			.nameAttributeKey(userNameAttributeName)  //사용자 PK
			.build();
    
	}
	
	
	//Naver 사용자 데이터를 추출
	private static OAuth2DTO ofNaver(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {

		Object responseObj = attributes.get("response");
		Map<String, Object> response = 
			(responseObj instanceof Map) 
			? (Map<String, Object>) responseObj 
			: attributes
		;

		return OAuth2DTO.builder()
            .registrationId(registrationId)
            .name((String)response.get("name"))
            .email((String)response.get("email"))
            .attributes(response)  //사용자 정보
            .nameAttributeKey(userNameAttributeName)  //사용자 PK
            .build();
		
	}
	
	

	//Member 엔티티로 데이터 주입
	public Member toEntity() {
		
		Member member = new Member();
        //랜덤 UUID 생성
        String randomString = UUID.randomUUID().toString().substring(0, 8);

        member.setId(this.registrationId + "_" + randomString);
        member.setPassword(randomString);  //초기 비밀번호는 UUID와 같음
        member.setName(this.name);
        member.setEmail(this.email);
        member.setPhone(randomString);
        member.setRole(MemberRole.USER);
        member.setRegNo(randomString);
        member.setCreatedAt(LocalDateTime.now());
        //수정일 없음
        
        return member;
		
	}

}

/*
원시 데이터 예시: 

[Google에서 제공하는 사용자 정보)]
{
	sub=107123782853678978866,
	name=배수지, 
	given_name=수지, 
	family_name=배, 
	picture=https://lh3.googleusercontent.com/a-/AFdZucppLJTanskdjfbksjdhfoisdfXSA=s96-c, 
	email=suzi@gmail.com, 
	email_verified=true, 
	locale=ko
}


[Kakao에서 제공하는 사용자 정보)]
{
  id=4891380236, 
	connected_at=2026-05-12T02:48:09Z, 	
  properties={
		nickname=유소은,
		profile_image=http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg,
		thumbnail_image=http://img1.kakaocdn.net/thumb/R110x110.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg},
		kakao_account={
			profile_nickname_needs_agreement=false, 
			profile_image_needs_agreement=false, 
			profile={
				nickname=유소은,
        thumbnail_image_url=http://img1.kakaocdn.net/thumb/R110x110.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg,
        profile_image_url=http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg, 
				is_default_image=true, 
				is_default_nickname=false
			}, 
			has_email=true, 
			email_needs_agreement=true
		}
  }
}


[Naver에서 제공하는 사용자 정보)]
{
  "resultcode": "00",
  "message": "success",
  "response": {
    "email": "openapi@naver.com",
    "nickname": "OpenAPI",
    "profile_image": "https://ssl.pstatic.net/static/pwe/address/nodata_33x33.gif",
    "age": "40-49",
    "gender": "F",
    "id": "32742776",
    "name": "오픈 API",
    "birthday": "10-01",
    "birthyear": "1900",
    "mobile": "010-0000-0000"
  }
}

*/

