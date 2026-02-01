import axios, { AxiosError } from "axios";

interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface LoginUser {
  email: string;
  password: string;
}

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

export const createUser = async (data: User) => {
  try {
    const response = await axios.post("/api/auth/signup", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const loginUser = async (data: LoginUser) => {
  try {
    const response = await axios.post("/api/auth/login", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};
