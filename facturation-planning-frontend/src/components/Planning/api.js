// src/components/Planning/api.js
import axios from "../../axiosInstance";

export const fetchPlannings = () => axios.get("/plannings");
export const fetchSalaries = () => axios.get("/salaries");
export const fetchProfile = () => axios.get("/profile");
export const fetchClients = () => axios.get("/clients");

export const createPlanning = (payload) => axios.post("/plannings", payload);
export const updatePlanning = (id, payload) => axios.put(`/plannings/${id}`, payload);
