import axios from 'axios';
import config from '../config/index.js';

const instance = axios.create({
  baseURL: 'https://api.pinterest.com',
  timeout: config.PINTEREST_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
  },
});

instance.interceptors.request.use((c) => {
  c.headers.Authorization = `Bearer ${config.PINTEREST_ACCESS_TOKEN}`;
  return c;
});

const searchPins = ({
  query,
  pageSize = config.PINTEREST_PAGE_SIZE,
}) => instance.get('/v5/search/pins', {
  params: {
    query,
    page_size: pageSize,
  },
});

const searchBoards = ({
  query,
  pageSize = config.PINTEREST_PAGE_SIZE,
}) => instance.get('/v5/search/boards', {
  params: {
    query,
    page_size: pageSize,
  },
});

const getUserAccount = () => instance.get('/v5/user_account');

export {
  searchPins,
  searchBoards,
  getUserAccount,
};

export default null;
