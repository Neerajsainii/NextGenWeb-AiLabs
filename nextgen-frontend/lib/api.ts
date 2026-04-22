import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
});

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitContact(payload: ContactPayload) {
  const { data } = await api.post("/contact/", payload);
  return data as { success: boolean; message: string };
}

export default api;
