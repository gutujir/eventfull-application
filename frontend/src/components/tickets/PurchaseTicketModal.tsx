import { useState, useEffect } from "react";
import { FaTimes, FaTicketAlt, FaMinus, FaPlus } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { purchaseTicket, reset } from "../../features/tickets/ticketSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface PurchaseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const PurchaseTicketModal = ({
  isOpen,
  onClose,
  event,
}: PurchaseTicketModalProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, isSuccess, isError } = useAppSelector(
    (state) => state.tickets,
  );
  const { user } = useAppSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>("");
  const [pendingFreePurchase, setPendingFreePurchase] = useState(false);

  useEffect(() => {
    if (event && event.ticketTypes && event.ticketTypes.length > 0) {
      setSelectedTicketTypeId(event.ticketTypes[0].id);
    }
  }, [event]);

  useEffect(() => {
    if (isOpen) {
      dispatch(reset());
      setPendingFreePurchase(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(reset());
      setPendingFreePurchase(false);
    }

    if (isSuccess && pendingFreePurchase) {
      toast.success("Ticket purchased successfully!");
      dispatch(reset());
      setPendingFreePurchase(false);
      onClose();
      navigate("/my-tickets");
    }
  }, [isError, isSuccess, pendingFreePurchase, dispatch, onClose, navigate]);

  if (!isOpen || !event) return null;

  const handleIncrement = () => {
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handlePurchase = async () => {
    const ticketData = {
      eventId: event.id,
      ticketTypeId: selectedTicketTypeId, // Optional if no types
      quantity,
    };
    if (totalPrice <= 0) {
      setPendingFreePurchase(true);
      dispatch(purchaseTicket(ticketData));
      return;
    }

    try {
      setPendingFreePurchase(false);
      const callbackUrl = `${window.location.origin}/payments/verify`;
      const res = await api.post("/payments/initialize", {
        ...ticketData,
        callbackUrl,
        email: user?.email,
      });

      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else {
        toast.error("Payment initialization failed.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Payment initialization failed.",
      );
    }
  };

  const getSelectedTicketPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return event.price;
    }
    const ticket = event.ticketTypes.find(
      (t: any) => t.id === selectedTicketTypeId,
    );
    return ticket ? ticket.price : 0;
  };

  const totalPrice = getSelectedTicketPrice() * quantity;
  const currency =
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes[0].currency
      : event.currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <FaTicketAlt className="mr-2" /> Purchase Tickets
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-200 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {event.title}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {new Date(event.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="space-y-4 mb-6">
            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Ticket Type
                </label>
                <div className="space-y-2">
                  {event.ticketTypes.map((ticket: any) => (
                    <label
                      key={ticket.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                        selectedTicketTypeId === ticket.id
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="ticketType"
                          value={ticket.id}
                          checked={selectedTicketTypeId === ticket.id}
                          onChange={(e) =>
                            setSelectedTicketTypeId(e.target.value)
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 font-medium text-gray-900">
                          {ticket.name}
                        </span>
                      </div>
                      <span className="text-gray-900 font-bold">
                        {ticket.currency} {ticket.price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  General Admission
                </span>
                <span className="font-bold text-gray-900">
                  {currency} {event.price}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                <button
                  onClick={handleDecrement}
                  className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition"
                  disabled={quantity <= 1}
                >
                  <FaMinus size={12} />
                </button>
                <span className="font-bold text-gray-900 text-lg w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition"
                  disabled={quantity >= 10}
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-indigo-600">
                {currency} {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicketModal;
