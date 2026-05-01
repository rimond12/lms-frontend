// ── Shared reusable UI components for apply form ──

export function FieldInput({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
    />
  );
}

export function FieldSelect({
  options,
  placeholder,
  value,
  onChange,
}: {
  options: string[];
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function SectionLabel({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
      {title}
    </h3>
  );
}

export function AddBtn({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 transition-colors mt-1"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      {label}
    </button>
  );
}
