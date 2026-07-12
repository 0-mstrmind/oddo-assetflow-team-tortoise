import { api } from "../api/axios.js";

export const getResources = async () => {
  const { data } = await api.get("/resources");
  return data.resources || [];
};

export const getBookings = async (resourceId, date) => {
  const { data } = await api.get(`/bookings/resource/${resourceId}/schedule`, {
    params: { date },
  });
  return data.schedule || [];
};

export const createBooking = async (body) => {
  const { data } = await api.post("/bookings", body);
  return data.booking;
};
