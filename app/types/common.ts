export type ApiResponse<T> = {
    data: T;
    message: string;
    success: boolean;
    status: number;
};

export type ApiError = {
    status: number;
    message: string;
    success: boolean;
    errors: any;
};
