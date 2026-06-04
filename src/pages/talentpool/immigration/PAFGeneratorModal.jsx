import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../../components/ui/sheet";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Calendar } from "../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { format } from "date-fns";
import {
  FileText,
  CalendarIcon,
  Loader2,
  Download,
  AlertTriangle,
  MapPin,
  DollarSign,
  Building,
  CheckCircle2,
  X,
} from "lucide-react";
import { getPAFPrefill, generatePAF, downloadPAF } from "../../../utils/immigrationDocumentsApiService";
import { toast } from "react-toastify";

const POSTING_METHODS = [
  { value: "electronic", label: "Electronic" },
  { value: "physical", label: "Physical" },
  { value: "both", label: "Both" },
];

function DatePickerField({ label, date, onSelect, required = false }) {
  // ⚠️ This MUST remain yyyy-MM-dd for the HTML input to understand it
  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const handleChange = (e) => {
    const val = e.target.value;

    if (!val) {
      onSelect(null);
      return;
    }

    // The browser will always return yyyy-MM-dd from the event
    const [year, month, day] = val.split("-");
    onSelect(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      <Input
        type="date"
        value={formattedDate}
        onChange={handleChange}
        className="h-9 w-full block"
        required={required}
      />
    </div>
  );
}

export function PAFGeneratorModal({
  open,
  onViewDocument,
  onOpenChange,
  lca,
  candidateEmail,
  step,
  setStep,
  fileLoader,
}) {
  const [prefillData, setPrefillData] = useState(null);
  const [error, setError] = useState(null);
  const [generatedPAF, setGeneratedPAF] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Form state
  const [postingMethod, setPostingMethod] = useState("electronic");
  const [postingStartDate, setPostingStartDate] = useState(null);
  const [postingEndDate, setPostingEndDate] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [customBenefits, setCustomBenefits] = useState([]);
  const [customBenefitInput, setCustomBenefitInput] = useState("");
  const [benefitsSameAsUS, setBenefitsSameAsUS] = useState(true);
  const [wageDeterminationMethod, setWageDeterminationMethod] = useState("");
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [signatureText, setSignatureText] = useState("");

  function DocumentViewer(filename) {
    onViewDocument(filename);
    fileLoader();
  }

  useEffect(() => {
    if (open && lca?.id && candidateEmail) {
      loadPrefill();
    }
  }, [open, lca?.id]);

  // Parse a YYYY-MM-DD string into a local Date (avoids timezone offset issues)
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  };

  const loadPrefill = async () => {
    setStep("loading");
    setError(null);
    try {
      const result = await getPAFPrefill(candidateEmail, lca.id);
      const prefill = result.prefill || result; // API nests data under "prefill"
      setPrefillData(prefill);

      // Apply prefilled posting dates from backend
      setPostingStartDate(parseDateString(prefill.suggested_posting_start));
      setPostingEndDate(parseDateString(prefill.suggested_posting_end));

      // Map default_benefits — use "selected" field from API, default to true if not specified
      if (prefill.default_benefits && Array.isArray(prefill.default_benefits)) {
        setBenefits(prefill.default_benefits.map((b) => ({ ...b, checked: b.selected !== false })));
      }
      setCustomBenefits([]);
      setCustomBenefitInput("");

      if (prefill.wage_determination_method) {
        setWageDeterminationMethod(prefill.wage_determination_method);
      }

      // Prefill required signatory fields so Generate button is not blocked
      const suggestedSignatoryName = prefill?.lca?.employer_contact_name || prefill?.employer?.contact_name || "";
      const suggestedSignatoryTitle = prefill?.lca?.employer_contact_title || prefill?.employer?.contact_title || "";
      setSignatoryName(suggestedSignatoryName);
      setSignatoryTitle(suggestedSignatoryTitle);
      setSignatureText(suggestedSignatoryName);

      setStep("form");
    } catch (err) {
      console.error("PAF prefill error:", err);
      setError("Failed to load PAF data. Please try again.");
      setStep("form");
    }
  };

  const handleGenerate = async () => {
    if (!signatoryName || !signatoryTitle) {
      toast.error("Signatory name and title are required.");
      return;
    }

    setStep("generating");
    try {
      const pafData = {
        posting_method: postingMethod,
        posting_start_date: postingStartDate ? format(postingStartDate, "yyyy-MM-dd") : null,
        posting_end_date: postingEndDate ? format(postingEndDate, "yyyy-MM-dd") : null,
        posting_locations: [],
        benefits: [
          ...benefits.filter((b) => b.checked).map(({ checked, ...rest }) => rest),
          ...customBenefits.map((label) => ({ key: label.toLowerCase().replace(/\s+/g, "_"), label })),
        ],
        benefits_same_as_us_workers: benefitsSameAsUS,
        wage_determination_method: wageDeterminationMethod,
        signatory_name: signatoryName,
        signatory_title: signatoryTitle,
        signature_text: signatureText || signatoryName,
      };

      const result = await generatePAF(candidateEmail, lca.id, pafData);
      if (result.success) {
        setGeneratedPAF(result);
        setStep("success");
        toast.success(`PAF for ${result.lca_case_number || lca.case_number} created successfully.`);
      } else {
        throw new Error(result.error || "Failed to generate PAF");
      }
    } catch (err) {
      console.error("PAF generate error:", err);
      toast.error(err.message || "Failed to generate PAF.");
      setStep("form");
    }
  };

  // const handleDownload = async () => {
  //   if (!generatedPAF?.paf_id) return;
  //   setDownloading(true);
  //   try {
  //     const result = await downloadPAF(candidateEmail, generatedPAF.paf_id);
  //     if (result.download_url) {
  //       window.open(result.download_url, "_blank");
  //     } else {
  //       throw new Error("No download URL returned");
  //     }
  //   } catch (err) {
  //     console.error("PAF download error:", err);
  //     toast.error("Failed to download PAF.");
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  const handleClose = () => {
    onOpenChange(false);
    setStep("");
    // Reset state after close animation
    setTimeout(() => {
      // setStep("loading");
      setPrefillData(null);
      setError(null);
      setGeneratedPAF(null);
      setSignatoryName("");
      setSignatoryTitle("");
      setSignatureText("");
      setCustomBenefits([]);
      setCustomBenefitInput("");
    }, 300);
  };

  const toggleBenefit = (index) => {
    setBenefits((prev) => prev.map((b, i) => (i === index ? { ...b, checked: !b.checked } : b)));
  };

  const addCustomBenefit = () => {
    const val = customBenefitInput.trim();
    if (val && !customBenefits.includes(val)) {
      setCustomBenefits((prev) => [...prev, val]);
      setCustomBenefitInput("");
    }
  };

  const removeCustomBenefit = (index) => {
    setCustomBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const lcaInfo = prefillData?.lca || lca;
  const worksites = prefillData?.worksites || lca?.worksites || [];
  const oflcWages = prefillData?.oflc_per_worksite || prefillData?.oflc_wages || [];

  return (
    <>
      {step === "loading" ? (
        <></>
      ) : (
        <>
          {step === "" ? (
            <></>
          ) : (
            <>
              {step === "success" ? (
                <>
                  <Dialog open={open} onOpenChange={handleClose}>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {step === "success" ? "PAF Generated Successfully" : "Generate Public Access File (PAF)"}
                        </DialogTitle>
                        <DialogDescription>
                          {step === "success"
                            ? `PAF for LCA ${generatedPAF?.lca_case_number || lca?.case_number} has been generated.`
                            : `Create a PAF for LCA ${lca?.case_number || "—"}`}
                        </DialogDescription>
                      </DialogHeader>
                      {step === "success" && (
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-3 !p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-emerald-800">PAF Created Successfully</p>
                              <p className="text-sm text-emerald-700 mt-0.5">
                                Document: {generatedPAF?.document_file_name}
                              </p>
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={handleClose}>
                              Close
                            </Button>
                            <Button
                              onClick={() => {
                                DocumentViewer(generatedPAF?.document_file_name);
                                handleClose();
                              }}
                              disabled={downloading}
                            >
                              {downloading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              Download PAF
                            </Button>
                          </DialogFooter>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <>
                  <Sheet open={open} onOpenChange={handleClose}>
                    <SheetContent className="sm:max-w-lg">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#7c3bed]" />
                          {step === "success" ? "PAF Generated Successfully" : "Generate Public Access File (PAF)"}
                        </SheetTitle>
                        <SheetDescription className="mt-1">
                          {step === "success"
                            ? `PAF for LCA ${generatedPAF?.lca_case_number || lca?.case_number} has been generated.`
                            : `Create a PAF for LCA ${lca?.case_number || "—"}`}
                        </SheetDescription>
                      </SheetHeader>

                      {step === "success" && (
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-3 !p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-emerald-800">PAF Created Successfully</p>
                              <p className="text-sm text-emerald-700 mt-0.5">
                                Document: {generatedPAF?.document_file_name}
                              </p>
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={handleClose}>
                              Close
                            </Button>
                            <Button
                              onClick={() => {
                                DocumentViewer(generatedPAF?.document_file_name);
                                handleClose();
                              }}
                              disabled={downloading}
                            >
                              {downloading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              Download PAF
                            </Button>
                          </DialogFooter>
                        </div>
                      )}

                      {step === "generating" && (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="ml-3 text-muted-foreground">Generating PAF document...</span>
                        </div>
                      )}

                      {step === "form" && (
                        <>
                          <ScrollArea className="flex-1 pr-4 -mr-4 max-h-[calc(100vh-185px)] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] hover:[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full mt-3">
                            <div className="space-y-5 pb-2">
                              {error && (
                                <Alert variant="destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>{error}</AlertDescription>
                                </Alert>
                              )}

                              {prefillData?.existing_paf && (
                                <Alert>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    An active PAF already exists for this LCA. Generating a new one will supersede it.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* LCA Summary (Read-only) */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                  LCA Summary
                                </h4>
                                <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-xs text-muted-foreground block">Case Number</span>
                                    {lcaInfo?.case_number || "—"}
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground block">Job Title</span>
                                    {lcaInfo?.job_title || "—"}
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground block">Employer</span>
                                    {lcaInfo?.employer_name || "—"}
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground block">SOC Code</span>
                                    {lcaInfo?.soc_code || "—"} {lcaInfo?.soc_title ? `— ${lcaInfo.soc_title}` : ""}
                                  </div>
                                </div>
                              </div>

                              {/* Worksites & OFLC Wages */}
                              {worksites.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Worksites
                                  </h4>
                                  <div className="space-y-1">
                                    {worksites.map((ws, i) => (
                                      <div
                                        key={i}
                                        className="bg-muted/20 rounded p-2 flex items-center justify-between text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span>
                                            {ws.worksite_name || ws.city || "Worksite"}
                                            {ws.city && `, ${ws.state}`}
                                          </span>
                                          {ws.is_primary && (
                                            <Badge variant="outline" className="text-[10px]">
                                              Primary
                                            </Badge>
                                          )}
                                        </div>
                                        {oflcWages[i] && (
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            OFLC: ${oflcWages[i]?.prevailing_wage?.toLocaleString() || "—"}/yr
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Separator />

                              {/* Posting Details */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium">Posting Details</h4>
                                <div className="flex flex-col gap-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Posting Method
                                    </Label>
                                    <Select value={postingMethod} onValueChange={setPostingMethod}>
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {POSTING_METHODS.map((m) => (
                                          <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <DatePickerField
                                    label="Posting Start"
                                    date={postingStartDate}
                                    onSelect={setPostingStartDate}
                                    className="z-[999999]"
                                    required
                                  />
                                  <DatePickerField
                                    label="Posting End"
                                    date={postingEndDate}
                                    onSelect={setPostingEndDate}
                                    required
                                  />
                                </div>
                              </div>

                              <Separator />

                              {/* Benefits */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">Benefits</h4>
                                  <div className="flex items-center gap-2">
                                    <Switch checked={benefitsSameAsUS} onCheckedChange={setBenefitsSameAsUS} />
                                    <span className="text-xs text-muted-foreground">Same as US workers</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                                  {benefits.map((b, i) => (
                                    <label
                                      key={b.key || i}
                                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 rounded p-1.5"
                                    >
                                      <Checkbox checked={b.checked} onCheckedChange={() => toggleBenefit(i)} />
                                      <span className="text-xs">{b.label}</span>
                                    </label>
                                  ))}
                                </div>
                                {benefits.length === 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    No default benefits loaded. The PAF will use standard defaults.
                                  </p>
                                )}

                                {/* Custom Benefits */}
                                {customBenefits.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {customBenefits.map((cb, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                                        {cb}
                                        <button
                                          onClick={() => removeCustomBenefit(i)}
                                          className="ml-1 hover:text-destructive bg-transparent h-[16px]"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                  <Input
                                    value={customBenefitInput}
                                    onChange={(e) => setCustomBenefitInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomBenefit();
                                      }
                                    }}
                                    className="h-8 text-sm flex-1"
                                    placeholder="Add custom benefit..."
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={addCustomBenefit}
                                    disabled={!customBenefitInput.trim()}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>

                              <Separator />

                              {/* Wage Determination */}
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Wage Determination Method
                                </Label>
                                <Textarea
                                  value={wageDeterminationMethod}
                                  onChange={(e) => setWageDeterminationMethod(e.target.value)}
                                  placeholder="Based on employee experience, qualifications, education, and market rate..."
                                  className="min-h-[60px] text-sm"
                                />
                              </div>

                              <Separator />

                              {/* Signatory */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium">Signatory Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Signatory Name<span className="text-destructive ml-0.5">*</span>
                                    </Label>
                                    <Input
                                      value={signatoryName}
                                      onChange={(e) => setSignatoryName(e.target.value)}
                                      className="h-9"
                                      placeholder="John Smith"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Signatory Title<span className="text-destructive ml-0.5">*</span>
                                    </Label>
                                    <Input
                                      value={signatoryTitle}
                                      onChange={(e) => setSignatoryTitle(e.target.value)}
                                      className="h-9"
                                      placeholder="HR Director"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Digital Signature (typed)
                                  </Label>
                                  <Input
                                    value={signatureText}
                                    onChange={(e) => setSignatureText(e.target.value)}
                                    className="h-9 font-serif italic"
                                    placeholder={signatoryName || "Type signatory name as signature"}
                                  />
                                  <p className="text-[11px] text-muted-foreground">
                                    Leave blank to use signatory name as signature.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>

                          <DialogFooter className="gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleClose}>
                              Cancel
                            </Button>
                            <Button onClick={handleGenerate} disabled={!signatoryName || !signatoryTitle}>
                              <FileText className="h-4 w-4 mr-2" />
                              Generate PAF
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
