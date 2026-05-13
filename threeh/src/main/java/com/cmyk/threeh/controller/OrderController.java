package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;



import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.CartItem;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.ItemImgResponseDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.dto.OrderFormDTO;
import com.cmyk.threeh.dto.OrderRequestDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.CartItemRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.service.ItemImgService;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberAddressService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;
    private final ItemService itemService;
    private final MemberService memberService;
    private final MemberAddressService memberAddressService;
    private final OrderRepository orderRepository;
    private final ItemImgService itemImgService;
    private final CartItemRepository cartItemRepository;

    /** 장바구니로 올시 */
    @PostMapping("/form")
    public ResponseEntity getOrderForm(@RequestBody List<Long> cartItemIds, Principal principal) {

        Member member = memberService.getUser(principal.getName());
        MemberAddressDTO defaultAddress = memberAddressService.getDefaultAddressForOrder(member.getId());

        List<OrderFormDTO.OrderItemInfo> items = cartItemIds.stream()
                .map(cartItemId -> {
                    CartItem cartItem = cartItemRepository.findById(cartItemId)
                            .orElseThrow(() -> new CustomException(ErrorCode.ITEM_NOT_FOUND));

                    ItemImgResponseDTO itemImage = itemImgService.getMainImg(cartItem.getItem().getItemId());

                    return OrderFormDTO.OrderItemInfo.builder()
                            .itemId(cartItem.getItem().getItemId())
                            .itemName(cartItem.getItem().getItemName())
                            .itemDetail(cartItem.getItem().getItemDetail())
                            .price(cartItem.getItem().getItemPrice())
                            .count(cartItem.getCount())
                            .itemImage(itemImage.getItemImgUrl())
                            .build();
                })
                .collect(Collectors.toList());

        OrderFormDTO orderFormDTO = OrderFormDTO.builder()
                .items(items)
                .memberName(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .defaultAddr(defaultAddress != null ? defaultAddress.getAddr() : null)
                .defaultAddrDetail(defaultAddress != null ? defaultAddress.getAddrdetail() : null)
                .defaultZipCode(defaultAddress != null ? defaultAddress.getZipcode() : null)
                .isDefault(defaultAddress != null ? defaultAddress.getIsdefault() : "N")
                .build();

        return ResponseEntity.ok().body(orderFormDTO);
    }

    // 주문 화면 들어올시
    @GetMapping("/{itemId}")
    public ResponseEntity getOrder(@PathVariable Long itemId, Principal principal) {

        ItemResponseDTO item = itemService.getItem(itemId);
        ItemImgResponseDTO itemImage = itemImgService.getMainImg(itemId);

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        Member member = memberService.getUser(principal.getName());

        try {
            itemImage = itemImgService.getMainImg(itemId);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        // 기본주소지 조회
        MemberAddressDTO defaultAddress = memberAddressService.getDefaultAddressForOrder(member.getId());

        OrderFormDTO orderFormDTO = OrderFormDTO.builder()
                .itemId(item.getItemId())
                .itemName(item.getItemName())
                .itemDetail(item.getItemDetail())
                .price(item.getItemPrice())
                .stock(item.getItemStock())
                .itemIamge(itemImage.getItemImgUrl())
                .memberName(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .defaultAddr(defaultAddress != null ? defaultAddress.getAddr() : null)
                .defaultAddrDetail(defaultAddress != null ? defaultAddress.getAddrdetail() : null)
                .defaultZipCode(defaultAddress != null ? defaultAddress.getZipcode() : null)
                .isDefault(defaultAddress != null ? defaultAddress.getIsdefault() : "N")
                .build();

        return ResponseEntity.ok().body(orderFormDTO);
    }

    // 주문 생성
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity orderCreate(@RequestBody OrderRequestDTO dto, Principal principal) throws Exception {

        // 상품 조회
        List<OrderRequestDTO.OrderItemDTO> orderItems = dto.getOrderItems();

        // 주문생성

        try {
            Long orderId = orderService.order(
                    dto.getMemberId(),
                    orderItems,
                    dto.getDeliveryAddr(),
                    dto.getDeliveryAddrDetail(),
                    dto.getZipCode(),
                    dto.getOrderType());

            return ResponseEntity.ok().body(orderId);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
