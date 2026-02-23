import axios, { AxiosError } from "axios";
import { ICompany } from "@/types/company";

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

export const getCompanyByUserId = async () => {
  try {
    const response = await axios.get("/api/company");
    if (!response.data || response.data.length === 0) {
      return null; // ✅ Always return something
    }

    return response.data[0];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const createCompany = async (data: ICompany) => {
  try {
    const response = await axios.post("/api/company", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};
