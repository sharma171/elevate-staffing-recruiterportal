import * as React from "react";

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="signatureContainer relative w-full overflow-auto">
    <table ref={ref} className={`w-full caption-bottom text-sm ${className || ""}`.trim()} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b border-[#e7e7ef] ${className || ""}`.trim()} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className || ""}`.trim()} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b border-[#e7e7ef]-0 ${className || ""}`.trim()}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b border-[#e7e7ef] transition-colors hover:bg-[#f1f1f980] data-[state=selected]:bg-[#f1f1f980] ${className || ""}`.trim()}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 !px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ""}`.trim()}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`p-[13px] align-middle [&:has([role=checkbox])]:pr-0 ${className || ""}`.trim()}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={`mt-4 text-sm text-muted-foreground ${className || ""}`.trim()} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
