package com.cmyk.threeh.form;

import java.time.LocalDateTime;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.cmyk.threeh.enums.MemberRole;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class SignupUpdateForm {

    private Long memberId;

    @Size(min = 3, max = 30, message = "아이디의 길이가 맞지 않습니다.")
	@NotBlank(message = "아이디는 필수항목입니다.")
    private String id;

    @Size(min = 3, max = 30, message = "비밀번호의 길이가 맞지 않습니다.")
	@NotBlank(message = "비밀번호는 필수항목입니다.")
    private String password1;

    //비밀번호 재확인
    @Size(min = 3, max = 30, message = "비밀번호 재확인의 길이가 맞지 않습니다.")
	@NotBlank(message = "비밀번호 재확인은 필수항목입니다.")
    private String password2;

	@NotBlank(message = "이름 또는 회사명은 필수항목입니다.")
    private String name;

    @NotBlank(message = "이메일은 필수항목입니다.")
    @Email(
        regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
        message = "이메일 형식이 유효하지 않습니다."
    )
    private String email;

    @NotBlank(message = "전화번호 또는 사업장 전화번호는 필수항목입니다.")
    private String phone;

    private MemberRole role;

    @NotBlank(message = "주민등록번호는 필수항목입니다.")
    @Pattern(
        regexp = "^\\d{6}-[1-4]\\d{6}$",
        message = "주민등록번호 형식이 유효하지 않습니다."
    )
    private String regNo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
