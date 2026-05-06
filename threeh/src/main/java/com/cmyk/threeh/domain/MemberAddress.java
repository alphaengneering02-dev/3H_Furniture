package com.cmyk.threeh.domain;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member_address")
@Getter 
@Setter
@NoArgsConstructor
public class MemberAddress {

    //배송지 고유 번호 (PK) - 시퀀스 전략 사용
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mem_addr_seq")
    @SequenceGenerator(name = "mem_addr_seq", sequenceName = "MEM_ADDR_SEQ", allocationSize = 1)
    @Column(name = "address_id")
    private Long addrId;

    //배송지 소유 회원 - 회원 삭제 시 배송지도 함께 관리하기 위해 연관관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 실제 DB 컬럼 ADDR 컬럼과 매핑 - 전체 주소 텍스트 저장
    @Column(name = "addr", nullable = false, length = 500)
    private String addr;

    @Embedded
    private Adress adressl; // 조장님 VO (city, street, zipcode)

    //상세 주소 - VO 외 별도 관리를 위한 필드
    @Column(name = "addr_detail")
    private String addrDetail;

    //기본 배송지 여부 - 'Y'일 경우 주문서 작성 시 자동으로 불러오는 로직
    @Column(name = "is_default", length = 1)
    private String isDefault = "N"; 

}
