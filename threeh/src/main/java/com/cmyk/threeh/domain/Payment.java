package com.cmyk.threeh.domain;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;


import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.enums.PayType;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@Table(indexes = {
    @Index(name = "idx_payment_member", columnList = "member_id"),
    @Index(name = "idx_payment_paymentKey", columnList = "payment_key"),
})
public class Payment {
    
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
    @SequenceGenerator(name = "payment_seq", sequenceName = "PAYMENT_SEQ", allocationSize = 1)
    @Column(name = "payment_id", nullable = false, unique = true)
    private Long paymentId;

    @Column(name = "pay_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PayType payType;

    @Column(name = "pay_amount", nullable = false)
    private Long amount;

    @Column(name = "pay_name", nullable = false)
    private String orderName;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    private boolean paySuccessYN;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "payment_key")
    private String paymentKey;

    @Column
    private String failReason;

    @Column
    private boolean cancelYN;

    @Column
    private String cancelReason;

    @Column
    private String createdAt;


    public PaymentResponseDTO toPaymentResponseDTO(){
        return PaymentResponseDTO.builder()
            .payType(payType.getDescription())
            .amount(amount)
            .orderName(orderName)
            .orderId(orderId)
            .customerEamil(member.getEmail())
            .customerName(member.getName())
            .createdAt(String.valueOf(getCreatedAt()))
            .cancelYN(cancelYN)
            .failReason(failReason)
            .build();
    }
}
