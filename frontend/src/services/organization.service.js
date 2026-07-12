import { api } from "../api/axios.js";

// ─── Departments ─────────────────────────────────────────────────

export const getDepartments = async () => {
  const { data } = await api.get("/departments");
  return data.data?.departments || [];
};

export const createDepartment = async (body) => {
  const { data } = await api.post("/departments", body);
  return data.data?.department;
};

export const updateDepartment = async (id, body) => {
  const { data } = await api.patch(`/departments/${id}`, body);
  return data.data?.department;
};

export const deleteDepartment = async (id) => {
  await api.delete(`/departments/${id}`);
};

// ─── Asset Categories ────────────────────────────────────────────

export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data.data?.categories || [];
};

export const createCategory = async (body) => {
  const { data } = await api.post("/categories", body);
  return data.data?.category;
};

export const updateCategory = async (id, body) => {
  const { data } = await api.patch(`/categories/${id}`, body);
  return data.data?.category;
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};

// ─── Employees ───────────────────────────────────────────────────

export const getEmployees = async () => {
  const { data } = await api.get("/employees");
  return data.data?.employees || [];
};

export const updateEmployeeRole = async (id, body) => {
  const { data } = await api.patch(`/employees/${id}`, body);
  return data.data?.employee;
};
