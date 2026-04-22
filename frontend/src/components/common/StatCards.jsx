export default function StatCards({ stats, loading }) {
  const items = [
    {
      label: "Total elections",
      value: loading ? "..." : stats?.total_elections ?? 0,
      highlight: "",
    },
    {
      label: "Active now",
      value: loading ? "..." : stats?.active_now ?? 0,
      highlight: "text-[#534AB7]",
    },
    {
      label: "Registered users",
      value: loading ? "..." : stats?.registered_users ?? 0,
      highlight: "",
    },
    {
      label: "Votes cast today",
      value: loading ? "..." : stats?.votes_cast_today ?? 0,
      highlight: "text-[#0F6E56]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-7">
      {items.map((item) => (
        <div key={item.label} className="bg-gray-100 rounded-lg px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">{item.label}</p>
          <p className={`text-[22px] font-medium ${item.highlight || "text-gray-900"}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}