// components/shared/WithdrawalRequest.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";

const WithdrawalRequest = ({ userEarnings, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!amount || amount < 50) {
      return toast.error("Minimum withdrawal is ₹50");
    }
    if (amount > userEarnings) {
      return toast.error(`You only have ₹${userEarnings} available`);
    }
    if (!details.trim()) {
      return toast.error("Please enter your payment details");
    }
    if (details.trim().length < 5) {
      return toast.error("Details too short");
    }

    setLoading(true);

    try {
      await api.post("/withdrawals/request", {
        amount: Number(amount),
        method: method.toUpperCase(),
        details: details.trim(),
      });

      toast.success("Withdrawal request sent successfully! Admin will review soon.");
      
      // Reset form
      setAmount("");
      setDetails("");
      setMethod("UPI");

      // Refresh parent data
      onSuccess?.();

    } catch (err) {
      const msg = err.response?.data?.message || "Request failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-5 text-gray-800">Request Withdrawal</h3>

      <div className="space-y-4">

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="Enter amount (min ₹50)"
            min="50"
            max={userEarnings}
          />
          <p className="text-xs text-gray-500 mt-1">
            Available: ₹{parseFloat(userEarnings || 0).toFixed(2)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="UPI">UPI (Recommended)</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="PayPal">PayPal</option>
            <option value="USDT">USDT (Crypto)</option>
          </select>
        </div>

        {/* Payment Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {method === "UPI" && "UPI ID (e.g. yourname@oksbi)"}
            {method === "Bank Transfer" && "Bank Account Number + IFSC"}
            {method === "PayPal" && "PayPal Email"}
            {method === "USDT" && "USDT Wallet Address (TRC20)"}
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
            placeholder={
              method === "UPI" ? "example@upi" :
              method === "Bank Transfer" ? "Account: 1234567890, IFSC: SBIN0001234" :
              method === "PayPal" ? "your@email.com" :
              "TAbc123... (TRC20 address)"
            }
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !amount || !details.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-100 shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </span>
          ) : (
            "Request Withdrawal"
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-3">
          Admin will verify and send payment manually within 12-48 hours.
        </p>
      </div>
    </div>
  );
};

export default WithdrawalRequest;