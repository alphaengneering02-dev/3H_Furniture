package com.cmyk.threeh.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberRole {

    //enum 생성자 : 상수(key, title)
	ADMIN("ROLE_ADMIN", "관리자"),
	USER("ROLE_USER", "일반 고객");
	
	//enum 생성자의 인수들
	private final String key;
	private final String title;
    
}
