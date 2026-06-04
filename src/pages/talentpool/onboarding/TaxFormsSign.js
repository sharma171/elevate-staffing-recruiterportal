import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eraser,
  Eye,
  EyeOff,
  CreditCard,
  Plus,
  Trash2,
  Building2,
} from "lucide-react";
import MainFooter from "../../../components/Footer/NewMainFooter";

const TAX_FORMS_API_URL = "https://send-retrieve-employee-tax-forms-v1-305451280005.us-east1.run.app";

// State Categories
const NO_STATE_TAX_STATES = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
const FEDERAL_COPYCAT_STATES = ["CO", "NM", "ND", "UT", "SC"];

const ARIZONA_PERCENTAGES = [
  { value: "0.5", label: "0.5%" },
  { value: "1.0", label: "1.0%" },
  { value: "1.5", label: "1.5%" },
  { value: "2.0", label: "2.0% (Default)" },
  { value: "2.5", label: "2.5%" },
  { value: "3.0", label: "3.0%" },
  { value: "3.5", label: "3.5%" },
];

const CT_WITHHOLDING_CODES = [
  { value: "A", label: "Code A - Married filing jointly, both spouses employed" },
  { value: "B", label: "Code B - Head of Household" },
  { value: "C", label: "Code C - Married filing jointly, one spouse employed" },
  { value: "D", label: "Code D - Single" },
  { value: "E", label: "Code E - Married filing separately" },
  { value: "F", label: "Code F - Withholding at highest rate" },
];

// Fallback Perjury Statements
const FALLBACK_PERJURY_STATEMENTS = {
  w4_federal: `Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete.`,
  state_generic: `Under penalties of perjury, I declare that the information provided on this form is true, correct, and complete to the best of my knowledge.`,
};

const formatSSN = (input) => {
  const digits = input.replace(/\D/g, "");
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  }
};

// Inline UI Components
const Button = ({
  children,
  onClick,
  type = "button",
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-[#7c3bed] text-white hover:bg-[#7c3beddb] focus-visible:ring-[#7c3beddb]",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    outline:
      "border border-gray-300 bg-transparent hover:!bg-blue-600 hover:!text-[#fff] text-gray-900 focus-visible:ring-gray-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
    ghost: "hover:bg-gray-100 text-gray-900 focus-visible:ring-gray-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ type = "text", value, onChange, placeholder, className = "", maxLength, error, ...props }) => {
  return (
    <div className="w-full">
      <input
        type={type}
        onWheel={(e) => e.target.blur()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`flex h-10 w-full rounded-md border ${
          error ? "border-red-500" : "border-gray-300"
        } bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const Label = ({ children, htmlFor, className = "", required = false }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-[500] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = "" }) => {
  return <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
};

const CardDescription = ({ children, className = "" }) => {
  return <p className={`text-sm ${className}`}>{children}</p>;
};

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

const RadioGroup = ({ children, value, onValueChange, className = "", error }) => {
  return (
    <div>
      <div className={`space-y-2 ${className}`} role="radiogroup">
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value),
          });
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const RadioGroupItem = ({ value, id, children, checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
      <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-[#7c3bed] focus:ring-[#7c3bed] border-gray-300"
      />
      <Label htmlFor={id} className="cursor-pointer flex-1">
        {children}
      </Label>
    </div>
  );
};

const Checkbox = ({ checked, onCheckedChange, id, children, error }) => {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="round-checkbox"
        />
        <Label htmlFor={id} className="cursor-pointer">
          {children}
        </Label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const Select = ({ children, value, onValueChange, error, ...props }) => {
  return (
    <div className="w-full">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`flex h-10 w-full rounded-md border ${
          error ? "border-red-500" : "border-gray-300"
        } bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

function TaxFormPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formConfig, setFormConfig] = useState({ forms: [] });
  const [federalData, setFederalData] = useState({});
  const [stateData, setStateData] = useState({});
  const [agreedToPerjury, setAgreedToPerjury] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [ssnVisible, setSsnVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState("tax_forms");
  // const [currentStep, setCurrentStep] = useState("direct_deposit");

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: "1",
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      confirmAccountNumber: "",
      accountType: "checking",
      percentage: 100,
      isPrimary: true,
    },
  ]);

  const initialErrors = {
    federal: {},
    state: {},
    signature: {},
    directDeposit: {},
  };

  const [fieldErrors, setFieldErrors] = useState(initialErrors);

  const wrapperRef = useRef(null);
  const signatureRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(500);

  const maskSSN = (ssn) => {
    if (!ssn) return "";
    return `***-**-${ssn.slice(-4)}`;
  };

  useEffect(() => {
    if (token) {
      loadForms(token);
    } else {
      setError("Invalid link. Please use the link from your email.");
      setLoading(false);
    }
  }, [token]);

  const updateWidth = () => {
    if (wrapperRef.current) {
      setCanvasWidth(wrapperRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      updateWidth();
    }, 50);
  }, [wrapperRef.current?.offsetWidth, loading]);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const loadForms = async (formToken) => {
    try {
      const response = await fetch(TAX_FORMS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
        },
        body: JSON.stringify({ action: "get-tax-form", token: formToken }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setFormConfig(result);

        const details = result.candidate_details || {};
        setFederalData({
          first_name: details.first_name || "",
          last_name: details.last_name || "",
          address: details.address || "",
          city: details.city || "",
          state: details.state || "",
          zip_code: details.zip_code || "",
          ssn: details.ssn || "",
          filing_status: "",
          multiple_jobs: false,
          dependents_children_amount: "",
          dependents_other_amount: "",
        });

        setStateData({
          marital_status: "",
          total_allowances: "0",
          additional_withholding: "0",
        });

        let direct_depositCompleted = result.completion_status?.direct_deposit?.status == "completed";

        let tax_formsCompleted = result.completion_status?.tax_forms?.overall_status == "completed";

        if (tax_formsCompleted && direct_depositCompleted) {
          setAllDone(true);
        } else if (!direct_depositCompleted && tax_formsCompleted) {
          setCurrentStep("direct_deposit");
        }

        let accounts = result.completion_status?.direct_deposit?.accounts?.accounts;

        if (Array.isArray(accounts) && accounts.length) {
          const formattedAccounts = accounts.map(function (item) {
            return {
              id: item.id ? String(item.id) : Date.now().toString(),
              bankName: item.bank_name || "",
              routingNumber: item.routing_number || "",
              accountNumber: item.account_number || "",
              confirmAccountNumber: item.account_number || "",
              accountType: item.account_type ? item.account_type.toLowerCase() : "checking",
              percentage: item.percentage || 0,
              isPrimary: !!item.is_primary,
            };
          });

          setBankAccounts(formattedAccounts);
        }

        // const allCompleted = result.forms.every((f) => f.status === "completed");
        // if (allCompleted) {
        // }
      } else {
        setError(result.message || "Failed to load forms");
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    }
    setLoading(false);
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  // Clear errors when typing
  const clearError = (section, field) => {
    setFieldErrors((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: undefined,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formConfig || !token) return;

    const missingFields = [];
    const newErrors = { federal: {}, state: {}, signature: {} };

    // Validate federal fields
    // if (!federalData.first_name) {
    //   missingFields.push("First Name");
    //   newErrors.federal.first_name = "First name is required";
    // }
    // if (!federalData.last_name) {
    //   missingFields.push("Last Name");
    //   newErrors.federal.last_name = "Last name is required";
    // }
    // if (!federalData.ssn) {
    //   missingFields.push("Social Security Number");
    //   newErrors.federal.ssn = "SSN is required";
    // } else if (federalData.ssn.length !== 11) {
    //   missingFields.push("Social Security Number");
    //   newErrors.federal.ssn = "SSN must be in XXX-XX-XXXX format";
    // }
    // if (!federalData.address) {
    //   missingFields.push("Address");
    //   newErrors.federal.address = "Address is required";
    // }
    // if (!federalData.city) {
    //   missingFields.push("City");
    //   newErrors.federal.city = "City is required";
    // }
    // if (!federalData.state) {
    //   missingFields.push("State");
    //   newErrors.federal.state = "State is required";
    // }
    // if (!federalData.zip_code) {
    //   missingFields.push("ZIP Code");
    //   newErrors.federal.zip_code = "ZIP code is required";
    // }
    if (!federalData.filing_status) {
      missingFields.push("Filing Status");
      newErrors.federal.filing_status = "Filing status is required";
    }

    // Validate signature
    if (!agreedToPerjury) {
      missingFields.push("Perjury Agreement");
      newErrors.signature.perjury = "You must agree to the perjury statement";
    }

    if (signatureRef.current?.isEmpty()) {
      missingFields.push("Signature");
      newErrors.signature.signature = "Signature is required";
    }

    // Validate state form if exists
    const stateForm = formConfig.forms.find((f) => f.form_type === "state_withholding");
    if (stateForm) {
      if (stateForm.state_form_type === "allowances" && stateForm.state_code === "NC" && !stateData.marital_status) {
        missingFields.push("NC Marital Status");
        newErrors.state.marital_status = "Marital status is required for NC";
      }
      if (stateForm.state_form_type === "percentage" && !stateData.withholding_percentage) {
        missingFields.push("Withholding Percentage");
        newErrors.state.withholding_percentage = "Withholding percentage is required";
      }
      if (stateForm.state_form_type === "letter_code" && !stateData.withholding_code) {
        missingFields.push("Withholding Code");
        newErrors.state.withholding_code = "Withholding code is required";
      }
    }

    setFieldErrors(newErrors);

    if (missingFields.length > 0) {
      toast.error(`Please complete: ${missingFields.slice(0, 3).join(", ")}`);
      return;
    }

    setSubmitting(true);

    try {
      const signatureData = signatureRef.current?.toDataURL("image/png");

      const federalResponse = await fetch(TAX_FORMS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
        },
        body: JSON.stringify({
          action: "submit-tax-form",
          token: token,
          form_type: "w4_federal",
          form_data: {
            ...federalData,
            signature_date: new Date().toLocaleDateString(),
          },
          signature_data: signatureData,
        }),
      });

      const federalResult = await federalResponse.json();

      if (federalResult.status !== "success") {
        throw new Error(federalResult.message || "Failed to submit federal form");
      }

      if (stateForm) {
        const stateResponse = await fetch(TAX_FORMS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
          },
          body: JSON.stringify({
            action: "submit-tax-form",
            token: token,
            form_type: "state_withholding",
            form_data: {
              ...stateData,
              first_name: federalData.first_name,
              middle_initial: federalData.middle_initial,
              last_name: federalData.last_name,
              ssn: federalData.ssn,
              address: federalData.address,
              city: federalData.city,
              state: federalData.state,
              zip_code: federalData.zip_code,
              signature_date: new Date().toLocaleDateString(),
            },
            signature_data: signatureData,
          }),
        });

        const stateResult = await stateResponse.json();

        if (stateResult.status !== "success") {
          throw new Error(stateResult.message || "Failed to submit state form");
        }
      }

      toast.success("Tax Forms Submitted Successfully! Now let's set up your direct deposit.");
      setFieldErrors(initialErrors);
      setCurrentStep("direct_deposit");
    } catch (err) {
      toast.error(err.message || "Submission failed. Please try again.");
    }

    setSubmitting(false);
  };

  const renderFederalForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Federal W-4 - Employee's Withholding Certificate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">Step 1: Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={federalData.first_name || ""}
                onChange={(e) => {
                  // setFederalData({ ...federalData, first_name: e.target.value });
                  clearError("federal", "first_name");
                }}
                disabled
                error={fieldErrors.federal.first_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_initial">M.I.</Label>
              <Input
                id="middle_initial"
                maxLength={1}
                value={federalData.middle_initial || ""}
                // onChange={(e) => setFederalData({ ...federalData, middle_initial: e.target.value })}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                disabled
                value={federalData.last_name || ""}
                onChange={(e) => {
                  // setFederalData({ ...federalData, last_name: e.target.value });
                  clearError("federal", "last_name");
                }}
                error={fieldErrors.federal.last_name}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number</Label>
              <div className="relative">
                <Input
                  id="ssn"
                  type={ssnVisible ? "text" : "password"}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  value={federalData.ssn || ""}
                  onChange={(e) => {
                    // setFederalData({ ...federalData, ssn: formatSSN(e.target.value) });
                    clearError("federal", "ssn");
                  }}
                  disabled
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 hover:!bg-gray-100 rounded-r-md bg-transparent"
                  onClick={() => setSsnVisible(!ssnVisible)}
                >
                  {ssnVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {fieldErrors.federal.ssn && <p className="text-red-500 text-xs mb-2">{fieldErrors.federal.ssn}</p>}

              {federalData.ssn && formConfig?.candidate_details?.ssn && (
                <p className="text-xs">Pre-filled: {maskSSN(formConfig.candidate_details.ssn)}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={federalData.address || ""}
              disabled
              onChange={(e) => {
                // setFederalData({ ...federalData, address: e.target.value });
                clearError("federal", "address");
              }}
              error={fieldErrors.federal.address}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={federalData.city || ""}
                disabled
                onChange={(e) => {
                  // setFederalData({ ...federalData, city: e.target.value });
                  clearError("federal", "city");
                }}
                error={fieldErrors.federal.city}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                maxLength={2}
                value={federalData.state || ""}
                disabled
                onChange={(e) => {
                  // setFederalData({ ...federalData, state: e.target.value.toUpperCase() });
                  clearError("federal", "state");
                }}
                error={fieldErrors.federal.state}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={federalData.zip_code || ""}
                disabled
                onChange={(e) => {
                  // setFederalData({ ...federalData, zip_code: e.target.value });
                  clearError("federal", "zip_code");
                }}
                error={fieldErrors.federal.zip_code}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">
            Filing Status <span className="text-red-500">*</span>
          </h3>
          <RadioGroup
            value={federalData.filing_status || ""}
            onValueChange={(value) => {
              setFederalData({ ...federalData, filing_status: value });
              clearError("federal", "filing_status");
            }}
            error={fieldErrors.federal.filing_status}
          >
            <RadioGroupItem value="single" id="single">
              Single or Married filing separately
            </RadioGroupItem>
            <RadioGroupItem value="married_jointly" id="married_jointly">
              Married filing jointly or Qualifying surviving spouse
            </RadioGroupItem>
            <RadioGroupItem value="head_of_household" id="head_of_household">
              Head of household
            </RadioGroupItem>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">
            Step 2: Multiple Jobs or Spouse Works
          </h3>
          <p className="text-sm">
            Complete this step if you (1) hold more than one job at a time, or (2) are married filing jointly and your
            spouse also works.
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiple_jobs"
              checked={federalData.multiple_jobs || false}
              onCheckedChange={(checked) => setFederalData({ ...federalData, multiple_jobs: checked })}
            />
            <Label htmlFor="multiple_jobs" className="cursor-pointer">
              Check here if you have more than one job or your spouse also works
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">Step 3: Claim Dependents</h3>
          <p className="text-sm">
            If your total income will be $200,000 or less ($400,000 or less if married filing jointly), enter your
            dependents here.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Multiply number of qualifying children under age 17 by $2,000</Label>
              <div className="flex items-center">
                <span className=" mr-2 text-[18px]">$</span>
                <Input
                  type="number"
                  value={federalData.dependents_children_amount || ""}
                  onChange={(e) => setFederalData({ ...federalData, dependents_children_amount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Multiply number of other dependents by $500</Label>
              <div className="flex items-center">
                <span className=" mr-2 text-[18px]">$</span>
                <Input
                  type="number"
                  value={federalData.dependents_other_amount || ""}
                  onChange={(e) => setFederalData({ ...federalData, dependents_other_amount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">
            Step 4: Other Adjustments (Optional)
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>(a) Other income (not from jobs)</Label>
              <div className="flex items-center">
                <span className=" mr-2 text-[18px]">$</span>
                <Input
                  type="number"
                  value={federalData.other_income || ""}
                  onChange={(e) => setFederalData({ ...federalData, other_income: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>(b) Deductions</Label>
              <div className="flex items-center">
                <span className=" mr-2 text-[18px]">$</span>
                <Input
                  type="number"
                  value={federalData.deductions || ""}
                  onChange={(e) => setFederalData({ ...federalData, deductions: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>(c) Extra withholding per pay period</Label>
              <div className="flex items-center">
                <span className=" mr-2 text-[18px]">$</span>
                <Input
                  type="number"
                  value={federalData.extra_withholding || ""}
                  onChange={(e) => setFederalData({ ...federalData, extra_withholding: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">Exempt Status</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exempt"
              checked={federalData.exempt || false}
              onCheckedChange={(checked) => setFederalData({ ...federalData, exempt: checked })}
            />
            <Label htmlFor="exempt" className="cursor-pointer">
              I claim exemption from withholding for the current year
            </Label>
          </div>
          {federalData.exempt && (
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md">
              You may claim exemption only if you had no federal income tax liability last year and expect none this
              year. This exemption expires February 15 of next year.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStateForm = () => {
    const stateForm = formConfig?.forms.find((f) => f.form_type === "state_withholding");
    if (!stateForm) return null;

    const { state_code, state_form_name, state_form_type } = stateForm;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">
            State {state_form_name} - {state_code} Withholding Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-1">Personal Information</h3>
            <p className="text-sm mb-2">Information carried over from Federal W-4</p>
            <div className="text-sm space-y-1">
              <p>
                <strong>Name:</strong> {federalData.first_name} {federalData.middle_initial} {federalData.last_name}
              </p>
              <p>
                <strong>SSN:</strong> ***-**-{federalData.ssn?.slice(-4)}
              </p>
              <p>
                <strong>Address:</strong> {federalData.address}, {federalData.city}, {federalData.state}{" "}
                {federalData.zip_code}
              </p>
            </div>
          </div>

          {state_form_type === "allowances" && renderAllowancesForm(state_code || "")}
          {state_form_type === "percentage" && renderPercentageForm()}
          {state_form_type === "letter_code" && renderLetterCodeForm()}
          {state_form_type === "dollar_amount" && renderDollarAmountForm()}
          {state_form_type === "allowances_nyc" && renderNYCForm()}
        </CardContent>
      </Card>
    );
  };

  const renderAllowancesForm = (stateCode) => (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg border-b pb-2 border-bottom mb-3">Withholding Allowances</h3>

      {stateCode === "NC" && (
        <div className="space-y-4">
          <Label required>Marital Status</Label>
          <RadioGroup
            value={stateData.marital_status || ""}
            onValueChange={(value) => {
              setStateData({ ...stateData, marital_status: value });
              clearError("state", "marital_status");
            }}
            error={fieldErrors.state.marital_status}
          >
            <RadioGroupItem value="single" id="nc_single">
              Single
            </RadioGroupItem>
            <RadioGroupItem value="head_of_household" id="nc_hoh">
              Head of Household
            </RadioGroupItem>
            <RadioGroupItem value="married" id="nc_married">
              Married or Surviving Spouse
            </RadioGroupItem>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="total_allowances">Total Number of Allowances</Label>
        <Input
          id="total_allowances"
          type="number"
          min="0"
          value={stateData.total_allowances || ""}
          onChange={(e) => setStateData({ ...stateData, total_allowances: e.target.value })}
        />
        <p className="text-sm">Enter 0 if you are unsure. You can update this later.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_withholding">Additional Amount to Withhold (Optional)</Label>
        <div className="flex items-center">
          <span className=" mr-2 text-[18px]">$</span>
          <Input
            id="additional_withholding"
            type="number"
            value={stateData.additional_withholding || ""}
            onChange={(e) => setStateData({ ...stateData, additional_withholding: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderPercentageForm = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Withholding Percentage</h3>
      <div className="space-y-2">
        <Label required>Select your withholding percentage</Label>
        <Select
          value={stateData.withholding_percentage || ""}
          onValueChange={(value) => {
            setStateData({ ...stateData, withholding_percentage: value });
            clearError("state", "withholding_percentage");
          }}
          error={fieldErrors.state.withholding_percentage}
        >
          <option value="">Select percentage</option>
          {ARIZONA_PERCENTAGES.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
        <p className="text-sm">Default is 2.0% if not specified.</p>
      </div>
    </div>
  );

  const renderLetterCodeForm = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Withholding Code</h3>
      <div className="space-y-2">
        <Label required>Select your withholding code</Label>
        <Select
          value={stateData.withholding_code || ""}
          onValueChange={(value) => {
            setStateData({ ...stateData, withholding_code: value });
            clearError("state", "withholding_code");
          }}
          error={fieldErrors.state.withholding_code}
        >
          <option value="">Select code</option>
          {CT_WITHHOLDING_CODES.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );

  const renderDollarAmountForm = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Total Exemption Amount</h3>
      <div className="space-y-2">
        <Label htmlFor="exemption_amount">Enter your total exemption amount</Label>
        <div className="flex items-center">
          <span className=" mr-2 text-[18px]">$</span>
          <Input
            id="exemption_amount"
            type="number"
            value={stateData.exemption_amount || ""}
            onChange={(e) => setStateData({ ...stateData, exemption_amount: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderNYCForm = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg border-b pb-2">New York Withholding</h3>

      <div className="space-y-2">
        <Label htmlFor="ny_allowances">Number of Allowances</Label>
        <Input
          id="ny_allowances"
          type="number"
          min="0"
          value={stateData.total_allowances || ""}
          onChange={(e) => setStateData({ ...stateData, total_allowances: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <Label>Do you live in New York City?</Label>
        <RadioGroup
          value={stateData.nyc_resident || ""}
          onValueChange={(value) => setStateData({ ...stateData, nyc_resident: value })}
          className="flex gap-4"
        >
          <RadioGroupItem value="yes" id="nyc_yes">
            Yes
          </RadioGroupItem>
          <RadioGroupItem value="no" id="nyc_no">
            No
          </RadioGroupItem>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>Do you live in Yonkers?</Label>
        <RadioGroup
          value={stateData.yonkers_resident || ""}
          onValueChange={(value) => setStateData({ ...stateData, yonkers_resident: value })}
          className="flex gap-4"
        >
          <RadioGroupItem value="yes" id="yonkers_yes">
            Yes
          </RadioGroupItem>
          <RadioGroupItem value="no" id="yonkers_no">
            No
          </RadioGroupItem>
        </RadioGroup>
      </div>
    </div>
  );

  const renderSignatureSection = () => {
    const stateForm = formConfig?.forms.find((f) => f.form_type === "state_withholding");
    const stateCode = stateForm?.state_code?.toLowerCase() || "";

    const perjuryStatements = formConfig?.perjury_statements || {};
    const federalPerjury = perjuryStatements.w4_federal || FALLBACK_PERJURY_STATEMENTS.w4_federal;
    const statePerjury =
      perjuryStatements[`${stateCode}4_state`] ||
      perjuryStatements.state_generic ||
      FALLBACK_PERJURY_STATEMENTS.state_generic;

    return (
      <Card className="mb-6">
        <CardHeader className="mb-0 pb-2">
          <CardTitle className="text-xl">Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Federal W-4:</h4>
            <p className="text-sm italic text-amber-800 mb-4">{federalPerjury}</p>

            {stateForm && (
              <>
                <h4 className="font-semibold mb-2">State {formConfig?.work_state || stateForm.state_code}:</h4>
                <p className="text-sm italic text-amber-800">{statePerjury}</p>
              </>
            )}
          </div>

          <div className="mb-3">
            <div className={`flex items-center space-x-1 rounded-md`}>
              <Checkbox
                id="perjury_agreement"
                checked={agreedToPerjury}
                onCheckedChange={(checked) => {
                  setAgreedToPerjury(checked);
                  clearError("signature", "perjury");
                }}
              />
              <Label htmlFor="perjury_agreement" className="cursor-pointer font-medium">
                I have read and agree to the above statements under penalties of perjury{" "}
                <span className="text-red-500">*</span>
              </Label>
            </div>
            {fieldErrors.signature.perjury && (
              <p className="text-red-500 text-xs mt-2">{fieldErrors.signature.perjury}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label required>Sign Below</Label>
            <div
              ref={wrapperRef}
              className={`w-full border-2 border-dashed ${
                fieldErrors.signature.signature ? "border-red-500" : "border-gray-300"
              } rounded-md bg-white`}
            >
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: canvasWidth,
                  height: 200,
                  className: "w-full",
                }}
                onEnd={() => clearError("signature", "signature")}
              />
            </div>
            {fieldErrors.signature.signature && (
              <p className="text-red-500 text-xs my-1">{fieldErrors.signature.signature}</p>
            )}
            <Button type="button" className="mt-3 gap-1" variant="outline" size="sm" onClick={clearSignature}>
              <Eraser className="h-4 w-4 mr-1" />
              Clear Signature
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Direct Deposit Functions
  const addBankAccount = () => {
    if (bankAccounts.length >= 3) return;
    setBankAccounts([
      ...bankAccounts,
      {
        id: Date.now().toString(),
        bankName: "",
        routingNumber: "",
        accountNumber: "",
        confirmAccountNumber: "",
        accountType: "checking",
        percentage: 0,
        isPrimary: false,
      },
    ]);
  };

  const removeBankAccount = (id) => {
    if (bankAccounts.length === 1) return;
    const updated = bankAccounts.filter((acc) => acc.id !== id);
    if (!updated.some((acc) => acc.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setBankAccounts(updated);
  };

  const updateBankAccount = (id, field, value) => {
    setBankAccounts(bankAccounts.map((acc) => (acc.id === id ? { ...acc, [field]: value } : acc)));

    // Clear error when user starts typing
    if (fieldErrors?.directDeposit?.[id]?.[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        directDeposit: {
          ...prev.directDeposit,
          [id]: {
            ...prev.directDeposit[id],
            [field]: undefined,
          },
        },
      }));
    }
  };

  const setPrimaryAccount = (id) => {
    setBankAccounts(
      bankAccounts.map((acc) => ({
        ...acc,
        isPrimary: acc.id === id,
      })),
    );
  };

  const getTotalPercentage = () => {
    return bankAccounts.reduce((sum, acc) => sum + (acc.percentage || 0), 0);
  };

  let is100Allocate = getTotalPercentage() == 100;

  const handleDirectDepositSubmit = async () => {
    const errors = [];
    const newDirectDepositErrors = {};

    bankAccounts.forEach((acc, idx) => {
      const accountErrors = {};

      if (!acc.bankName) {
        errors.push(`Account ${idx + 1}: Bank name required`);
        accountErrors.bankName = "Bank name is required";
      }
      if (!acc.routingNumber || acc.routingNumber.length !== 9) {
        errors.push(`Account ${idx + 1}: Valid 9-digit routing number required`);
        accountErrors.routingNumber = "Valid 9-digit routing number is required";
      }
      if (!acc.accountNumber) {
        errors.push(`Account ${idx + 1}: Account number required`);
        accountErrors.accountNumber = "Account number is required";
      }
      if (!acc.percentage || acc.percentage == "0") {
        errors.push(`Account ${idx + 1}: Percentage must be between 1 and 100`);
        accountErrors.percentage = "Percentage must be between 1 and 100";
      }

      if (acc.accountNumber !== acc.confirmAccountNumber) {
        errors.push(`Account ${idx + 1}: Account numbers don't match`);
        accountErrors.confirmAccountNumber = "Account numbers don't match";
      }

      if (Object.keys(accountErrors).length > 0) {
        newDirectDepositErrors[acc.id] = accountErrors;
      }
    });

    if (!is100Allocate) {
      errors.push("Total allocation must equal 100%");
    }

    setFieldErrors((prev) => ({
      ...prev,
      directDeposit: newDirectDepositErrors,
    }));

    if (errors.length > 0) {
      toast.error(errors.slice(0, 3).join("; "));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(TAX_FORMS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
        },
        body: JSON.stringify({
          action: "submit-direct-deposit",
          token: token,
          bank_accounts: bankAccounts.map((acc) => ({
            bank_name: acc.bankName,
            routing_number: acc.routingNumber,
            account_number: acc.accountNumber,
            account_type: acc.accountType,
            percentage: acc.percentage,
            is_primary: acc.isPrimary,
          })),
        }),
      });

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to submit direct deposit");
      }

      toast.success("Direct Deposit Saved! Your banking information has been submitted successfully.");
      setAllDone(true);
    } catch (err) {
      toast.error(err.message || "Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  const renderDirectDepositForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Direct Deposit Setup
          </CardTitle>
          <CardDescription className="ms-0">
            Enter your bank account details for direct deposit. You can split your paycheck across up to 3 accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bankAccounts.map((account, index) => (
            <div key={account.id} className="p-6 border rounded-lg space-y-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <h4 className="font-semibold">Account {index + 1}</h4>
                  {account.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Primary</span>
                  )}
                </div>
                {bankAccounts.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 p-2 rounded"
                    onClick={() => removeBankAccount(account.id)}
                    title={`Delete Account ${index + 1} ?`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label required>Bank Name</Label>
                  <Input
                    placeholder="e.g., Chase, Bank of America"
                    value={account.bankName}
                    onChange={(e) => updateBankAccount(account.id, "bankName", e.target.value)}
                    error={fieldErrors?.directDeposit?.[account.id]?.bankName}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Account Type</Label>
                  <Select
                    value={account.accountType}
                    onValueChange={(value) => updateBankAccount(account.id, "accountType", value)}
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label required>Routing Number</Label>
                  <Input
                    placeholder="9 digits"
                    maxLength={9}
                    value={account.routingNumber}
                    onChange={(e) => updateBankAccount(account.id, "routingNumber", e.target.value.replace(/\D/g, ""))}
                    error={fieldErrors?.directDeposit?.[account.id]?.routingNumber}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Deposit Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={account.percentage}
                      onChange={(e) => {
                        let val = parseInt(e.target.value) || 0;

                        let sumAll = 0;
                        bankAccounts.map(function (acc, index) {
                          if (account.id != acc.id) {
                            sumAll += acc.percentage;
                          }
                        });

                        let maxVal = 100 - sumAll;

                        if (val > maxVal) {
                          val = maxVal;
                        }

                        updateBankAccount(account.id, "percentage", val);
                      }}
                      error={fieldErrors?.directDeposit?.[account.id]?.percentage}
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label required>Account Number</Label>
                  <Input
                    type="password"
                    placeholder="Enter account number"
                    value={account.accountNumber}
                    onChange={(e) => updateBankAccount(account.id, "accountNumber", e.target.value)}
                    error={fieldErrors?.directDeposit?.[account.id]?.accountNumber}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Confirm Account Number</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter account number"
                    value={account.confirmAccountNumber}
                    onChange={(e) => updateBankAccount(account.id, "confirmAccountNumber", e.target.value)}
                    error={fieldErrors?.directDeposit?.[account.id]?.confirmAccountNumber}
                  />
                </div>
              </div>

              {!account.isPrimary && (
                <Button type="button" variant="outline" size="sm" onClick={() => setPrimaryAccount(account.id)}>
                  Set as Primary
                </Button>
              )}
            </div>
          ))}

          <div
            className={`p-4 rounded-lg ${
              is100Allocate ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
            }`}
          >
            <div className={`text-base font-medium ${is100Allocate ? "text-green-800" : "text-amber-800"}`}>
              Total Allocation: {getTotalPercentage()}%
              {!is100Allocate && <span className="font-normal ml-2">(Must equal 100%)</span>}
            </div>
          </div>

          {bankAccounts.length < 3 && !is100Allocate && (
            <Button type="button" variant="outline" onClick={addBankAccount} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Account
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" className="px-8" disabled={submitting} onClick={handleDirectDepositSubmit}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Direct Deposit"
          )}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#7c3bed] mb-3" />
            <p className=" text-center w-100 text-[14px] fw-medium">Loading your forms ...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-3" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Forms</h2>
            <p className=" w-100 text-center text-lg">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-3" />
            <h2 className="text-2xl font-semibold mb-[10px]">All Done!</h2>
            <p className=" text-[16px] text-center mb-1">
              Your tax forms and direct deposit information have been submitted successfully.
            </p>
            <p className="text-[16px]  text-center">
              Your HR team has been notified and will process your information.
            </p>
            <p className="text-sm  text-center mt-3">You may close this window.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formConfig) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8 text-[16px]">
          <div
            className={`flex items-center gap-2 ${
              currentStep === "tax_forms" ? "text-[#7c3bed] font-bold" : "text-[#7c3bed]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "tax_forms" ? "bg-[#7c3bed] text-white" : "bg-[#7c3bed] text-white"
              }`}
            >
              {currentStep === "tax_forms" ? "1" : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <span>Tax Forms</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div
            className={`flex items-center gap-2 ${
              currentStep === "direct_deposit" ? "text-[#7c3bed] font-semibold" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "direct_deposit" ? "bg-[#7c3bed] text-white" : "bg-gray-200 "
              }`}
            >
              2
            </div>
            <span>Direct Deposit</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {currentStep === "tax_forms" ? (
              <FileText className="h-8 w-8 text-[#7c3bed]" />
            ) : (
              <CreditCard className="h-8 w-8 text-[#7c3bed]" />
            )}
            <h1 className="text-3xl fw-bolder">
              {currentStep === "tax_forms" ? "Tax Withholding Forms" : "Direct Deposit Setup"}
            </h1>
          </div>
          <p className="text-lg ">{formConfig.company_name}</p>
          <p className="text-[16px]">Employee: {formConfig.candidate?.name}</p>
        </div>

        {currentStep === "tax_forms" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {renderFederalForm()}

            {formConfig.forms.some((f) => f.form_type === "state_withholding") && (
              <>
                <hr className="my-8 border-gray-300" />
                {renderStateForm()}
              </>
            )}

            <hr className="my-8 border-gray-300" />
            {renderSignatureSection()}

            <div className="text-center">
              <Button type="submit" size="lg" className="px-8" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Sign & Continue to Direct Deposit"
                )}
              </Button>
            </div>
          </form>
        )}

        {currentStep === "direct_deposit" && renderDirectDepositForm()}
      </div>
    </div>
  );
}

export default function () {
  return (
    <div className="signatureContainer">
      <div className="text-[#000]">
        <TaxFormPage />
        <MainFooter />
      </div>
    </div>
  );
}
