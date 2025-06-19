class ApiResponse{
    constructor(statusCode, data, message = "Success")
    {
this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Assuming status codes < 400 are successful
    }
}
export default ApiResponse;