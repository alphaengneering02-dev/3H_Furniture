package com.cmyk.threeh.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {

    private Long cartId;    
    private Long memberId;  
    
    private List<CartItemDTO> cartItems;

}