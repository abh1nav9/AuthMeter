import axios, { type AxiosInstance } from "axios";

export interface HibpPwnedPasswordsApiClientProtocol {
  fetchRange(prefix5: string, signal?: AbortSignal): Promise<string>;
}

export class HibpPwnedPasswordsApiClient
  implements HibpPwnedPasswordsApiClientProtocol
{
  private readonly http: AxiosInstance;

  constructor(params?: { http?: AxiosInstance }) {
    this.http =
      params?.http ??
      axios.create({
        baseURL: "https://api.pwnedpasswords.com",
        headers: {
          "Add-Padding": "true",
        },
      });
  }

  async fetchRange(prefix5: string, signal?: AbortSignal): Promise<string> {
    const safePrefix = prefix5.trim().toUpperCase();
    const res = await this.http.get<string>(`/range/${safePrefix}`, {
      responseType: "text",
      signal,
    });
    return res.data;
  }
}
