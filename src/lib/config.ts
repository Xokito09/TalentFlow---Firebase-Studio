export const CLIENT_STATUS_CONFIG = {
  client: { label: 'Client', className: 'text-emerald-800 bg-emerald-100', dotClassName: 'bg-emerald-500' },
  prospect: { label: 'Prospect', className: 'text-blue-800 bg-blue-100', dotClassName: 'bg-blue-500' },
  churn: { label: 'Churn', className: 'text-red-800 bg-red-100', dotClassName: 'bg-red-500' },
  lost: { label: 'Lost', className: 'text-slate-600 bg-slate-200', dotClassName: 'bg-slate-500' },
};

export const POSITION_STATUS_CONFIG = {
  'Open': { label: 'Open', badgeStyle: 'bg-emerald-100 text-emerald-800' },
  'Closed': { label: 'Closed', badgeStyle: 'bg-slate-200 text-slate-700' },
  'On Hold': { label: 'On Hold', badgeStyle: 'bg-amber-100 text-amber-800' },
};

export const POSITION_STATUS_KEYS = Object.keys(POSITION_STATUS_CONFIG) as Array<keyof typeof POSITION_STATUS_CONFIG>;
