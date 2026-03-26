import { useCompany } from "@/hooks/use-company";
import Axios, { AxiosError } from "axios";
import { toast } from "sonner";

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
    if (response.status === 200) {
      toast.success(response.data.message);
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    toast.error("Something went wrong. Please try again.");
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
      toast.error(err.response.data.message);
      throw new Error(err.response.data.message);
    }
    toast.error("Something went wrong. Please try again.");
    throw new Error("Something went wrong. Please try again.");
  }
};

export const getTeamsById = async (id: string) => {
  try {
    const response = await Axios.get(`/api/teams/${id}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      // toast.error(err.response.data.message);
      throw new Error(err.response.data.message);
    }
    // toast.error("Something went wrong. Please try again.");
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
    toast.success("Member added successfully.");
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
      throw new Error(err.response.data.message);
    }
    toast.error("Something went wrong. Please try again.");
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
      toast.error(err.response.data.message);
      throw new Error(err.response.data.message);
    }
    toast.error("Something went wrong. Please try again.");
    throw new Error("Something went wrong. Please try again.");
  }
};

export const deleteTeamMembers = async (id: string) => {
  try {
    const response = await Axios.delete(`/api/teams/members/${id}`);
    if (response.data.success === true) {
      toast.success(response.data.message);
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
      throw new Error(err.response.data.message);
    }
    toast.error("Something went wrong. Please try again.");
    throw new Error("Something went wrong. Please try again.");
  }
};
