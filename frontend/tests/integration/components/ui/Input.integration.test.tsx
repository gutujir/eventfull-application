import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../../../../src/components/ui/Input";

type TestFormValues = {
  email: string;
  password: string;
};

const TestForm = ({
  onSubmit,
}: {
  onSubmit: (values: TestFormValues) => void;
}) => {
  const { register, handleSubmit } = useForm<TestFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input aria-label="Email" type="email" {...register("email")} />
      <Input aria-label="Password" type="password" {...register("password")} />
      <button type="submit">Submit</button>
    </form>
  );
};

describe("Input integration", () => {
  it("submits values when used with react-hook-form register", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        email: "user@example.com",
        password: "password123",
      },
      expect.anything(),
    );
  });
});
