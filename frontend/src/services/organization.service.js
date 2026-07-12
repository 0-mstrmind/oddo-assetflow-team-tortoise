import { api } from "../api/axios.js";

// sendResponse spreads data into root: { success, message, ...data }
// so axios response shape is: response.data.employees (NOT response.data.data.employees)

// ─── Departments ─────────────────────────────────────────────────

export const getDepartments = async () => {
  const { data } = await api.get("/departments");
  return data.departments || [];
};

export const createDepartment = async (body) => {
  const { data } = await api.post("/departments", body);
  return data.department;
};

export const updateDepartment = async (id, body) => {
  const { data } = await api.patch(`/departments/${id}`, body);
  return data.department;
};

export const deleteDepartment = async (id) => {
  await api.delete(`/departments/${id}`);
};

// ─── Asset Categories ────────────────────────────────────────────

export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data.categories || [];
};

export const createCategory = async (body) => {
  const { data } = await api.post("/categories", body);
  return data.category;
};

export const updateCategory = async (id, body) => {
  const { data } = await api.patch(`/categories/${id}`, body);
  return data.category;
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};

// ─── Employees ───────────────────────────────────────────────────

export const getEmployees = async () => {
  const { data } = await api.get("/employees");
  return data.employees || [];
};

export const updateEmployeeRole = async (id, body) => {
  const { data } = await api.patch(`/employees/${id}`, body);
  return data.employee;
};
