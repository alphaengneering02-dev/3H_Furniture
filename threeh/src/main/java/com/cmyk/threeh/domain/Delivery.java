package com.cmyk.threeh.domain;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DELIVERY_ID")
    private Long deliveryId;

    @Column(name = "ADMIN_ID", nullable = false)
    private Long adminId;

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