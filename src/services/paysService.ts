import apiClient from "./api";

export interface Pays {
  id: string;
  nom: string;
  code_iso: string;
  indicatif_tel: string;
  devise: string;
  fuseau_horaire: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaysRequest {
  nom: string;
  code_iso: string;
  indicatif_tel: string;
  devise: string;
  fuseau_horaire: string;
}

export interface UpdatePaysRequest {
  nom?: string;
  code_iso?: string;
  indicatif_tel?: string;
  devise?: string;
  fuseau_horaire?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

class PaysService {
  /**
   * Get all countries
   */
  async getAll(
    perPage: number = 100
  ): Promise<ApiResponse<PaginatedResponse<Pays>>> {
    const response = await apiClient.get("/pays", {
      params: { per_page: perPage },
    });
    return response.data;
  }

  /**
   * Get all countries without pagination
   */
  async getAllPays(): Promise<ApiResponse<Pays[]>> {
    try {
      // First request to get total pages
      const firstPage = await apiClient.get("/pays", {
        params: { page: 1, per_page: 100 },
      });

      const firstPageData = firstPage.data;

      // Check if response is paginated
      if (
        firstPageData.success &&
        firstPageData.data?.data &&
        firstPageData.data?.last_page
      ) {
        const paginatedData = firstPageData.data as PaginatedResponse<Pays>;
        let allPays = [...paginatedData.data];

        // If there are more pages, load them all in parallel
        if (paginatedData.last_page > 1) {
          const remainingPages = Array.from(
            { length: paginatedData.last_page - 1 },
            (_, i) => i + 2
          );

          const remainingRequests = remainingPages.map((page) =>
            apiClient.get("/pays", {
              params: { page, per_page: 100 },
            })
          );

          const remainingResponses = await Promise.all(remainingRequests);

          remainingResponses.forEach((response) => {
            if (response.data.success && response.data.data?.data) {
              allPays = [...allPays, ...response.data.data.data];
            }
          });
        }

        return {
          success: true,
          message: firstPageData.message,
          data: allPays,
        };
      }

      // If not paginated, return as is
      if (firstPageData.success && Array.isArray(firstPageData.data)) {
        return {
          success: true,
          message: firstPageData.message,
          data: firstPageData.data,
        };
      }

      return firstPageData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific country by ID
   */
  async getById(id: string): Promise<ApiResponse<Pays>> {
    const response = await apiClient.get(`/pays/${id}`);
    return response.data;
  }

  /**
   * Create a new country
   */
  async create(data: CreatePaysRequest): Promise<ApiResponse<Pays>> {
    const response = await apiClient.post("/pays", data);
    return response.data;
  }

  /**
   * Update a country
   */
  async update(
    id: string,
    data: UpdatePaysRequest
  ): Promise<ApiResponse<Pays>> {
    const response = await apiClient.put(`/pays/${id}`, data);
    return response.data;
  }

  /**
   * Delete a country
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/pays/${id}`);

    // Handle 204 No Content response
    if (response.status === 204) {
      return {
        success: true,
        message: "Pays supprimé avec succès",
      };
    }

    return response.data;
  }
}

export default new PaysService();
