class ErrorHandler extends Error {
    constructor(name: string, message: string) {
        super(message);
        this.name = name;
    }
}

export { ErrorHandler as error };
