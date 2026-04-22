import { useNavigate } from "react-router-dom";

export default function QuickActionCard({ action }) {
  const navigate = useNavigate();
  const Icon = action.icon;

  return (
    <button
      onClick={() => navigate(action.to)}
      className="text-left bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-px active:scale-[.98] transition-all duration-150 min-h-[120px]"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.iconBg}`}>
        <Icon size={14} className={action.iconColor} strokeWidth={1.5} />
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-900 leading-tight">
          {action.label}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">{action.desc}</p>
      </div>
    </button>
  );
}