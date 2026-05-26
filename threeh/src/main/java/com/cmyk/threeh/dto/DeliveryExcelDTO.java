package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeliveryExcelDTO {

    private String companyName;
    private String businessName;
    private String businessNo;
    private String businessPhone;
    private String businessAddr;
    private String deliveryName;
    private String deliveryPhone;
    private String deliveryCarNo;
    
    private String status;

    private String failReason;
}
