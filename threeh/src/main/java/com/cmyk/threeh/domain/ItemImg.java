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
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.cmyk.threeh.enums.SubimgYn;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "item_img")
public class ItemImg {

   @Id
   @GeneratedValue(strategy = GenerationType.AUTO)
   private long itemImgId;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "item")
   private int ItemId;

   @Column(name = "img_name",nullable = false,length = 255)
   private String ImgName;

   @Column(name ="img_url",nullable = false,length = 500)
   private String ImgUrl;
   
   @Column(name = "sub_img_url",nullable = true, length = 500)
   private String SubImgUrl;

   @Enumerated(EnumType.STRING)
   @Column(name = "subimg_yn",nullable = false, length = 1)
   private SubimgYn subimgYn = SubimgYn.Y;

}
