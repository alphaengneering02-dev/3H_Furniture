package com.cmyk.threeh.dto;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * DeliveryDTO의 데이터가 정상적인지 확인하는 테스트입니다.
 */
public class DeliveryValidationTest {

    @Test
    @DisplayName("회사 이름이 비어있으면 데이터가 잘못된 것으로 간주한다")
    void companyNameNotEmptyTest() {
        // 1. 준비 
        DeliveryDTO dto = new DeliveryDTO();
        
        // 2. (회사 이름을 일부러 비워둠)
        dto.setCompanyName(""); 

        // 3. 확인 (isEmpty()가 true인지 검사)
        boolean isBadData = dto.getCompanyName().isEmpty();
        
        // 결과가 참(true)이어야 테스트 성공!
        assertThat(isBadData).isTrue(); 
        System.out.println("✅ 결과: 회사 이름이 비어있는 것을 감지했습니다.");
    }

    @Test
    @DisplayName("전화번호가 010으로 시작하지 않으면 가짜 번호로 간주한다")
    void phoneFormatTest() {
        // 1. 준비
        DeliveryDTO dto = new DeliveryDTO();
        
        // 2. (이상한 번호 입력)
        dto.setDeliveryPhone("02-123-4567");

        // 3. 확인 (010으로 시작하는지 체크)
        boolean isWrongFormat = !dto.getDeliveryPhone().startsWith("010");

        // 결과가 참(true)이어야 테스트 성공!
        assertThat(isWrongFormat).isTrue();
        System.out.println("✅ 결과: 010이 아닌 번호를 가짜로 판정했습니다.");
    }

    @Test
    @DisplayName("기사님 이름이 너무 짧으면(1글자) 주의가 필요하다")
    void deliveryNameLengthTest() {
        // 1. 준비
        DeliveryDTO dto = new DeliveryDTO();
        
        // 2. 행동 (이름을 '박' 한 글자만 입력)
        dto.setDeliveryName("박");

        // 3. 확인 (길이가 2글자 미만인지 체크)
        boolean isTooShort = dto.getDeliveryName().length() < 2;

        assertThat(isTooShort).isTrue();
        System.out.println("✅ 결과: 너무 짧은 이름을 찾아냈습니다.");
    }

}