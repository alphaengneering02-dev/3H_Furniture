package com.cmyk.threeh.form;

import java.time.LocalDateTime;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.cmyk.threeh.enums.MemberRole;

import lombok.Data;

@Data
public class SignupUpdateForm {

    private Long memberId;

    @Size(min = 3, max = 30, message = "아이디의 길이가 맞지 않습니다.")
	@NotBlank(message = "아이디는 필수항목입니다.")
    private String id;

    @Size(min = 6, max = 30, message = "비밀번호의 길이가 맞지 않습니다.")
	@NotBlank(message = "비밀번호는 필수항목입니다.")
    private String password1;

    //비밀번호 재확인
    @Size(min = 6, max = 30, message = "비밀번호 재확인의 길이가 맞지 않습니다.")
	@NotBlank(message = "비밀번호 재확인은 필수항목입니다.")
    private String password2;

	@NotBlank(message = "이름은 필수항목입니다.")
    private String name;

    @NotBlank(message = "이메일은 필수항목입니다.")
    @Email(
        regexp = "^[a-zA-Z0-9_-]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,6}$",
        message = "이메일 형식이 유효하지 않습니다."
    )
    private String email;

    @NotBlank(message = "이메일은 필수항목입니다.")
    private String phone;

    private MemberRole role;

    @NotBlank(message = "주민등록번호는 필수항목입니다.")
    @Pattern(
        regexp = "/^d{2}([0]\\d|[1][0-2])([0][1-9]|[1-2]\\d|[3][0-1])[-]*[1-4]\\d{6}$/",
        message = "주민등록번호 형식이 유효하지 않습니다."
    )
    private String regNo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
