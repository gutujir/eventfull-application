import { render, screen } from "@testing-library/react";
import Button from "../../../../src/components/ui/Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("disables button while loading", () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
  });

  it("renders left icon when not loading", () => {
    render(
      <Button leftIcon={<span data-testid="icon">+</span>}>Create</Button>,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
