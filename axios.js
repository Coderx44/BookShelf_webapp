const axios=require('axios');
axios.get('/books/add');
const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoic3VyZW4uamFudUBnbWFpbC5jb20iLCJpYXQiOjE2MTU0ODIzNDV9.mrQauqKukblrr6laQTV7hV4_AYHs3dAXY-D8WITkvh8';
axios.interceptors.request.use(
    config=>{
        config.headers.authorization=  `Bearer ${token}`;
        return config;
    },
    error=>{
        return Promise.reject(error);
    }
);