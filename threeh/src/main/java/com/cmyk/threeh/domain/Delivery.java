package com.cmyk.threeh.domain;

import java.util.List;

import javax.persistence.*;

import com.cmyk.threeh.enums.DeliveryStatus;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "DELIVERY")
@Getter
@Setter
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "delivery_seq")
    @SequenceGenerator(name = "delivery_seq", sequenceName = "DELIVERY_SEQ", allocationSize = 1)
    @Column(name = "DELIVERY_ID")
    private Long deliveryId;

    @ManyToOne(fetch = FetchType.LAZY) //불필요한 쿼리 나오는걸 제어
    @JoinColumn(name = "ADMIN_ID", nullable = false)
    private Admins admin;
    
   @Embedded
    private Adress businessAddAdress;

    @Column(name = "COMPANY_NAME", nullable = false)
    private String companyName;

    @Column(name = "BUSINESS_NAME", nullable = false)
    private String businessName;

    @Column(name = "BUSINESS_PHONE", nullable = false)
    private String businessPhone;

    @Column(name = "BUSINESS_NO", nullable = false)
    private String businessNo;

    @Column(name = "BUSINESS_ADDR", nullable = false)
    private String businessAddr;

    @Column(name = "DELIVERY_NAME", nullable = false)
    private String deliveryName;

    @Column(name = "DELIVERY_PHONE", nullable = false)
    private String deliveryPhone;

    @Column(name = "DELIVERY_CARNO", nullable = false)
    private String deliveryCarNo;


    @Column(name = "STATUS")
    @Enumerated(EnumType.STRING) 
    private DeliveryStatus status = DeliveryStatus.WAITING;


}