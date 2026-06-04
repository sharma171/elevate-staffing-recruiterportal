import { Card, CardContent } from "../../../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Badge } from "../../../components/ui/badge";
import { COUNTRIES } from "./constants";

const DisplayField = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-foreground">{value?.toString() || "—"}</dd>
  </div>
);

const getEmptyL1Data = () => ({
  l1_type: "L1B",
  l1_petition_type: "initial",
  is_blanket_l: false,
  receipt_number: "",
  petition_filed_date: "",
  validity_start_date: "",
  validity_end_date: "",
  foreign_employer_name: "",
  foreign_employer_country: "",
  foreign_employer_address: "",
  qualifying_relationship: "subsidiary",
  foreign_employment_start: "",
  foreign_employment_end: "",
  foreign_job_title: "",
  us_employer_name: "",
  us_employer_relationship: "subsidiary",
});

export function L1Section({ data, isEditing, onChange }) {
  const effectiveData = data || (isEditing ? getEmptyL1Data() : null);

  if (!data && !isEditing) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No L-1 information available.</CardContent>
      </Card>
    );
  }

  const getCountryName = (code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    return country?.name || code;
  };

  return (
    <div className="!space-y-4">
      <Accordion type="multiple" defaultValue={["petition", "organization"]} className="!space-y-4">
        <AccordionItem value="petition" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-medium">L-1 Petition Details</span>
              <Badge variant="outline" className="text-xs">
                {data.l1_type}
              </Badge>
              {data.is_blanket_l && <Badge className="bg-blue-100 text-blue-800 text-xs">Blanket L</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
              <DisplayField
                label="L-1 Type"
                value={data.l1_type === "L1A" ? "L-1A (Manager/Executive)" : "L-1B (Specialized Knowledge)"}
              />
              <DisplayField label="Petition Type" value={data.l1_petition_type} />
              <DisplayField label="Blanket L" value={data.is_blanket_l ? "Yes" : "No"} />
              {data.is_blanket_l && (
                <DisplayField label="Blanket Petition Number" value={data.blanket_petition_number} />
              )}
              <DisplayField label="Receipt Number" value={data.receipt_number} />
              <DisplayField
                label="Filed Date"
                value={data.petition_filed_date ? new Date(data.petition_filed_date).toLocaleDateString() : undefined}
              />
              <DisplayField
                label="Approval Date"
                value={data.approval_date ? new Date(data.approval_date).toLocaleDateString() : undefined}
              />
              <DisplayField
                label="Validity Start"
                value={data.validity_start_date ? new Date(data.validity_start_date).toLocaleDateString() : undefined}
              />
              <DisplayField
                label="Validity End"
                value={data.validity_end_date ? new Date(data.validity_end_date).toLocaleDateString() : undefined}
              />
              {data.time_in_l1_status && (
                <DisplayField label="Time in L-1 Status" value={`${data.time_in_l1_status} months`} />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="organization" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Qualifying Organization</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
              <DisplayField label="Foreign Employer" value={data.foreign_employer_name} />
              <DisplayField label="Country" value={getCountryName(data.foreign_employer_country)} />
              <div className="col-span-2">
                <DisplayField label="Foreign Address" value={data.foreign_employer_address} />
              </div>
              <DisplayField label="Relationship" value={data.qualifying_relationship} />
              <DisplayField
                label="Foreign Employment Start"
                value={
                  data.foreign_employment_start
                    ? new Date(data.foreign_employment_start).toLocaleDateString()
                    : undefined
                }
              />
              <DisplayField
                label="Foreign Employment End"
                value={
                  data.foreign_employment_end ? new Date(data.foreign_employment_end).toLocaleDateString() : undefined
                }
              />
              <DisplayField label="Foreign Job Title" value={data.foreign_job_title} />
              <DisplayField label="US Employer" value={data.us_employer_name} />
              <DisplayField label="US Relationship" value={data.us_employer_relationship} />
              {data.foreign_job_duties && (
                <div className="col-span-2 md:col-span-4">
                  <DisplayField label="Foreign Job Duties" value={data.foreign_job_duties} />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {data.l1_type === "L1A" && (
          <AccordionItem value="l1a" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-medium">L-1A Manager/Executive Details</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
                <DisplayField label="Manager Type" value={data.manager_type?.replace(/_/g, " ")} />
                {data.manager_type === "personnel_manager" && (
                  <DisplayField label="Employees Supervised" value={data.employees_supervised} />
                )}
                {data.manager_type === "function_manager" && data.functions_managed && (
                  <div className="col-span-2 md:col-span-4">
                    <DisplayField label="Functions Managed" value={data.functions_managed} />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {data.l1_type === "L1B" && (
          <AccordionItem value="l1b" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-medium">L-1B Specialized Knowledge Details</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
                <DisplayField label="Knowledge Type" value={data.specialized_knowledge_type} />
                {data.knowledge_description && (
                  <div className="col-span-2 md:col-span-4">
                    <DisplayField label="Knowledge Description" value={data.knowledge_description} />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
