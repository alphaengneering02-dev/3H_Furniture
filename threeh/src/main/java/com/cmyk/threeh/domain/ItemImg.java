package com.cmyk.threeh.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.cmyk.threeh.enums.SubImg;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "ITEM_IMG")
public class ItemImg {

   @Id
   @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "item_Img_seq")
   @SequenceGenerator(name = "item_Img_seq",sequenceName = "ITEM_IMG_SEQ",allocationSize=1)
   @Column(name="ITEM_IMG_ID")
   private long itemImgId;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "ITEM_ID",nullable = false)
   private Item item;

   @Column(name = "ITEM_IMG_NAME",nullable = false,length = 255)
   private String itemImgName;

   @Column(name ="ITEM_IMG_URL",nullable = false,length = 500)
   private String itemImgUrl;
   
   @Column(name = "ITEM_SUB_IMG_URL",nullable = true, length = 500)
   private String itemSubImgUrl;

   @Enumerated(EnumType.STRING)
   @Column(name = "SUBIMG_YN",nullable = false, length = 1)
   private SubImg thumbnailYn = SubImg.N;
   //대표이미지는 1개, 일반 이미지는 여러개니까 기본값이 N이 더 안전

}
