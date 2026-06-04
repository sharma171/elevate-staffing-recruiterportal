export const EXPENSE_CATEGORIES = {
  PAYROLL: "Payroll and Employee Compensation",
  OFFICE_SUPPLIES: "Office Supplies and Equipment",
  RENT: "Rent and Lease Payments",
  UTILITIES: "Utilities (Electric, Water, Internet)",
  INSURANCE: "Insurance Premiums",
  MARKETING: "Marketing and Advertising",
  PROFESSIONAL_SERVICES: "Professional Services (Legal, Accounting)",
  TRAVEL: "Travel and Transportation",
  MEALS_ENTERTAINMENT: "Meals and Entertainment",
  SOFTWARE_SUBSCRIPTIONS: "Software and Subscriptions",
  BANK_FEES: "Bank Fees and Charges",
  TAXES: "Taxes and Government Fees",
  MAINTENANCE: "Maintenance and Repairs",
  TRAINING: "Training and Development",
  OTHER: "Other Expenses",
};

export function getCategoryDisplayName(categoryCode) {
  if (!categoryCode) return "Uncategorized";
  return EXPENSE_CATEGORIES[categoryCode] || categoryCode;
}

export function getTransactionCategory(transaction) {
  const categoryCode =
    transaction.confirmed_category || transaction.suggested_category || transaction.category_code || null;

  const category = {
    code: categoryCode,
    displayName: getCategoryDisplayName(categoryCode),
    status: "pending",
    statusBadge: "⚪",
    confidence: transaction.categorization_confidence || 0,
    reasoning: transaction.categorization_reasoning || null,
  };

  if (transaction.categorization_status === "approved") {
    category.status = "approved";
    category.statusBadge = "🟢";
  } else if (transaction.categorization_status === "suggested") {
    category.status = "suggested";
    category.statusBadge = "🟡";
  }

  return category;
}

export function getEmployeeLinkingInfo(transaction) {
  if (transaction.linked_to_employee && transaction.employee_name) {
    return {
      isLinked: true,
      badge: "👤",
      employeeName: transaction.employee_name,
      employeeEmail: transaction.employee_email || null,
      linkedBy: transaction.linked_by,
      linkedOn: transaction.linked_on,
      notes: transaction.notes,
    };
  }

  return {
    isLinked: false,
    badge: null,
    employeeName: null,
    employeeEmail: null,
  };
}
