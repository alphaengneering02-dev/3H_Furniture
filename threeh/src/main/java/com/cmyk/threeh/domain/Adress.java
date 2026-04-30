package com.cmyk.threeh.domain;

import javax.persistence.Embeddable;


/**
 * 
 * value Object (vo)
 */
@Embeddable
public class Adress { 

    private String city;
    private String street;
    private String zipcode;
    
    protected Adress() {}

    public Adress(String city, String street, String zipcode){
        this.city = city;
        this.street = street;
        this.zipcode = zipcode;
    }
}
