import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const PaymentVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("Verifying payment...");

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus("error");
        setMessage("Missing payment reference.");
        return;
      }
      try {
        const response = await api.get(
          `/payments/verify?reference=${reference}`,
        );
        if (response.data?.success) {
          setStatus("success");
          setMessage("Payment verified. Ticket issued successfully.");
          setTimeout(() => navigate("/my-tickets"), 1500);
        } else {
          setStatus("error");
          setMessage(response.data?.error || "Payment verification failed.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.error || "Payment verification failed.",
        );
      }
    };

    verify();
  }, [reference, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        {status === "loading" && (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === "success" ? "Payment Verified" : "Verifying Payment"}
        </h1>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        {status === "error" && (
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Events
          </Link>
        )}
      </div>
    </div>
  );
};

export default PaymentVerifyPage;
