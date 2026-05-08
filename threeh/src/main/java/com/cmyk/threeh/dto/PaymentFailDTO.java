package com.cmyk.threeh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class PaymentFailDTO {

    String erroCode;

    String erroMessage;

    String orderId;
     
}

