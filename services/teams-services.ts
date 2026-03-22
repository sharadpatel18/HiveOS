import { useCompany } from "@/hooks/use-company";
import Axios, { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

type ITeam = {
  name: string;
  slug: string;
  description: string;
  personalTeam: boolean;
  teamleadId: string;
  companyId: string;
};

export const createTeam = async (data: ITeam) => {
  try {
    const response = await Axios.post("/api/teams", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getTeams = async () => {
  try {
    // const { data: company } = useCompany();
    const response = await Axios.get(`/api/teams`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getTeamsById = async (id: string) => {
  try {
    console.log(id);
    const response = await Axios.get(`/api/teams/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const addTeamMember = async (data: {
  userId: string;
  teamId: string;
  role: string;
}) => {
  try {
    const response = await Axios.post("/api/teams/members", data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getTeamMembersByEmail = async (email: string) => {
  try {
    const response = await Axios.get(`/api/teams/members?email=${email}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong. Please try again.");
  }
};
