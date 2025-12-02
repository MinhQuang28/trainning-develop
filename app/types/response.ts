import { StatusCodes } from "http-status-codes";

class ApiResponse<T> {
    status: StatusCodes;
    success: boolean;
    message: string;
    data: T;

    constructor(status: number, success: boolean, message: string, data: T) {
        this.status = status;
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static ok<T = any>(message = "success", success = true, status = 200, data: T) {
        return new ApiResponse(status, success, message, data);
    }

    static fail(message = "fail", success = false, status = 500, data?: any) {
        return new ApiResponse(status, success, message, data);
    }
}

export default ApiResponse;
