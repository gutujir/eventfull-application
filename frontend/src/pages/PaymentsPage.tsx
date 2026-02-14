import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/payments/my/payments");
        setPayments(res.data?.payments || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load payments");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-1 sm:px-2">
        <div className="mb-8">
          <SectionHeader
            eyebrow="Revenue"
            title="Payments"
            subtitle="View and reconcile payments across your events."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <Card className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </Card>
        ) : payments.length === 0 ? (
          <Card className="p-8 text-center text-(--color-text-muted)">
            No payments yet.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-(--color-text-muted)">
                <tr>
                  <th className="px-4 py-3 text-left">Event</th>
                  <th className="px-4 py-3 text-left">Payer</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-(--color-text) font-medium">
                      {p.event?.title || "-"}
                    </td>
                    <td className="px-4 py-3 text-(--color-text-muted)">
                      {p.user
                        ? `${p.user.first_name} ${p.user.last_name} (${p.user.email})`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-(--color-text)">
                      {p.currency} {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : p.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {p.reference}
                    </td>
                    <td className="px-4 py-3 text-(--color-text-muted)">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
