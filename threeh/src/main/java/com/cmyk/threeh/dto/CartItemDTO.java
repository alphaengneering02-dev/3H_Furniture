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
public class CartItemDTO {

    private Long cartitemId;    
    private Long itemid;
    private Long cartid;
    private Long count;
    
    private List<CartDTO> cartItems;

}
