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
	private String picture;
	

	@Builder
	public OAuth2DTO(String registrationId, Map<String, Object> attributes, String nameAttributeKey, String name, String email, String picture) {

        this.registrationId = registrationId;
		this.attributes = attributes;
		this.nameAttributeKey = nameAttributeKey;
		this.name = name;
		this.email = email;
		this.picture = picture;
		
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
            .picture((String)attributes.get("picture"))
            .attributes(attributes)  //사용자 정보
            .nameAttributeKey(userNameAttributeName)  //사용자 PK
            .build();

	}
	
	
	//Kakao 사용자 데이터를 추출
	private static OAuth2DTO ofKakao(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
		
		Map<String, Object> kakaoAccount = (Map<String, Object>)attributes.get("kakao_account");  //kakao_account 필드
		Map<String, Object> kakaoProfile = (Map<String, Object>)kakaoAccount.get("profile");
		
		return OAuth2DTO.builder()
            .registrationId(registrationId)
            .name((String)kakaoProfile.get("nickname"))
            .email("email")
            .picture((String)kakaoProfile.get("profile_image_url"))
            .attributes(attributes)  //사용자 정보
            .nameAttributeKey(userNameAttributeName)  //사용자 PK
            .build();
    
	}
	
	
	//Naver 사용자 데이터를 추출
	private static OAuth2DTO ofNaver(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
		
		Map<String, Object> response = (Map<String, Object>)attributes.get("response");
		
		return OAuth2DTO.builder()
            .registrationId(registrationId)
            .name((String)response.get("name"))
            .email((String)response.get("email"))
            .picture((String)response.get("profile_image"))
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
        // member.setPicture(this.picture);  //사진도 업데이트 한다면 추가
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
  "aud": "${APP_KEY}",
  "sub": "${USER_ID}",
  "auth_time": 1661967952,
  "iss": "https://kauth.kakao.com",
  "exp": 1661967972,
  "iat": 1661967952,
  "nickname": "JordyTest",
  "picture": "http://yyy.kakao.com/.../img_110x110.jpg",
  "email": "jordy@kakao.com"
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

