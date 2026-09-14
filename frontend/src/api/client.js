//client fetch

const BASE_URL = '/api';

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
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
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${BASE_URL}${path}`, options);
    
    const text = await response.text();
    let data = text;
    try {
        data = JSON.parse(text);
    } catch (error) {
        // If parsing fails, data will remain as the original text
    }

    if (!response.ok) {
        const error = new Error(
            typeof data === 'string' ? data : data?.message || res.statusText
        );
        error.status = { status: res.status, data };
        throw error;
    }
    return { data, status: response.status };
}

const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
};

export default api;