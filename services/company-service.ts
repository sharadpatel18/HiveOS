import axios, { AxiosError } from "axios";
import { ICompany } from "@/types/company";
import { useCompanyStore } from "@/store/company-store";

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

export const getCompanyByUserId = async () => {
  try {
    // const { company, setCompany } = useCompanyStore.getState();

    // if (company) {
    //   console.log("API IS NOT CALL");
    //   return company;
    // }

    // console.log("yes it's true -------------");
    const response = await axios.get("/api/company");
    // setCompany(response.data[0]);
    console.log("API IS CALL");

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
