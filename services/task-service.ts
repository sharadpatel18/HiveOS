import { UpdateTaskValidationInput } from "@/validations/task.validation";
import axios, { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

export const createTask = async (data: any) => {
  try {
    const response = await axios.post("/api/tasks", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getTasksByTeamId = async (companyId: string, teamId: string) => {
  try {
    const response = await axios.get(
      `/api/tasks?teamId=${teamId}&companyId=${companyId}`,
    );
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getTaskById = async (id: string) => {
  try {
    const response = await axios.get(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const updateTaskById = async (data: UpdateTaskValidationInput) => {
  try {
    const response = await axios.patch(`/api/tasks/${data.id}`, data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const deleteTaskById = async (id: string) => {
  try {
    const response = await axios.delete(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};
