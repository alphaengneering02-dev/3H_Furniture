export const getUrl = (url) => {
    if(!url) return '';

    return url.startsWith('http') ? url : `http://localhost:8080${url}`;
};