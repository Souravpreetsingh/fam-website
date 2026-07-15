class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(200, message, data);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, message);
  }

  send(res) {
    const response = {
      success: this.success,
      message: this.message,
    };
    if (this.data !== null) {
      response.data = this.data;
    }
    return res.status(this.statusCode).json(response);
  }
}

module.exports = ApiResponse;
