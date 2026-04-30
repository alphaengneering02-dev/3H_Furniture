package com.cmyk.threeh.dto;

import com.cmyk.threeh.domain.Admins;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeliveryDTO {

    
    private Admins admin;

    private Long deliveryId;
    private Long adminId;
    private String adminName;
    private String companyName;
    private String businessName;
    private String businessPhone;
    private String businessNo;
    private String businessAddr;
    private String deliveryName;
    private String deliveryPhone;
    private String deliveryCarNo;
    
}