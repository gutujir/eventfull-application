const SignUpUserSchema = {
  type: "object",
  properties: {
    first_name: { type: "string", example: "John" },
    last_name: { type: "string", example: "Doe" },
    email: { type: "string", format: "email", example: "user@example.com" },
    password: { type: "string", minLength: 8, example: "mypassword123" },
    role: { type: "string", enum: ["CREATOR", "EVENTEE"], example: "EVENTEE" },
  },
  required: ["first_name", "last_name", "email", "password"],
};

export { SignUpUserSchema };
