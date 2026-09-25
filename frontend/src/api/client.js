//This page is a shared API client that can be used to make requests to the backend. It handles the base URL, headers,
//and error handling for all requests.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json', //tell the backend we are sending JSON data
    };
    const token = localStorage.getItem('token'); //If the user is logged in, we will have a token stored in localStorage. We will add it to the headers for authentication.
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function request (method, path, body = null) {
    const options = {
        method,
        headers: getHeaders(),
    };

    //for POST and PUT requests, we need to send the body as JSON. For GET and DELETE requests, we don't need to send a body.
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${BASE_URL}${path}`, options);
    
    //We will try to parse the response as JSON. If it fails, we will return the text response instead.
    //This is useful for error messages that are not in JSON format.
    const text = await response.text(); 
    let data = text;
    try {
        data = JSON.parse(text);
    } 
    //If the response is not JSON, we will just return the text response.
    //This is useful for error messages that are not in JSON format.
    catch (error) {
        data = text || 'An error has occurred.'; //If the response is empty, this will return a generic error message.
    }

    // Makes sure that if the response is not ok, we throw an error with the status and data
    if (!response.ok) {
        const error = new Error(
            typeof data === 'string' ? data : data?.message || response.statusText
        );
        error.status = { status: response.status, data };
        throw error;
    }
    return { data, status: response.status };
}
//The api object is a wrapper around the request function that provides a simpler interface for making requests.
//It has methods for each HTTP method (GET, POST, PUT, DELETE) that take a path and an optional body. 
//The path is appended to the base URL, and the body is sent as JSON for POST and PUT requests.
const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
};

export default api;