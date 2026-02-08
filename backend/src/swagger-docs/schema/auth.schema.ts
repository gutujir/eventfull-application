const ProfileFields = {
  dateOfBirth: {
    type: "string",
    format: "date",
    example: "2000-06-21",
  },
  age: { type: "integer", example: 24 },
  occupation: { type: "string", example: "Event Organizer" },
  jobTitle: { type: "string", example: "Product Manager" },
  company: { type: "string", example: "Hummfly Tech" },
  phone: { type: "string", example: "+251932268829" },
  avatarUrl: {
    type: "string",
    example: "https://res.cloudinary.com/.../avatar.jpg",
  },
  website: { type: "string", example: "https://example.com" },
  location: { type: "string", example: "Addis Ababa, Ethiopia" },
  timezone: { type: "string", example: "Africa/Addis_Ababa" },
  bio: { type: "string", example: "Product leader and event creator." },
  socialProfiles: {
    type: "object",
    additionalProperties: { type: "string" },
    example: { twitter: "@hanaadam", linkedin: "linkedin.com/in/hanaadam" },
  },
};

const SignUpUserSchema = {
  type: "object",
  description:
    "Accepts camelCase (firstName/lastName). Snake_case variants are also accepted by the API.",
  properties: {
    firstName: { type: "string", example: "John" },
    lastName: { type: "string", example: "Doe" },
    email: { type: "string", format: "email", example: "user@example.com" },
    password: { type: "string", minLength: 6, example: "mypassword123" },
    role: {
      type: "string",
      enum: ["CREATOR", "EVENTEE", "ADMIN"],
      example: "EVENTEE",
    },
    ...ProfileFields,
  },
  required: ["firstName", "lastName", "email", "password", "role"],
};

const UpdateProfileSchema = {
  type: "object",
  description:
    "Partial updates supported. Accepts camelCase keys (firstName/lastName).",
  properties: {
    firstName: { type: "string", example: "Hana" },
    lastName: { type: "string", example: "Adam" },
    ...ProfileFields,
  },
};

export { SignUpUserSchema, UpdateProfileSchema };
