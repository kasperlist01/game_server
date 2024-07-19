export const fetchData = async () => {
    // Тут будет ваш код для запроса к серверу
    return fetch('https://your-api-url.com/data').then(response => response.json());
};
