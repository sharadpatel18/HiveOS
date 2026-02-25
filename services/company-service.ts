import axios, { AxiosError } from "axios";
import { ICompany } from "@/types/company";

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

interface IJoin {
  id: string;
  role: string;
  token: string;
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

export const getCompanyMembersById = async (id: string) => {
  try {
    const response = await axios.get(`/api/company/members/${id}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const inviteUserToCompany = async (data: {
  companyId: string;
  email: string;
  role: string;
}) => {
  try {
    const response = await axios.post("/api/company/invite", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getInvitationById = async () => {
  try {
    const response = await axios.get("/api/company/invite");
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const joinCompanyReq = async (data: IJoin) => {
  try {
    const response = await axios.post("/api/company/invite/join", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};
