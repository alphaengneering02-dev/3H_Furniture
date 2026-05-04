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

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mem_addr_seq")
    @SequenceGenerator(name = "mem_addr_seq", sequenceName = "MEM_ADDR_SEQ", allocationSize = 1)
    @Column(name = "address_id")
    private Long addrId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 기존의 개별 zipcode, addr 필드는 이 객체가 대신합니다.
    @Embedded
    private Adress adressl;

    //상세주소는 VO에 없으므로 별도 유지
    @Column(name = "addr_detail")
    private String addrDetail;

    //기본배송지 여부 (기본값 'N')
    @Column(name = "is_default", length = 1)
    private String isDefault = "N"; 
}
