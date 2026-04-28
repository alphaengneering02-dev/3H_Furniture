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
    @Column(name = "addr_id")
    private Long addrId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "addr", nullable = false)
    private String addr;

    @Column(name = "addr_detail")
    private String addrDetail;

    @Column(name = "is_default", length = 1)
    private String isDefault = "N"; 
}