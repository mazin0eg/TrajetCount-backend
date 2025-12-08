class HttpError extends Error{
    constructor(message, statusCode = 501){
        super(message)
        this.statusCode = statusCode;
    }
}
export default HttpError;