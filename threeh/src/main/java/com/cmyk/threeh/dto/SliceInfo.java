package com.cmyk.threeh.dto;

import org.springframework.data.domain.Pageable;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SliceInfo {

    
    
        private final long getNumber;

        private final long getSize;

        private final long getNumeberOfElements;

        private final  boolean hasNext;

        private final boolean hasPrevious;

        public SliceInfo(Pageable pageable, int getNumeberOfElements, boolean hasNext){
            this.getNumber = pageable.getPageNumber();
            this.getSize = pageable.getPageSize();
            this.getNumeberOfElements = getNumeberOfElements;
            this.hasNext = hasNext;
            this.hasPrevious = pageable.hasPrevious();
        }
    
    
}
