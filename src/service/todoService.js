// src/api/todoService.js
import { apiRequest } from "../api/apiHelper";

const BASE_URL = "http://localhost:3000/todos";

export const todoService = {
  getAll: () => apiRequest("get", BASE_URL),
  getById: (id) => apiRequest("get", `${BASE_URL}/${id}`),
  getByQuery: (param) => {
    const queryString = new URLSearchParams(param).toString();
    return apiRequest("get", `${BASE_URL}?${queryString}`);
  },
  create: (todo) => apiRequest("post", BASE_URL, todo),
  update: (id, updatedTodo) => apiRequest("put", `${BASE_URL}/${id}`, updatedTodo),
  patch: (id, partialTodo) => apiRequest("patch", `${BASE_URL}/${id}`, partialTodo),
  delete: (id) => apiRequest("delete", `${BASE_URL}/${id}`),
};
