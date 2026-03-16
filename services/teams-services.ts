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
