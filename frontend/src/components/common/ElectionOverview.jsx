import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  active: "bg-[#EEEDFE] text-[#3C3489]",
  published: "bg-[#E1F5EE] text-[#085041]",
  draft: "bg-gray-100 text-gray-500",
  closed: "bg-red-50 text-red-700",
};

export default function ElectionOverview({ elections, loading }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase">
          Elections
        </p>
        <button
          onClick={() => navigate("/admin/elections")}
          className="text-[11.5px] text-[#534AB7] hover:underline whitespace-nowrap"
        >
          View all
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {loading ? (
          <div className="px-4 py-4 text-[12px] text-gray-500">
            Loading election overview...
          </div>
        ) : elections.length === 0 ? (
          <div className="px-4 py-4 text-[12px] text-gray-500">
            No elections found yet.
          </div>
        ) : (
          elections.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-gray-400">
                  {item.positions} position{item.positions !== 1 ? "s" : ""} · {item.votes} vote{item.votes !== 1 ? "s" : ""}
                </p>
              </div>
              <span
                className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap capitalize ${
                  STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg px-3.5 py-3">
        <p className="text-[12px] text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-700">Results are gated.</span>{" "}
          Published only after admin explicitly closes and publishes an election.
        </p>
      </div>
    </div>
  );
}