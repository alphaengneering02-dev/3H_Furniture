import React from 'react';

const SearchResult_item = ({item}) => {
    return (
        <div>
            {item.itemId}
            {item.itemCategory}
            {item.itemName}
            {item.itemDetail}
        </div>
    );
};

export default SearchResult_item;