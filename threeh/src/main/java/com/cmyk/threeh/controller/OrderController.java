package com.cmyk.threeh.controller;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.MemberAddress;
import com.cmyk.threeh.domain.OrderItem;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.dto.OrderFormDTO;
import com.cmyk.threeh.dto.OrderRequestDTO;
import com.cmyk.threeh.dto.OrderResponseDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/order")
public class OrderController {
    
    private final OrderService orderService;
    private final ItemService itemService;
    private final MemberService memberService;
    private final MemberAddressService memberAddressService;
    private final OrderRepository orderRepository;

    //주문 화면 들어올시
    @GetMapping("/{itemId}")
    public ResponseEntity getOrder(@PathVariable Long itemId, @AuthenticationPrincipal User user){

        ItemResponseDTO item = itemService.getItem(itemId);
        Member member = memberService.findMember(user.getUsername());

        //기본주소지 조회
        MemberAddressDTO defaultAddress = memberAddressService.getDefaultAddressForOrder(member.getId());

        OrderFormDTO orderFormDTO = OrderFormDTO.builder()
            .itemId(item.getItemId())
            .itemName(member.getName())
            .itemDetail(item.getItemDetail())
            .price(item.getItemPrice())
            .stock(item.getItemStock())
            .memberName(member.getName())
            .email(member.getEmail())
            .phone(member.getPhone())
            .defaultAddr(defaultAddress != null ? defaultAddress.getAddr() : null)
            .defualtAddrDetail(defaultAddress != null ? defaultAddress.getAddrdetail() : null)
            .defaultZipCode(defaultAddress != null ? defaultAddress.getZipcode() : null)
            .isDefault(defaultAddress != null ? defaultAddress.getIsdefault() : "N")
            .build();

        return ResponseEntity.ok().body(orderFormDTO);
    }

    //주문 생성
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity orderCreate(@RequestBody OrderRequestDTO dto, @AuthenticationPrincipal User user){

        //상품 조회
        List<OrderRequestDTO.OrderItemDTO> orderItems = dto.getOrderitems();

        //주문생성

        Long orderId = orderService.order(
            dto.getMemberId(),
            orderItems,
            dto.getDeliveryAddr(),
            dto.getDeliveryAddrDetail(),
            dto.getZipCode(),
            dto.getOrderType()
        );

        return ResponseEntity.ok().body(orderId);
    }


}
