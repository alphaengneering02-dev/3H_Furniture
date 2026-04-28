package com.cmyk.threeh.domain;


import java.time.LocalTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "payment")
@NoArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
    @SequenceGenerator(name = "payment_seq", sequenceName = "PAYMENT_SEQ", allocationSize = 1)
    @Column(name = "payment_id")
    private Long paymentId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders orders;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "payment_amount", nullable = false)
    private int paymentAmount;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Column(name = "payment_state", nullable = false, length = 50)
    private String paymentState;

    @Column(name = "imp_uid", nullable = true, length = 255)
    private String impUid;

    @Column(name = "merchant_uid", nullable = false, length = 255)
    private String merchantUid;

    @Column(name = "created_at", nullable = true)
    private LocalTime created_at;

}
