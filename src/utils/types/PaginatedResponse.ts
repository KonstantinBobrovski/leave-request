type PaginatedResponse<T> = {
  pageNumber: number;
  pageSize: number;
  itemsCount: number;
  items: T[];
};

export default PaginatedResponse;
