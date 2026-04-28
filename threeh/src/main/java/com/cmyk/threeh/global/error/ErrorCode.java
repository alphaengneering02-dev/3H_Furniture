package com.cmyk.threeh.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    MEMBER_NOT_FOUND(404, "회원을 찾을 수 없습니다.");

    private final int status;
    private final String message;
}
